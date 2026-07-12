
-- 1. Contact: revoke public insert (will go through edge function)
DROP POLICY IF EXISTS "Contact: public insert" ON public.contact_messages;
REVOKE INSERT ON public.contact_messages FROM anon;

-- 2. script_shares: add ip_address, tighten policy, rate-limit trigger
ALTER TABLE public.script_shares ADD COLUMN IF NOT EXISTS ip_address text;

DROP POLICY IF EXISTS "Shares: public insert" ON public.script_shares;
CREATE POLICY "Shares: public insert" ON public.script_shares
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.scripts s WHERE s.id = script_id AND s.visibility = 'public')
  );

CREATE OR REPLACE FUNCTION public.guard_share_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  headers jsonb;
  client_ip text;
BEGIN
  IF NEW.ip_address IS NULL THEN
    BEGIN
      headers := NULLIF(current_setting('request.headers', true), '')::jsonb;
    EXCEPTION WHEN others THEN headers := NULL;
    END;
    client_ip := split_part(
      COALESCE(headers->>'x-forwarded-for', headers->>'cf-connecting-ip', headers->>'x-real-ip', ''),
      ',', 1
    );
    NEW.ip_address := NULLIF(btrim(client_ip), '');
  END IF;

  IF NEW.ip_address IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.script_shares
    WHERE script_id = NEW.script_id
      AND ip_address = NEW.ip_address
      AND created_at > now() - interval '5 minutes'
  ) THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_guard_share_rate ON public.script_shares;
CREATE TRIGGER trg_guard_share_rate
  BEFORE INSERT ON public.script_shares
  FOR EACH ROW EXECUTE FUNCTION public.guard_share_rate();

-- 3. script_likes: tighten WITH CHECK
DROP POLICY IF EXISTS "Likes: own insert" ON public.script_likes;
CREATE POLICY "Likes: own insert" ON public.script_likes
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.scripts s WHERE s.id = script_id AND s.visibility = 'public')
  );

-- 4. Length constraints on scripts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scripts_content_len') THEN
    ALTER TABLE public.scripts ADD CONSTRAINT scripts_content_len CHECK (content IS NULL OR length(content) <= 200000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scripts_doc_len') THEN
    ALTER TABLE public.scripts ADD CONSTRAINT scripts_doc_len CHECK (documentation IS NULL OR length(documentation) <= 100000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scripts_desc_len') THEN
    ALTER TABLE public.scripts ADD CONSTRAINT scripts_desc_len CHECK (description IS NULL OR length(description) <= 5000);
  END IF;
END $$;

-- 5. Secure RPC: increment views of a public script (+1 max, public only)
CREATE OR REPLACE FUNCTION public.increment_script_views(_script_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.scripts
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = _script_id AND visibility = 'public';
END $$;

REVOKE ALL ON FUNCTION public.increment_script_views(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.increment_script_views(uuid) TO anon, authenticated;
