-- Add INSERT policy for cached_passages to allow caching new passages
CREATE POLICY "Allow inserting cached passages"
ON public.cached_passages
FOR INSERT
WITH CHECK (true);