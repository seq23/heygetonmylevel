CREATE TABLE public.daily_country_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_date date NOT NULL DEFAULT CURRENT_DATE,
  country_code text NOT NULL DEFAULT 'XX',
  request_count integer NOT NULL DEFAULT 1,
  UNIQUE (stat_date, country_code)
);

ALTER TABLE public.daily_country_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read country stats"
  ON public.daily_country_stats FOR SELECT
  USING (true);

CREATE POLICY "Edge functions can upsert country stats"
  ON public.daily_country_stats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Edge functions can update country stats"
  ON public.daily_country_stats FOR UPDATE
  USING (true);