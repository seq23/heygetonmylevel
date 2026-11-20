import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/contexts/SessionContext";

// /select-level and /assessment need a session and send a fresh visitor back to "/", so every
// "start" button creates the session first and then opens the step (home and the curriculum pages).
export type StartStep = "start" | "assess";
const STEP_ROUTE: Record<StartStep, string> = { start: "/select-level", assess: "/assessment" };

export function useStartPractice() {
  const navigate = useNavigate();
  const { createSession, isLoading } = useSession();
  const [loadingAction, setLoadingAction] = useState<StartStep | null>(null);
  const begin = async (step: StartStep) => {
    setLoadingAction(step);
    try {
      await createSession();
      navigate(STEP_ROUTE[step]);
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setLoadingAction(null);
    }
  };
  return { begin, isLoading, loadingAction };
}
