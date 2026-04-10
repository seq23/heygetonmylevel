-- Add region and city to geo stats
ALTER TABLE public.daily_country_stats ADD COLUMN region text NOT NULL DEFAULT 'Unknown';
ALTER TABLE public.daily_country_stats ADD COLUMN city text NOT NULL DEFAULT 'Unknown';

-- Drop old unique constraint and add new one
ALTER TABLE public.daily_country_stats DROP CONSTRAINT daily_country_stats_stat_date_country_code_key;
ALTER TABLE public.daily_country_stats ADD CONSTRAINT daily_country_stats_unique_geo UNIQUE (stat_date, country_code, region, city);

-- Create usage stats table for cost tracking
CREATE TABLE public.daily_usage_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_date date NOT NULL DEFAULT CURRENT_DATE,
  call_type text NOT NULL DEFAULT 'other',
  call_count integer NOT NULL DEFAULT 1,
  UNIQUE (stat_date, call_type)
);

ALTER TABLE public.daily_usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read usage stats"
  ON public.daily_usage_stats FOR SELECT USING (true);

CREATE POLICY "Edge functions can insert usage stats"
  ON public.daily_usage_stats FOR INSERT WITH CHECK (true);

CREATE POLICY "Edge functions can update usage stats"
  ON public.daily_usage_stats FOR UPDATE USING (true);

-- Update geo increment function with region/city
CREATE OR REPLACE FUNCTION public.increment_country_stat(p_country text, p_region text DEFAULT 'Unknown', p_city text DEFAULT 'Unknown')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.daily_country_stats (stat_date, country_code, region, city, request_count)
  VALUES (CURRENT_DATE, p_country, COALESCE(p_region, 'Unknown'), COALESCE(p_city, 'Unknown'), 1)
  ON CONFLICT (stat_date, country_code, region, city)
  DO UPDATE SET request_count = daily_country_stats.request_count + 1;
END;
$$;

-- Create usage increment function
CREATE OR REPLACE FUNCTION public.increment_usage_stat(p_call_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.daily_usage_stats (stat_date, call_type, call_count)
  VALUES (CURRENT_DATE, p_call_type, 1)
  ON CONFLICT (stat_date, call_type)
  DO UPDATE SET call_count = daily_usage_stats.call_count + 1;
END;
$$;