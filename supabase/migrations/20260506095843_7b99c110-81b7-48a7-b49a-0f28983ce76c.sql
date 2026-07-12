-- =========================================================
-- 1. ENUM des rôles
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('global_admin', 'admin', 'editor', 'viewer');

-- =========================================================
-- 2. Trigger générique updated_at
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- 3. Table profiles
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 4. Table user_roles
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

-- =========================================================
-- 5. Table permissions (resource × action)
-- =========================================================
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create','read','update','delete')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (resource, action)
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 6. Table role_permissions
-- =========================================================
CREATE TABLE public.role_permissions (
  role public.app_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role, permission_id)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 7. Table audit_logs
-- =========================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource);

-- =========================================================
-- 8. Security-definer functions
-- =========================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _resource TEXT, _action TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = _user_id
      AND p.resource = _resource
      AND p.action = _action
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND is_active = true AND is_suspended = false
  );
$$;

-- =========================================================
-- 9. Trigger handle_new_user (profil + premier admin auto)
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INT;
BEGIN
  INSERT INTO public.profiles (id, name, email, must_change_password)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false)
  );

  SELECT COUNT(*) INTO user_count FROM public.profiles;

  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'global_admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- 10. Helper de logging
-- =========================================================
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action TEXT,
  _resource TEXT,
  _resource_id TEXT DEFAULT NULL,
  _details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
  uid UUID;
  uemail TEXT;
BEGIN
  uid := auth.uid();
  SELECT email INTO uemail FROM public.profiles WHERE id = uid;

  INSERT INTO public.audit_logs (user_id, user_email, action, resource, resource_id, details)
  VALUES (uid, uemail, _action, _resource, _resource_id, _details)
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;

-- =========================================================
-- 11. RLS Policies
-- =========================================================

-- profiles
CREATE POLICY "Profiles: own read"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Profiles: global_admin read all"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'));

CREATE POLICY "Profiles: own update"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND is_suspended = false);

CREATE POLICY "Profiles: global_admin update all"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'))
WITH CHECK (public.has_role(auth.uid(), 'global_admin'));

CREATE POLICY "Profiles: global_admin delete"
ON public.profiles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'));

-- user_roles
CREATE POLICY "Roles: own read"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Roles: global_admin read all"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'));

CREATE POLICY "Roles: global_admin manage"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'))
WITH CHECK (public.has_role(auth.uid(), 'global_admin'));

-- permissions
CREATE POLICY "Permissions: authenticated read"
ON public.permissions FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Permissions: global_admin manage"
ON public.permissions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'))
WITH CHECK (public.has_role(auth.uid(), 'global_admin'));

-- role_permissions
CREATE POLICY "RolePerms: authenticated read"
ON public.role_permissions FOR SELECT TO authenticated
USING (true);

CREATE POLICY "RolePerms: global_admin manage"
ON public.role_permissions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'))
WITH CHECK (public.has_role(auth.uid(), 'global_admin'));

-- audit_logs
CREATE POLICY "Audit: own read"
ON public.audit_logs FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Audit: global_admin read all"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'global_admin'));

CREATE POLICY "Audit: authenticated insert own"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- 12. Seed permissions + role_permissions
-- =========================================================
INSERT INTO public.permissions (resource, action, description) VALUES
  ('site',      'read',   'Lire le contenu global du site'),
  ('site',      'update', 'Modifier le contenu global'),
  ('resources', 'create', 'Ajouter une ressource'),
  ('resources', 'read',   'Consulter les ressources'),
  ('resources', 'update', 'Modifier une ressource'),
  ('resources', 'delete', 'Supprimer une ressource'),
  ('scripts',   'create', 'Créer un script'),
  ('scripts',   'read',   'Consulter les scripts'),
  ('scripts',   'update', 'Modifier un script'),
  ('scripts',   'delete', 'Supprimer un script'),
  ('users',     'create', 'Créer un administrateur'),
  ('users',     'read',   'Consulter les administrateurs'),
  ('users',     'update', 'Modifier un administrateur'),
  ('users',     'delete', 'Supprimer un administrateur'),
  ('contact',   'read',   'Lire les demandes de contact'),
  ('contact',   'update', 'Traiter les demandes de contact'),
  ('contact',   'delete', 'Supprimer les demandes de contact'),
  ('logs',      'read',   'Consulter les logs et audits'),
  ('profile',   'read',   'Lire son profil'),
  ('profile',   'update', 'Modifier son profil');

-- global_admin → toutes les permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'global_admin'::public.app_role, id FROM public.permissions;

-- admin → tout sauf gestion users
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::public.app_role, id FROM public.permissions
WHERE resource <> 'users';

-- editor → lecture/édition scripts + ressources + profil
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'editor'::public.app_role, id FROM public.permissions
WHERE (resource = 'scripts' AND action IN ('create','read','update'))
   OR (resource = 'resources' AND action IN ('create','read','update'))
   OR (resource = 'profile')
   OR (resource = 'site' AND action = 'read');

-- viewer → lecture seule
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'viewer'::public.app_role, id FROM public.permissions
WHERE action = 'read' AND resource IN ('scripts','resources','site','profile');