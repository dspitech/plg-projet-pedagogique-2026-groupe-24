
-- Guest users table for anonymous interactions
CREATE TABLE public.guest_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pseudo TEXT NOT NULL,
  pseudo_lower TEXT GENERATED ALWAYS AS (lower(pseudo)) STORED UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pseudo_length CHECK (char_length(pseudo) >= 6 AND char_length(pseudo) <= 30),
  CONSTRAINT pseudo_format CHECK (pseudo ~ '^[A-Za-z0-9_.-]+$')
);

GRANT SELECT ON public.guest_users TO anon, authenticated;
GRANT ALL ON public.guest_users TO service_role;
ALTER TABLE public.guest_users ENABLE ROW LEVEL SECURITY;

-- No direct writes from clients; go through RPC
CREATE POLICY "guest_users: read pseudo availability"
  ON public.guest_users FOR SELECT
  TO anon, authenticated
  USING (true);

-- Add guest_id columns to interactions
ALTER TABLE public.script_likes ADD COLUMN guest_id UUID REFERENCES public.guest_users(id) ON DELETE CASCADE;
ALTER TABLE public.script_likes ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.script_likes ADD CONSTRAINT likes_actor_present CHECK (user_id IS NOT NULL OR guest_id IS NOT NULL);
CREATE UNIQUE INDEX script_likes_guest_unique ON public.script_likes(script_id, guest_id) WHERE guest_id IS NOT NULL;
CREATE UNIQUE INDEX script_likes_user_unique ON public.script_likes(script_id, user_id) WHERE user_id IS NOT NULL;

ALTER TABLE public.script_shares ADD COLUMN guest_id UUID REFERENCES public.guest_users(id) ON DELETE SET NULL;

-- Allow anon likes when tied to a guest_id
CREATE POLICY "Likes: guest insert"
  ON public.script_likes FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    guest_id IS NOT NULL
    AND user_id IS NULL
    AND EXISTS (SELECT 1 FROM public.scripts s WHERE s.id = script_id AND s.visibility = 'public')
  );

CREATE POLICY "Likes: guest delete"
  ON public.script_likes FOR DELETE
  TO anon, authenticated
  USING (guest_id IS NOT NULL);

-- RPC to register a guest pseudo (validates + prevents duplicates, rate-limited by IP)
CREATE OR REPLACE FUNCTION public.register_guest(_pseudo TEXT)
RETURNS TABLE(id UUID, pseudo TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean TEXT;
  headers JSONB;
  client_ip TEXT;
  ua TEXT;
  new_id UUID;
  recent_count INT;
BEGIN
  clean := btrim(_pseudo);
  IF clean IS NULL OR char_length(clean) < 6 THEN
    RAISE EXCEPTION 'pseudo_too_short' USING ERRCODE = 'check_violation';
  END IF;
  IF char_length(clean) > 30 THEN
    RAISE EXCEPTION 'pseudo_too_long' USING ERRCODE = 'check_violation';
  END IF;
  IF clean !~ '^[A-Za-z0-9_.-]+$' THEN
    RAISE EXCEPTION 'pseudo_invalid_chars' USING ERRCODE = 'check_violation';
  END IF;

  BEGIN
    headers := NULLIF(current_setting('request.headers', true), '')::jsonb;
  EXCEPTION WHEN others THEN headers := NULL;
  END;
  client_ip := NULLIF(btrim(split_part(
    COALESCE(headers->>'x-forwarded-for', headers->>'cf-connecting-ip', headers->>'x-real-ip', ''),
    ',', 1)), '');
  ua := headers->>'user-agent';

  -- Rate limit: max 5 new guests per IP per hour
  IF client_ip IS NOT NULL THEN
    SELECT COUNT(*) INTO recent_count
    FROM public.guest_users
    WHERE ip_address = client_ip AND created_at > now() - interval '1 hour';
    IF recent_count >= 5 THEN
      RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM public.guest_users WHERE pseudo_lower = lower(clean)) THEN
    RAISE EXCEPTION 'pseudo_taken' USING ERRCODE = 'unique_violation';
  END IF;

  INSERT INTO public.guest_users (pseudo, ip_address, user_agent)
  VALUES (clean, client_ip, ua)
  RETURNING guest_users.id INTO new_id;

  RETURN QUERY SELECT new_id, clean;
END $$;

GRANT EXECUTE ON FUNCTION public.register_guest(TEXT) TO anon, authenticated;

-- Availability check
CREATE OR REPLACE FUNCTION public.is_pseudo_available(_pseudo TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.guest_users WHERE pseudo_lower = lower(btrim(_pseudo)));
$$;
GRANT EXECUTE ON FUNCTION public.is_pseudo_available(TEXT) TO anon, authenticated;

-- Touch last_seen when guest interacts
CREATE OR REPLACE FUNCTION public.touch_guest_last_seen()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.guest_id IS NOT NULL THEN
    UPDATE public.guest_users SET last_seen_at = now() WHERE id = NEW.guest_id;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER touch_guest_on_like AFTER INSERT ON public.script_likes
  FOR EACH ROW EXECUTE FUNCTION public.touch_guest_last_seen();
CREATE TRIGGER touch_guest_on_share AFTER INSERT ON public.script_shares
  FOR EACH ROW EXECUTE FUNCTION public.touch_guest_last_seen();

-- Also allow guest_id on shares insert (existing policy already permits anon insert; extend check)
-- No change needed since existing policy WITH CHECK allows insert as long as script is public.
