import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useAI } from "@/hooks/useAI";

interface AssessmentQuestion {
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty?: string;
}

interface AssessmentState {
  currentLevel: number;
  passage: { title: string; text: string; gradeLevel: number } | null;
  questions: AssessmentQuestion[];
  currentQuestionIndex: number;
  answers: { correct: boolean; level: number }[];
  phase: "loading" | "reading" | "questions" | "result";
  selectedAnswer: string | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
}

const Assessment = () => {
  const navigate = useNavigate();
  const { session, updateReadingLevel, setAssessmentTaken } = useSession();
  const { generateAssessment, isLoading } = useAI();

  const [state, setState] = useState<AssessmentState>({
    currentLevel: 5, // Start at grade 5
    passage: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    phase: "loading",
    selectedAnswer: null,
    showFeedback: false,
    isCorrect: null,
  });

  const [determinedLevel, setDeterminedLevel] = useState<number | null>(null);

  // Load initial assessment
  useEffect(() => {
    if (!session) {
      navigate("/");
      return;
    }
    loadAssessment(5);
  }, [session]);

  const loadAssessment = async (level: number) => {
    setState((prev) => ({ ...prev, phase: "loading" }));
    
    const data = await generateAssessment(level);
    
    if (data) {
      setState((prev) => ({
        ...prev,
        currentLevel: level,
        passage: data.passage,
        questions: data.questions,
        currentQuestionIndex: 0,
        phase: "reading",
        selectedAnswer: null,
        showFeedback: false,
        isCorrect: null,
      }));
    }
  };

  const handleReadyForQuestions = () => {
    setState((prev) => ({ ...prev, phase: "questions" }));
  };

  const handleAnswerSelect = (answer: string) => {
    if (state.showFeedback) return;
    setState((prev) => ({ ...prev, selectedAnswer: answer }));
  };

  const handleSubmitAnswer = () => {
    if (!state.selectedAnswer) return;

    const currentQuestion = state.questions[state.currentQuestionIndex];
    const isCorrect = state.selectedAnswer === currentQuestion.correctAnswer;

    setState((prev) => ({
      ...prev,
      showFeedback: true,
      isCorrect,
      answers: [...prev.answers, { correct: isCorrect, level: prev.currentLevel }],
    }));
  };

  const handleNextQuestion = async () => {
    const totalAnswers = state.answers.length;
    const correctCount = state.answers.filter((a) => a.correct).length;
    const currentIndex = state.currentQuestionIndex;

    // Check if we should determine a level
    if (totalAnswers >= 6) {
      // Calculate final level based on performance
      const accuracy = correctCount / totalAnswers;
      let finalLevel: number;

      if (accuracy >= 0.8) {
        finalLevel = Math.min(13, state.currentLevel + 1);
      } else if (accuracy >= 0.6) {
        finalLevel = state.currentLevel;
      } else {
        finalLevel = Math.max(1, state.currentLevel - 1);
      }

      setDeterminedLevel(finalLevel);
      setState((prev) => ({ ...prev, phase: "result" }));
      return;
    }

    // Move to next question or load new assessment
    if (currentIndex < state.questions.length - 1) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        showFeedback: false,
        isCorrect: null,
      }));
    } else {
      // Adjust level based on recent performance
      const recentAnswers = state.answers.slice(-3);
      const recentCorrect = recentAnswers.filter((a) => a.correct).length;

      let newLevel = state.currentLevel;
      if (recentCorrect >= 2) {
        newLevel = Math.min(13, state.currentLevel + 1);
      } else if (recentCorrect === 0) {
        newLevel = Math.max(1, state.currentLevel - 1);
      }

      await loadAssessment(newLevel);
    }
  };

  const handleStartLearning = async () => {
    if (determinedLevel) {
      await updateReadingLevel(determinedLevel);
      await setAssessmentTaken(true);
      navigate("/dashboard");
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container max-w-4xl py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold">Reading Assessment</h1>
            <p className="text-sm text-muted-foreground">
              {state.phase === "result"
                ? "Assessment Complete"
                : `Testing Grade ${state.currentLevel} level`}
            </p>
          </div>
          {state.phase !== "loading" && state.phase !== "result" && (
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">
                {state.answers.length} answered
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="container max-w-4xl py-8 px-6">
        {/* Loading State */}
        {state.phase === "loading" && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Generating assessment passage...</p>
          </div>
        )}

        {/* Reading Phase */}
        {state.phase === "reading" && state.passage && (
          <div className="space-y-6 fade-in-up">
            <div className="card-elevated">
              <h2 className="text-xl font-display font-bold mb-4">{state.passage.title}</h2>
              <p className="reading-passage text-foreground whitespace-pre-wrap">
                {state.passage.text}
              </p>
            </div>

            <button
              onClick={handleReadyForQuestions}
              className="btn-hero w-full"
            >
              I'm Ready for Questions
            </button>
          </div>
        )}

        {/* Questions Phase */}
        {state.phase === "questions" && state.questions[state.currentQuestionIndex] && (
          <div className="space-y-6 fade-in-up">
            {/* Passage Reference */}
            <details className="card-elevated cursor-pointer">
              <summary className="font-semibold text-muted-foreground">
                View passage again
              </summary>
              <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">
                {state.passage?.text}
              </p>
            </details>

            {/* Question Card */}
            <div className="question-card">
              <div className="mb-2 text-sm text-muted-foreground">
                Question {state.currentQuestionIndex + 1} of {state.questions.length}
              </div>
              <h3 className="text-xl font-semibold mb-6">
                {state.questions[state.currentQuestionIndex].text}
              </h3>

              <div className="space-y-3">
                {state.questions[state.currentQuestionIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={state.showFeedback}
                    className={`answer-option ${
                      state.selectedAnswer === option ? "selected" : ""
                    } ${
                      state.showFeedback
                        ? option === state.questions[state.currentQuestionIndex].correctAnswer
                          ? "correct"
                          : state.selectedAnswer === option
                          ? "incorrect"
                          : ""
                        : ""
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </span>
                  </button>
                ))}
              </div>

              {/* Feedback */}
              {state.showFeedback && (
                <div
                  className={`mt-6 p-4 rounded-2xl fade-in-up ${
                    state.isCorrect ? "bg-success/10" : "bg-destructive/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {state.isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {state.isCorrect ? "Correct!" : "Not quite right"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {state.questions[state.currentQuestionIndex].explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6">
                {!state.showFeedback ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!state.selectedAnswer}
                    className="btn-hero w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button onClick={handleNextQuestion} className="btn-hero w-full">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Continue"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Result Phase */}
        {state.phase === "result" && determinedLevel && (
          <div className="text-center space-y-8 py-8 fade-in-up">
            <div className="celebration-bounce">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-4">
                <span className="text-5xl font-display font-bold text-primary">
                  {determinedLevel <= 12 ? determinedLevel : "C"}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-display font-bold">
                Your reading level is{" "}
                <span className="text-primary">
                  {determinedLevel <= 12 ? `Grade ${determinedLevel}` : "College"}
                </span>
              </h2>
              <p className="text-muted-foreground mt-2">
                Based on your responses, we've determined the best level for you to practice.
              </p>
            </div>

            <div className="card-elevated max-w-sm mx-auto">
              <div className="text-sm text-muted-foreground mb-2">Assessment Summary</div>
              <div className="flex justify-between items-center">
                <span>Questions Answered</span>
                <span className="font-semibold">{state.answers.length}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>Correct Answers</span>
                <span className="font-semibold text-success">
                  {state.answers.filter((a) => a.correct).length}
                </span>
              </div>
            </div>

            <button onClick={handleStartLearning} className="btn-hero">
              Start Learning at Grade {determinedLevel <= 12 ? determinedLevel : "College"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Assessment;
