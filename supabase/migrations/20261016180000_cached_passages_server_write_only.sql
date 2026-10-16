-- 16 Oct 2026, Lovable finding "Anyone can add any record to cached_passages".
-- Shared passages are served to other readers (children included), so only the
-- generate-reading edge function may write them: it uses the service role (which
-- bypasses RLS) and caches only text it generated itself. The browser keeps READ
-- access (the existing "Anyone can read cached passages" SELECT policy stays).
-- Guard: scripts/check-rls-lockdown.mjs fails CI if any non-SELECT policy on
-- cached_passages survives the migrations, or if src/ writes to it.
DROP POLICY IF EXISTS "Allow inserting cached passages" ON public.cached_passages;
REVOKE INSERT, UPDATE, DELETE ON public.cached_passages FROM anon, authenticated;
