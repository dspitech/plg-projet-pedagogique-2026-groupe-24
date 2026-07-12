
-- Enums for resources
DO $$ BEGIN
  CREATE TYPE public.resource_type AS ENUM ('link','document','file','video','image','repository','other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.resource_status AS ENUM ('draft','active','archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.resource_visibility AS ENUM ('public','private');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.resource_criticality AS ENUM ('low','medium','high','critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  resource_type public.resource_type NOT NULL DEFAULT 'link',
  url TEXT,
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  visibility public.resource_visibility NOT NULL DEFAULT 'public',
  status public.resource_status NOT NULL DEFAULT 'active',
  criticality public.resource_criticality NOT NULL DEFAULT 'medium',
  language TEXT,
  author_id UUID,
  views_count INTEGER NOT NULL DEFAULT 0,
  downloads_count INTEGER NOT NULL DEFAULT 0,
  favorites_count INTEGER NOT NULL DEFAULT 0,
  version TEXT NOT NULL DEFAULT '1.0.0',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resources_author ON public.resources(author_id);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON public.resources USING GIN(tags);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resources: read public or own or staff"
  ON public.resources FOR SELECT TO authenticated
  USING (
    visibility = 'public'
    OR author_id = auth.uid()
    OR has_role(auth.uid(),'global_admin')
    OR has_role(auth.uid(),'admin')
    OR has_role(auth.uid(),'editor')
  );

CREATE POLICY "Resources: editor insert"
  ON public.resources FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(),'global_admin')
    OR has_role(auth.uid(),'admin')
    OR has_role(auth.uid(),'editor')
  );

CREATE POLICY "Resources: editor or owner update"
  ON public.resources FOR UPDATE TO authenticated
  USING (
    author_id = auth.uid()
    OR has_role(auth.uid(),'global_admin')
    OR has_role(auth.uid(),'admin')
    OR has_role(auth.uid(),'editor')
  )
  WITH CHECK (
    author_id = auth.uid()
    OR has_role(auth.uid(),'global_admin')
    OR has_role(auth.uid(),'admin')
    OR has_role(auth.uid(),'editor')
  );

CREATE POLICY "Resources: admin delete"
  ON public.resources FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(),'global_admin')
    OR has_role(auth.uid(),'admin')
  );

CREATE TRIGGER resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for uploaded resource files (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources','resources', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Resources files: authenticated read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resources');

CREATE POLICY "Resources files: authenticated upload own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Resources files: owner update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Resources files: owner delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public helper: does any global_admin exist?
CREATE OR REPLACE FUNCTION public.global_admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'global_admin');
$$;

GRANT EXECUTE ON FUNCTION public.global_admin_exists() TO anon, authenticated;
