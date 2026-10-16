-- Lovable security scan, 16 Oct 2026: "Some access rules let everyone through"
-- (critical: sessions, passages, questions, responses; warning: daily_usage_stats,
-- daily_country_stats). The browser held FOR ALL USING (true) on every reading table,
-- so anyone with the public anon key could list, change or delete every learner's
-- session, passages, questions and answers.
--
-- New contract: the browser may only ADD rows to an open session it created. It can
-- never list, read back, change or delete them. The session UUID (generated in the
-- browser) is the only key; changes go through SECURITY DEFINER functions that take it.
-- Stats tables are written only by edge functions with the service role.

-- 1. Reading tables: drop the allow-everything policies.
DROP POLICY IF EXISTS "Allow all session operations" ON public.sessions;
DROP POLICY IF EXISTS "Allow all passage operations" ON public.passages;
DROP POLICY IF EXISTS "Allow all question operations" ON public.questions;
DROP POLICY IF EXISTS "Allow all response operations" ON public.responses;

-- Helpers run as owner, so the insert checks can see rows the caller cannot.
CREATE OR REPLACE FUNCTION public.session_is_open(session_uuid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.sessions WHERE id = session_uuid AND end_time IS NULL);
$$;

CREATE OR REPLACE FUNCTION public.passage_is_open(passage_uuid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.passages p JOIN public.sessions s ON s.id = p.session_id
    WHERE p.id = passage_uuid AND s.end_time IS NULL
  );
$$;

CREATE POLICY "Browser can start a session" ON public.sessions
  FOR INSERT TO anon, authenticated
  WITH CHECK (end_time IS NULL);

CREATE POLICY "Browser can add a passage to an open session" ON public.passages
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.session_is_open(session_id));

CREATE POLICY "Browser can add questions to an open passage" ON public.questions
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.passage_is_open(passage_id));

CREATE POLICY "Browser can add answers to an open session" ON public.responses
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.session_is_open(session_id));

-- Session changes by UUID only (replaces direct UPDATE on public.sessions).
CREATE OR REPLACE FUNCTION public.update_session(
  session_uuid uuid,
  p_reading_level integer DEFAULT NULL,
  p_assessment_taken boolean DEFAULT NULL,
  p_end boolean DEFAULT false
)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.sessions
     SET selected_reading_level = COALESCE(p_reading_level, selected_reading_level),
         assessment_taken       = COALESCE(p_assessment_taken, assessment_taken),
         end_time               = CASE WHEN p_end THEN now() ELSE end_time END
   WHERE id = session_uuid AND end_time IS NULL;
$$;

REVOKE ALL ON FUNCTION public.session_is_open(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.passage_is_open(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.session_is_open(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.passage_is_open(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_session(uuid, integer, boolean, boolean) TO anon, authenticated, service_role;

-- 2. Stats tables: edge functions use the service role (bypasses RLS), so the
-- public read/insert/update policies served nobody but the public.
DROP POLICY IF EXISTS "Anyone can read country stats" ON public.daily_country_stats;
DROP POLICY IF EXISTS "Edge functions can upsert country stats" ON public.daily_country_stats;
DROP POLICY IF EXISTS "Edge functions can update country stats" ON public.daily_country_stats;
DROP POLICY IF EXISTS "Anyone can read usage stats" ON public.daily_usage_stats;
DROP POLICY IF EXISTS "Edge functions can insert usage stats" ON public.daily_usage_stats;
DROP POLICY IF EXISTS "Edge functions can update usage stats" ON public.daily_usage_stats;

-- The stat counters are called only by edge functions with the service role.
DO $$
DECLARE f regprocedure;
BEGIN
  FOR f IN SELECT p.oid::regprocedure FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname = 'public' AND p.proname IN ('increment_country_stat', 'increment_usage_stat')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
  END LOOP;
END $$;
