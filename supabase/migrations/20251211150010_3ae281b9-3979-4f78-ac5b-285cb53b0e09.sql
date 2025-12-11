-- Create cached passages table for Strategy 2
CREATE TABLE public.cached_passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level INTEGER NOT NULL,
  skill_focus TEXT,
  title TEXT NOT NULL,
  passage_text TEXT NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cached_passages ENABLE ROW LEVEL SECURITY;

-- Allow public read access (passages are shared content)
CREATE POLICY "Anyone can read cached passages"
ON public.cached_passages
FOR SELECT
USING (true);

-- Create index for faster grade level lookups
CREATE INDEX idx_cached_passages_grade ON public.cached_passages(grade_level);