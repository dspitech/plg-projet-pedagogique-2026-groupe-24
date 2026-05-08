
-- Enums
CREATE TYPE public.script_status AS ENUM ('draft', 'active', 'inactive', 'archived', 'deprecated');
CREATE TYPE public.script_criticality AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.script_visibility AS ENUM ('public', 'private');
CREATE TYPE public.script_type AS ENUM (
  'powershell','bash','python','azure_cli','aws_cli','terraform','bicep','arm','cloudformation','ansible','kubernetes','docker','sql','javascript','typescript','go','ruby','perl','yaml','json','other'
);

CREATE TABLE public.scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  script_type public.script_type NOT NULL DEFAULT 'powershell',
  content TEXT NOT NULL DEFAULT '',
  features TEXT,
  prerequisites TEXT,
  usage_example TEXT,
  screenshots TEXT[] NOT NULL DEFAULT '{}',
  criticality public.script_criticality NOT NULL DEFAULT 'medium',
  version TEXT NOT NULL DEFAULT '1.0.0',
  status public.script_status NOT NULL DEFAULT 'draft',
  tags TEXT[] NOT NULL DEFAULT '{}',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id UUID,
  license TEXT,
  language TEXT,
  compatibility TEXT,
  dependencies TEXT,
  documentation TEXT,
  version_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  downloads_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  favorites_count INTEGER NOT NULL DEFAULT 0,
  visibility public.script_visibility NOT NULL DEFAULT 'private',
  is_validated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scripts_category ON public.scripts(category_id);
CREATE INDEX idx_scripts_author ON public.scripts(author_id);
CREATE INDEX idx_scripts_status ON public.scripts(status);
CREATE INDEX idx_scripts_tags ON public.scripts USING GIN(tags);

ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scripts: read public or own or staff"
ON public.scripts FOR SELECT
TO authenticated
USING (
  visibility = 'public'
  OR author_id = auth.uid()
  OR has_role(auth.uid(), 'global_admin'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'editor'::app_role)
);

CREATE POLICY "Scripts: editor insert"
ON public.scripts FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'global_admin'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'editor'::app_role)
);

CREATE POLICY "Scripts: editor or owner update"
ON public.scripts FOR UPDATE
TO authenticated
USING (
  author_id = auth.uid()
  OR has_role(auth.uid(), 'global_admin'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'editor'::app_role)
)
WITH CHECK (
  author_id = auth.uid()
  OR has_role(auth.uid(), 'global_admin'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'editor'::app_role)
);

CREATE POLICY "Scripts: admin delete"
ON public.scripts FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'global_admin'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE TRIGGER scripts_updated_at
BEFORE UPDATE ON public.scripts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
