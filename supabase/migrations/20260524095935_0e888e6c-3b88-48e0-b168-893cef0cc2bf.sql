
-- Contact messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  phone TEXT,
  company TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contact: public insert"
ON public.contact_messages FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Contact: admin read"
ON public.contact_messages FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'global_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Contact: admin update"
ON public.contact_messages FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'global_admin') OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'global_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Contact: admin delete"
ON public.contact_messages FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'global_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_contact_messages_updated
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Likes & Shares
ALTER TABLE public.scripts
  ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shares_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.script_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(script_id, user_id)
);

ALTER TABLE public.script_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes: public read" ON public.script_likes
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Likes: own insert" ON public.script_likes
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Likes: own delete" ON public.script_likes
FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.script_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL,
  user_id UUID,
  channel TEXT NOT NULL DEFAULT 'link',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.script_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shares: public read" ON public.script_shares
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Shares: public insert" ON public.script_shares
FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Triggers maintaining counters
CREATE OR REPLACE FUNCTION public.bump_script_likes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.scripts SET likes_count = likes_count + 1 WHERE id = NEW.script_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.scripts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.script_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_script_likes_count
AFTER INSERT OR DELETE ON public.script_likes
FOR EACH ROW EXECUTE FUNCTION public.bump_script_likes();

CREATE OR REPLACE FUNCTION public.bump_script_shares()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.scripts SET shares_count = shares_count + 1 WHERE id = NEW.script_id;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_script_shares_count
AFTER INSERT ON public.script_shares
FOR EACH ROW EXECUTE FUNCTION public.bump_script_shares();
