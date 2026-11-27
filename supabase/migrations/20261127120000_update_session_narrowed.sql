-- 23 Nov 2026 security audit (row heygetonmylevel #2): update_session(uuid, ...) is
-- granted to anon, so anyone holding a session id can change that session's scores
-- and flags. The app has no sign-in (anonymous by design), so auth.uid() is NULL for
-- every caller and an ownership check cannot tell the creator from a stranger; the
-- browser is the only caller, so revoking anon would break the reading flow.
-- This narrows what a held id can do, with the same signature (no browser change):
--   * reading level only 1..13 (the levels the app offers), anything else refused;
--   * assessment_taken only ever turns on (the app never turns it off);
--   * only open sessions started in the last 24 hours change; an id left behind in
--     a shared computer's localStorage is dead after a day;
--   * EXECUTE taken from PUBLIC; only anon, authenticated and service_role keep it.
-- Additive: replaces the function body only; no table or row is changed.
-- Test: supabase/tests/update_session.test.ts replays every migration.
CREATE OR REPLACE FUNCTION public.update_session(
  session_uuid uuid,
  p_reading_level integer DEFAULT NULL,
  p_assessment_taken boolean DEFAULT NULL,
  p_end boolean DEFAULT false
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_reading_level IS NOT NULL AND (p_reading_level < 1 OR p_reading_level > 13) THEN
    RAISE EXCEPTION 'reading level must be 1 to 13' USING ERRCODE = '22023';
  END IF;
  UPDATE public.sessions
     SET selected_reading_level = COALESCE(p_reading_level, selected_reading_level),
         assessment_taken       = assessment_taken IS TRUE OR p_assessment_taken IS TRUE,
         end_time               = CASE WHEN p_end THEN now() ELSE end_time END
   WHERE id = session_uuid
     AND end_time IS NULL
     AND start_time > now() - interval '24 hours';
END $$;

REVOKE ALL ON FUNCTION public.update_session(uuid, integer, boolean, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_session(uuid, integer, boolean, boolean) TO anon, authenticated, service_role;
