-- Create reading sessions table
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    end_time TIMESTAMP WITH TIME ZONE,
    selected_reading_level INTEGER,
    assessment_taken BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reading passages table
CREATE TABLE public.passages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    fk_grade_level INTEGER NOT NULL,
    skill_focus TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passage_id UUID REFERENCES public.passages(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    options JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user responses table
CREATE TABLE public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow all operations (no auth needed for ephemeral data)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Allow all operations for sessions (public, ephemeral data)
CREATE POLICY "Allow all session operations" ON public.sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all passage operations" ON public.passages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all question operations" ON public.questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all response operations" ON public.responses FOR ALL USING (true) WITH CHECK (true);

-- Function to delete session and all related data
CREATE OR REPLACE FUNCTION public.delete_session_data(session_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.sessions WHERE id = session_uuid;
END;
$$;