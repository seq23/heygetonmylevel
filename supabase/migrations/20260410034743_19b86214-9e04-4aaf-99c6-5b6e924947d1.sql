CREATE OR REPLACE FUNCTION public.increment_country_stat(p_country text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.daily_country_stats (stat_date, country_code, request_count)
  VALUES (CURRENT_DATE, p_country, 1)
  ON CONFLICT (stat_date, country_code)
  DO UPDATE SET request_count = daily_country_stats.request_count + 1;
END;
$$;