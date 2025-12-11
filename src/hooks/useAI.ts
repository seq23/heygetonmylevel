import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Passage {
  title: string;
  text: string;
  topic: string;
}

interface Question {
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty?: string;
}

interface AssessmentData {
  passage: {
    title: string;
    text: string;
    gradeLevel: number;
  };
  questions: Question[];
}

interface EvaluationResult {
  isCorrect: boolean;
  feedback: string;
}

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePassage = useCallback(async (
    gradeLevel: number,
    skillFocus?: string
  ): Promise<Passage | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-reading", {
        body: {
          type: "passage",
          gradeLevel,
          skillFocus,
        },
      });

      if (fnError) throw fnError;
      return data as Passage;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate passage";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateQuestions = useCallback(async (
    passageText: string,
    gradeLevel: number
  ): Promise<Question[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-reading", {
        body: {
          type: "questions",
          passageText,
          gradeLevel,
        },
      });

      if (fnError) throw fnError;
      return data as Question[];
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate questions";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateAssessment = useCallback(async (
    gradeLevel: number
  ): Promise<AssessmentData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-reading", {
        body: {
          type: "assessment",
          gradeLevel,
        },
      });

      if (fnError) throw fnError;
      return data as AssessmentData;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate assessment";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const evaluateAnswer = useCallback(async (
    question: string,
    userAnswer: string,
    correctAnswer: string,
    gradeLevel: number
  ): Promise<EvaluationResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-reading", {
        body: {
          type: "evaluate",
          question,
          userAnswer,
          correctAnswer,
          gradeLevel,
        },
      });

      if (fnError) throw fnError;
      return data as EvaluationResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to evaluate answer";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    generatePassage,
    generateQuestions,
    generateAssessment,
    evaluateAnswer,
  };
};
