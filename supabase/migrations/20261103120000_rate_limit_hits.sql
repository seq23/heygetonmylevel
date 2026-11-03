-- 3 Nov 2026 security audit: paid edge functions (AI gateway, Resend) had no rate
-- limit. Counters for supabase/functions/_shared/guard.ts. Additive only.
-- Only the service role (edge functions) can touch them; RLS on with no policies.
CREATE TABLE IF NOT EXISTS public.rate_limit_hits (
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);
ALTER TABLE public.rate_limit_hits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limit_hits FROM anon, authenticated;

-- Atomically counts one hit in the current fixed window and returns the new total.
-- Rows older than 2 days are pruned on the first hit of each new day window.
CREATE OR REPLACE FUNCTION public.rate_limit_hit(p_bucket text, p_window_seconds integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  w timestamptz := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);
  n integer;
BEGIN
  INSERT INTO public.rate_limit_hits (bucket, window_start, hits) VALUES (p_bucket, w, 1)
  ON CONFLICT (bucket, window_start) DO UPDATE SET hits = public.rate_limit_hits.hits + 1
  RETURNING hits INTO n;
  IF n = 1 AND p_window_seconds >= 86400 AND p_bucket LIKE '%:global:d' THEN
    DELETE FROM public.rate_limit_hits WHERE window_start < now() - interval '2 days';
  END IF;
  RETURN n;
END $$;

REVOKE ALL ON FUNCTION public.rate_limit_hit(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rate_limit_hit(text, integer) TO service_role;
