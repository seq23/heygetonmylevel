import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, Loader2, HelpCircle } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useAI } from "@/hooks/useAI";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id?: string;
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface SessionState {
  phase: "loading" | "reading" | "questions" | "checkpoint";
  passage: { id?: string; title: string; text: string } | null;
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  sessionStats: { correct: number; total: number; skills: string[] };
}

const Session = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, recordAnswer, setCurrentPassage } = useSession();
  const { generatePassage, generateQuestions, isLoading } = useAI();
  const skillFocus = location.state?.skillFocus;

  const [state, setState] = useState<SessionState>({
    phase: "loading",
    passage: null,
    questions: [],
    currentQuestionIndex: 0,
    selectedAnswer: null,
    showFeedback: false,
    isCorrect: null,
    sessionStats: { correct: 0, total: 0, skills: [] },
  });

  useEffect(() => {
    if (!session || !session.readingLevel) {
      navigate("/");
      return;
    }
    loadNewPassage();
  }, [session]);

  const loadNewPassage = async () => {
    if (!session?.readingLevel) return;

    setState((prev) => ({ ...prev, phase: "loading" }));

    const passageData = await generatePassage(session.readingLevel, skillFocus);
    
    if (passageData) {
      // Store passage in database
      const { data: storedPassage, error } = await supabase
        .from("passages")
        .insert({
          session_id: session.id,
          text: passageData.text,
          fk_grade_level: session.readingLevel,
          skill_focus: skillFocus || null,
        })
        .select()
        .single();

      if (!error && storedPassage) {
        setCurrentPassage(storedPassage.id);
      }

      setState((prev) => ({
        ...prev,
        phase: "reading",
        passage: {
          id: storedPassage?.id,
          title: passageData.title,
          text: passageData.text,
        },
        questions: [],
        currentQuestionIndex: 0,
        selectedAnswer: null,
        showFeedback: false,
        isCorrect: null,
      }));
    }
  };

  const handleReadyForQuestions = async () => {
    if (!state.passage || !session?.readingLevel) return;

    setState((prev) => ({ ...prev, phase: "loading" }));

    const questionsData = await generateQuestions(state.passage.text, session.readingLevel);

    if (questionsData) {
      // Store questions in database
      const questionsToInsert = questionsData.map((q) => ({
        passage_id: state.passage!.id,
        text: q.text,
        question_type: q.type,
        correct_answer: q.correctAnswer,
        explanation: q.explanation,
        options: q.options,
      }));

      const { data: storedQuestions } = await supabase
        .from("questions")
        .insert(questionsToInsert)
        .select();

      const questionsWithIds = questionsData.map((q, i) => ({
        ...q,
        id: storedQuestions?.[i]?.id,
      }));

      setState((prev) => ({
        ...prev,
        phase: "questions",
        questions: questionsWithIds,
      }));
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (state.showFeedback) return;
    setState((prev) => ({ ...prev, selectedAnswer: answer }));
  };

  const handleSubmitAnswer = async () => {
    if (!state.selectedAnswer || !session) return;

    const currentQuestion = state.questions[state.currentQuestionIndex];
    const isCorrect = state.selectedAnswer === currentQuestion.correctAnswer;

    // Record in context
    recordAnswer(isCorrect, currentQuestion.type);

    // Store response in database
    if (currentQuestion.id) {
      await supabase.from("responses").insert({
        question_id: currentQuestion.id,
        session_id: session.id,
        user_answer: state.selectedAnswer,
        is_correct: isCorrect,
      });
    }

    setState((prev) => ({
      ...prev,
      showFeedback: true,
      isCorrect,
      sessionStats: {
        correct: prev.sessionStats.correct + (isCorrect ? 1 : 0),
        total: prev.sessionStats.total + 1,
        skills: prev.sessionStats.skills.includes(currentQuestion.type)
          ? prev.sessionStats.skills
          : [...prev.sessionStats.skills, currentQuestion.type],
      },
    }));
  };

  const handleNextQuestion = () => {
    const isLastQuestion = state.currentQuestionIndex >= state.questions.length - 1;

    if (isLastQuestion) {
      setState((prev) => ({ ...prev, phase: "checkpoint" }));
    } else {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        showFeedback: false,
        isCorrect: null,
      }));
    }
  };

  const handleContinueLearning = () => {
    loadNewPassage();
  };

  const handleEndSession = () => {
    navigate("/summary");
  };

  if (!session) return null;

  const gradeLabel =
    session.readingLevel && session.readingLevel <= 12
      ? `Grade ${session.readingLevel}`
      : "College";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container max-w-4xl py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold">Reading Session</h1>
            <p className="text-sm text-muted-foreground">{gradeLabel} Level</p>
          </div>
          {state.phase === "questions" && (
            <div className="text-sm text-muted-foreground">
              {state.currentQuestionIndex + 1} / {state.questions.length}
            </div>
          )}
        </div>
      </header>

      <main className="container max-w-4xl py-8 px-6">
        {/* Loading State */}
        {state.phase === "loading" && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground">
              {state.passage ? "Generating questions..." : "Creating your passage..."}
            </p>
          </div>
        )}

        {/* Reading Phase */}
        {state.phase === "reading" && state.passage && (
          <div className="space-y-6 fade-in-up">
            <div className="card-elevated">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-display font-bold">{state.passage.title}</h2>
              </div>
              <p className="reading-passage text-foreground whitespace-pre-wrap leading-relaxed">
                {state.passage.text}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Take your time reading. When you're ready, tap the button below to answer
                questions about what you just read.
              </p>
            </div>

            <button
              onClick={handleReadyForQuestions}
              disabled={isLoading}
              className="btn-hero w-full"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "I'm Ready for Questions"
              )}
            </button>
          </div>
        )}

        {/* Questions Phase */}
        {state.phase === "questions" && state.questions[state.currentQuestionIndex] && (
          <div className="space-y-6 fade-in-up">
            {/* Passage Reference */}
            <details className="card-elevated cursor-pointer">
              <summary className="font-semibold text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                View passage again
              </summary>
              <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">
                {state.passage?.text}
              </p>
            </details>

            {/* Question Card */}
            <div className="question-card">
              <div className="mb-2">
                <span className="skill-chip bg-primary/10 text-primary text-xs">
                  {state.questions[state.currentQuestionIndex].type.replace("_", " ")}
                </span>
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
                      <span className="flex-1 text-left">{option}</span>
                      {state.showFeedback &&
                        option === state.questions[state.currentQuestionIndex].correctAnswer && (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        )}
                      {state.showFeedback &&
                        state.selectedAnswer === option &&
                        option !== state.questions[state.currentQuestionIndex].correctAnswer && (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
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
                        {state.isCorrect ? "Great job!" : "Not quite right"}
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
                    {state.currentQuestionIndex < state.questions.length - 1
                      ? "Next Question"
                      : "View Results"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Checkpoint Phase */}
        {state.phase === "checkpoint" && (
          <div className="space-y-8 py-8 fade-in-up">
            <div className="text-center">
              <div className="celebration-bounce inline-block">
                <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-12 h-12 text-success" />
                </div>
              </div>
              <h2 className="text-2xl font-display font-bold">Passage Complete!</h2>
              <p className="text-muted-foreground mt-2">Great work on this reading exercise</p>
            </div>

            {/* Stats */}
            <div className="card-elevated">
              <h3 className="font-display font-bold mb-4">Your Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-muted">
                  <p className="text-3xl font-bold text-foreground">
                    {state.sessionStats.correct}/{state.sessionStats.total}
                  </p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-success/10">
                  <p className="text-3xl font-bold text-success">
                    {state.sessionStats.total > 0
                      ? Math.round((state.sessionStats.correct / state.sessionStats.total) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
              </div>

              {state.sessionStats.skills.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Skills Practiced:</p>
                  <div className="flex flex-wrap gap-2">
                    {state.sessionStats.skills.map((skill) => (
                      <span
                        key={skill}
                        className="skill-chip bg-primary/10 text-primary text-xs"
                      >
                        {skill.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button onClick={handleContinueLearning} className="btn-hero w-full">
                Continue Learning
              </button>
              <button
                onClick={handleEndSession}
                className="w-full py-4 px-8 rounded-2xl border-2 border-border text-foreground font-semibold hover:bg-muted transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Session;
