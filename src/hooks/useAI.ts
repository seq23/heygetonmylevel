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

// Strategy 6: Batched assessment for all 3 levels
interface BatchedAssessmentData {
  easy: AssessmentData;
  medium: AssessmentData;
  hard: AssessmentData;
}

interface CachedPassageRow {
  id: string;
  grade_level: number;
  title: string;
  passage_text: string;
  questions: unknown; // JSONB from Supabase
  skill_focus: string | null;
  created_at: string;
}

interface EvaluationResult {
  isCorrect: boolean;
  feedback: string;
}

const CACHE_USE_PROBABILITY = 0.7; // 70% chance to use cache

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Strategy 2: Check cache first, then generate
  // NOTE: When theme is specified, we skip the cache to generate fresh themed content
  const getCachedOrGeneratePassage = useCallback(async (
    gradeLevel: number,
    skillFocus?: string,
    theme?: string,
    language?: string
  ): Promise<{ passage: Passage; questions: Question[]; fromCache: boolean } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Skip cache entirely if theme is specified or language is Spanish (custom content needed)
      const useCache = !theme && language !== "es" && Math.random() < CACHE_USE_PROBABILITY;
      
      if (useCache) {
        // Try to get from cache
        const { data: cached, error: cacheError } = await supabase
          .from("cached_passages")
          .select("*")
          .eq("grade_level", gradeLevel)
          .limit(20);

        if (!cacheError && cached && cached.length > 0) {
          // Randomly select one from cache
          const randomIndex = Math.floor(Math.random() * cached.length);
          const cachedPassage = cached[randomIndex] as CachedPassageRow;
          
          return {
            passage: {
              title: cachedPassage.title,
              text: cachedPassage.passage_text,
              topic: "cached"
            },
            questions: cachedPassage.questions as Question[],
            fromCache: true
          };
        }
      }

      // Generate new passage (with optional theme)
      const { data: passageData, error: passageError } = await supabase.functions.invoke("generate-reading", {
        body: { type: "passage", gradeLevel, skillFocus, theme, language },
      });
      if (passageError) throw passageError;

      const { data: questionsData, error: questionsError } = await supabase.functions.invoke("generate-reading", {
        body: { type: "questions", passageText: passageData.text, gradeLevel, language },
      });
      if (questionsError) throw questionsError;

      // Only save to cache if no custom theme and English (themed/Spanish passages are one-offs)
      if (!theme && language !== "es") {
        supabase.from("cached_passages").insert({
          grade_level: gradeLevel,
          skill_focus: skillFocus || null,
          title: passageData.title,
          passage_text: passageData.text,
          questions: questionsData
        }).then((result) => {
          if (result.error) {
            console.warn("Failed to cache passage:", result.error);
          } else {
            console.log("Passage cached for future use");
          }
        });
      }

      return {
        passage: passageData as Passage,
        questions: questionsData as Question[],
        fromCache: false
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get passage";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Original generatePassage (kept for backward compatibility)
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
    gradeLevel: number,
    skillFocus?: string,
    language?: string
  ): Promise<Question[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-reading", {
        body: {
          type: "questions",
          passageText,
          gradeLevel,
          skillFocus,
          language,
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

  // Strategy 6: Batched assessment - generate all 3 difficulty levels in ONE call
  const generateBatchedAssessment = useCallback(async (
    baseLevel: number
  ): Promise<BatchedAssessmentData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-reading", {
        body: {
          type: "assessment_batch",
          gradeLevel: baseLevel,
        },
      });

      if (fnError) throw fnError;
      return data as BatchedAssessmentData;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate assessment";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Original assessment (kept for fallback)
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

  // Generate sentences for read-aloud assessment
  const generateReadAloudSentences = useCallback(async (
    gradeLevel: number,
    language?: string
  ): Promise<{ sentences: string[] } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-reading", {
        body: {
          type: "read_aloud",
          gradeLevel,
          language,
        },
      });

      if (fnError) throw fnError;
      return data as { sentences: string[] };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate sentences";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate confirmation passage for vocabulary assessment
  const generateVocabularyConfirmation = useCallback(async (
    gradeLevel: number,
    language?: string
  ): Promise<{ title: string; text: string; questions: Question[] } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-reading", {
        body: {
          type: "vocabulary_confirmation",
          gradeLevel,
          language,
        },
      });

      if (fnError) throw fnError;
      return data as { title: string; text: string; questions: Question[] };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate confirmation";
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
    getCachedOrGeneratePassage,
    generateBatchedAssessment,
    generateReadAloudSentences,
    generateVocabularyConfirmation,
  };
};
