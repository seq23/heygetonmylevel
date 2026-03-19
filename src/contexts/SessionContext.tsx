import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SessionData {
  id: string;
  readingLevel: number | null;
  assessmentTaken: boolean;
  currentPassageId: string | null;
  questionsAnswered: number;
  correctAnswers: number;
  skillsAttempted: string[];
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  userName: string | null;
}

interface SessionContextType {
  session: SessionData | null;
  isLoading: boolean;
  createSession: () => Promise<string>;
  updateReadingLevel: (level: number) => Promise<void>;
  setAssessmentTaken: (taken: boolean) => Promise<void>;
  setCurrentPassage: (passageId: string) => void;
  recordAnswer: (correct: boolean, skill: string) => void;
  checkLevelProgression: (correct: boolean) => { levelChanged: boolean; newLevel: number | null; direction: 'up' | 'down' | null };
  endSession: () => Promise<void>;
  resetSession: () => void;
  setUserName: (name: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createSession = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("sessions")
        .insert({})
        .select()
        .single();

      if (error) throw error;

      const newSession: SessionData = {
        id: data.id,
        readingLevel: null,
        assessmentTaken: false,
        currentPassageId: null,
        questionsAnswered: 0,
        correctAnswers: 0,
        skillsAttempted: [],
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
        userName: null,
      };

      setSession(newSession);
      localStorage.setItem("currentSessionId", data.id);
      return data.id;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateReadingLevel = useCallback(async (level: number): Promise<void> => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from("sessions")
        .update({ selected_reading_level: level })
        .eq("id", session.id);

      if (error) throw error;

      setSession((prev) => prev ? { ...prev, readingLevel: level } : null);
    } catch (error) {
      console.error("Error updating reading level:", error);
      throw error;
    }
  }, [session]);

  const setAssessmentTaken = useCallback(async (taken: boolean): Promise<void> => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from("sessions")
        .update({ assessment_taken: taken })
        .eq("id", session.id);

      if (error) throw error;

      setSession((prev) => prev ? { ...prev, assessmentTaken: taken } : null);
    } catch (error) {
      console.error("Error updating assessment status:", error);
      throw error;
    }
  }, [session]);

  const setCurrentPassage = useCallback((passageId: string): void => {
    setSession((prev) => prev ? { ...prev, currentPassageId: passageId } : null);
  }, []);

  const recordAnswer = useCallback((correct: boolean, skill: string): void => {
    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
        skillsAttempted: prev.skillsAttempted.includes(skill)
          ? prev.skillsAttempted
          : [...prev.skillsAttempted, skill],
        consecutiveCorrect: correct ? prev.consecutiveCorrect + 1 : 0,
        consecutiveIncorrect: correct ? 0 : prev.consecutiveIncorrect + 1,
      };
    });
  }, []);

  const checkLevelProgression = useCallback((correct: boolean): { levelChanged: boolean; newLevel: number | null; direction: 'up' | 'down' | null } => {
    if (!session) return { levelChanged: false, newLevel: null, direction: null };

    const currentLevel = session.readingLevel || 1;
    const newConsecutiveCorrect = correct ? session.consecutiveCorrect + 1 : 0;
    const newConsecutiveIncorrect = correct ? 0 : session.consecutiveIncorrect + 1;

    // Level UP: 5 consecutive correct answers
    if (newConsecutiveCorrect >= 5 && currentLevel < 13) {
      const newLevel = currentLevel + 1;
      updateReadingLevel(newLevel);
      // Reset consecutive counts after level change
      setSession((prev) => prev ? { ...prev, consecutiveCorrect: 0, consecutiveIncorrect: 0 } : null);
      return { levelChanged: true, newLevel, direction: 'up' };
    }

    // Level DOWN: 3 consecutive incorrect answers
    if (newConsecutiveIncorrect >= 3 && currentLevel > 1) {
      const newLevel = currentLevel - 1;
      updateReadingLevel(newLevel);
      // Reset consecutive counts after level change
      setSession((prev) => prev ? { ...prev, consecutiveCorrect: 0, consecutiveIncorrect: 0 } : null);
      return { levelChanged: true, newLevel, direction: 'down' };
    }

    return { levelChanged: false, newLevel: null, direction: null };
  }, [session, updateReadingLevel]);

  const endSession = useCallback(async (): Promise<void> => {
    if (!session) return;

    try {
      // Update end time
      await supabase
        .from("sessions")
        .update({ end_time: new Date().toISOString() })
        .eq("id", session.id);

      // Delete all session data (cascade will handle related records)
      await supabase.rpc("delete_session_data", { session_uuid: session.id });

      localStorage.removeItem("currentSessionId");
      setSession(null);
    } catch (error) {
      console.error("Error ending session:", error);
      // Still clear local state even if server delete fails
      localStorage.removeItem("currentSessionId");
      setSession(null);
    }
  }, [session]);

  const resetSession = useCallback((): void => {
    localStorage.removeItem("currentSessionId");
    setSession(null);
  }, []);

  const setUserName = useCallback((name: string): void => {
    setSession((prev) => prev ? { ...prev, userName: name } : null);
  }, []);

  // Cleanup on unmount or page leave
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session?.id) {
        // Attempt to delete session data when user leaves
        navigator.sendBeacon?.(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/delete_session_data`,
          JSON.stringify({ session_uuid: session.id })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [session?.id]);

  return (
    <SessionContext.Provider
      value={{
        session,
        isLoading,
        createSession,
        updateReadingLevel,
        setAssessmentTaken,
        setCurrentPassage,
        recordAnswer,
        checkLevelProgression,
        endSession,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
