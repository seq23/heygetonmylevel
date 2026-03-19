import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, Loader2, HelpCircle, TrendingUp, TrendingDown, Bot, X, Home } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession } from "@/contexts/SessionContext";
import { useAI } from "@/hooks/useAI";
import { supabase } from "@/integrations/supabase/client";
import AITutor from "@/components/AITutor";
import PhonicsWord from "@/components/PhonicsWord";
import { toast } from "sonner";
import Footer from "@/components/Footer";

interface Question {
  id?: string;
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface SkillPerformance {
  correct: number;
  total: number;
}

interface SessionState {
  phase: "loading" | "reading" | "questions" | "checkpoint";
  passage: { id?: string; title: string; text: string } | null;
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  sessionStats: { correct: number; total: number; skillPerformance: Record<string, SkillPerformance> };
  showTutor: boolean;
}

const Session = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { session, recordAnswer, setCurrentPassage, checkLevelProgression } = useSession();
  const [levelChangeQueued, setLevelChangeQueued] = useState<{ newLevel: number; direction: 'up' | 'down' } | null>(null);
  const { getCachedOrGeneratePassage, generateQuestions, isLoading } = useAI();
  const skillFocus = location.state?.skillFocus;
  const theme = location.state?.theme;
  

  const [state, setState] = useState<SessionState>({
    phase: "loading",
    passage: null,
    questions: [],
    currentQuestionIndex: 0,
    selectedAnswer: null,
    showFeedback: false,
    isCorrect: null,
    sessionStats: { correct: 0, total: 0, skillPerformance: {} },
    showTutor: false,
  });

  // Prevent double-loading with ref
  const hasInitialized = useRef(false);
  const currentSessionId = useRef<string | null>(null);

  useEffect(() => {
    if (!session || !session.readingLevel) {
      navigate("/");
      return;
    }
    
    // Only load passage once per session
    if (!hasInitialized.current || currentSessionId.current !== session.id) {
      hasInitialized.current = true;
      currentSessionId.current = session.id;
      loadNewPassage();
    }
  }, [session?.id, session?.readingLevel, navigate]);

  // Store pre-generated questions from cache
  const [cachedQuestions, setCachedQuestions] = useState<Question[] | null>(null);

  const loadNewPassage = async () => {
    if (!session?.readingLevel) return;

    setState((prev) => ({ ...prev, phase: "loading" }));
    setCachedQuestions(null);

    const result = await getCachedOrGeneratePassage(session.readingLevel, skillFocus, theme);
    
    if (result) {
      const { passage: passageData, questions: preGeneratedQuestions, fromCache } = result;
      
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

      // If questions came from cache, store them for later use
      if (fromCache && preGeneratedQuestions.length > 0) {
        setCachedQuestions(preGeneratedQuestions);
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
        showTutor: true, // Default open on all devices
      }));
    }
  };

  const handleReadyForQuestions = async () => {
    if (!state.passage || !session?.readingLevel) return;

    setState((prev) => ({ ...prev, phase: "loading" }));

    // Use cached questions if available, otherwise generate new ones with skillFocus
    const questionsData = cachedQuestions || await generateQuestions(state.passage.text, session.readingLevel, skillFocus);

    if (questionsData) {
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

    recordAnswer(isCorrect, currentQuestion.type);

    // Check for level progression
    const progression = checkLevelProgression(isCorrect);
    if (progression.levelChanged && progression.newLevel !== null) {
      const gradeText = progression.newLevel <= 12 ? `Grade ${progression.newLevel}` : "College";
      if (progression.direction === 'up') {
        toast.success(`🚀 Level Up! Now at ${gradeText}!`, {
          description: "Great job! You're ready for harder passages.",
          duration: 5000,
        });
      } else {
        toast.info(`📚 Let's practice more at ${gradeText}`, {
          description: "Keep going! Practice makes perfect.",
          duration: 5000,
        });
      }
      setLevelChangeQueued({ newLevel: progression.newLevel, direction: progression.direction });
    }

    if (currentQuestion.id) {
      await supabase.from("responses").insert({
        question_id: currentQuestion.id,
        session_id: session.id,
        user_answer: state.selectedAnswer,
        is_correct: isCorrect,
      });
    }

    setState((prev) => {
      const skillPerf = { ...prev.sessionStats.skillPerformance };
      const skillType = currentQuestion.type;
      
      if (!skillPerf[skillType]) {
        skillPerf[skillType] = { correct: 0, total: 0 };
      }
      skillPerf[skillType].total += 1;
      if (isCorrect) {
        skillPerf[skillType].correct += 1;
      }

      return {
        ...prev,
        showFeedback: true,
        isCorrect,
        sessionStats: {
          correct: prev.sessionStats.correct + (isCorrect ? 1 : 0),
          total: prev.sessionStats.total + 1,
          skillPerformance: skillPerf,
        },
      };
    });
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
    setLevelChangeQueued(null);
    loadNewPassage();
  };

  const handleEndSession = () => {
    navigate("/summary");
  };

  const toggleTutor = () => {
    setState((prev) => ({ ...prev, showTutor: !prev.showTutor }));
  };

  // Calculate strengths and weaknesses
  const getStrengthsAndWeaknesses = () => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    Object.entries(state.sessionStats.skillPerformance).forEach(([skill, perf]) => {
      const accuracy = perf.total > 0 ? (perf.correct / perf.total) * 100 : 0;
      if (accuracy >= 70) {
        strengths.push(skill);
      } else if (accuracy < 50 && perf.total > 0) {
        weaknesses.push(skill);
      }
    });

    return { strengths, weaknesses };
  };

  if (!session) return null;

  const gradeLabel =
    session.readingLevel && session.readingLevel <= 12
      ? `Grade ${session.readingLevel}`
      : "College";

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const { strengths, weaknesses } = getStrengthsAndWeaknesses();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container max-w-7xl py-4 flex items-center gap-4 px-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
              aria-label="Go home"
              title="Home"
            >
              <Home className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
              aria-label="Go to dashboard"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold">Reading Session</h1>
            <p className="text-sm text-muted-foreground">{gradeLabel} Level</p>
          </div>
          {state.phase === "questions" && (
            <div className="text-sm text-muted-foreground">
              {state.currentQuestionIndex + 1} / {state.questions.length}
            </div>
          )}
          {(state.phase === "reading" || state.phase === "questions") && (
            <button
              onClick={toggleTutor}
              className={`p-2 rounded-xl transition-colors lg:hidden ${
                state.showTutor ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
              aria-label="Toggle AI tutor"
            >
              <Bot className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="container max-w-7xl px-4">
        <div className="flex flex-col lg:flex-row gap-6 py-6">
          {/* Main Content Area */}
          <main className={`flex-1 ${state.phase === "checkpoint" ? "max-w-4xl mx-auto" : ""}`}>
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
                <div className="reading-passage text-foreground whitespace-pre-wrap leading-relaxed">
                    {state.passage.text.split(/\s+/).map((word, index) => (
                      <PhonicsWord key={index} word={word} gradeLevel={session.readingLevel} />
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Take your time reading. Need help? Ask your AI Reading Buddy! When you're ready,
                    tap the button below to answer questions.
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
            {state.phase === "questions" && currentQuestion && (
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
                      {currentQuestion.type.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-6">{currentQuestion.text}</h3>

                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={state.showFeedback}
                        className={`answer-option ${
                          state.selectedAnswer === option ? "selected" : ""
                        } ${
                          state.showFeedback
                            ? option === currentQuestion.correctAnswer
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
                            option === currentQuestion.correctAnswer && (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            )}
                          {state.showFeedback &&
                            state.selectedAnswer === option &&
                            option !== currentQuestion.correctAnswer && (
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
                            {currentQuestion.explanation}
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
                </div>

                {/* Strengths */}
                {strengths.length > 0 && (
                  <div className="card-elevated border-success/30">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-success" />
                      <h3 className="font-display font-bold text-success">Your Strengths</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Great job! You're doing well with these skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {strengths.map((skill) => {
                        const perf = state.sessionStats.skillPerformance[skill];
                        const accuracy = Math.round((perf.correct / perf.total) * 100);
                        return (
                          <span
                            key={skill}
                            className="skill-chip bg-success/10 text-success text-xs"
                          >
                            {skill.replace("_", " ")} ({accuracy}%)
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Weaknesses */}
                {weaknesses.length > 0 && (
                  <div className="card-elevated border-warning/30">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingDown className="w-5 h-5 text-warning" />
                      <h3 className="font-display font-bold text-warning">Areas to Improve</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Keep practicing these skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {weaknesses.map((skill) => {
                        const perf = state.sessionStats.skillPerformance[skill];
                        const accuracy = Math.round((perf.correct / perf.total) * 100);
                        return (
                          <span
                            key={skill}
                            className="skill-chip bg-warning/10 text-warning text-xs"
                          >
                            {skill.replace("_", " ")} ({accuracy}%)
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Skill Breakdown */}
                {Object.keys(state.sessionStats.skillPerformance).length > 0 && (
                  <div className="card-elevated">
                    <h3 className="font-display font-bold mb-4">Skill Breakdown</h3>
                    <div className="space-y-3">
                      {Object.entries(state.sessionStats.skillPerformance).map(([skill, perf]) => {
                        const accuracy = perf.total > 0 ? (perf.correct / perf.total) * 100 : 0;
                        return (
                          <div key={skill}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-foreground capitalize">{skill.replace("_", " ")}</span>
                              <span className="text-muted-foreground">
                                {perf.correct}/{perf.total} ({Math.round(accuracy)}%)
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  accuracy >= 70
                                    ? "bg-success"
                                    : accuracy >= 50
                                    ? "bg-warning"
                                    : "bg-destructive"
                                }`}
                                style={{ width: `${accuracy}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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

          {/* AI Tutor Sidebar - Desktop: Always visible, Mobile: Toggleable */}
          {(state.phase === "reading" || state.phase === "questions") && state.passage && (
            <>
              {/* Desktop Sidebar */}
              <aside className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
                <div className="sticky top-24 h-[calc(100vh-8rem)]">
                  <AITutor
                    passageText={state.passage.text}
                    gradeLevel={session?.readingLevel || 5}
                    currentQuestion={currentQuestion?.text}
                    currentQuestionType={currentQuestion?.type}
                    passageId={state.passage.id}
                  />
                </div>
              </aside>

              {/* Mobile Drawer */}
              {state.showTutor && (
                <div className="fixed inset-0 z-50 lg:hidden">
                  <div
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    onClick={toggleTutor}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-[75vh] bg-background rounded-t-3xl shadow-2xl p-4 fade-in-up flex flex-col">
                     {/* Close button row */}
                     <div className="flex items-center justify-between mb-2 flex-shrink-0">
                       <div className="w-12 h-1 bg-muted rounded-full" />
                       <button
                         onClick={toggleTutor}
                         className="p-2 rounded-xl hover:bg-muted transition-colors"
                         aria-label="Close AI tutor"
                       >
                         <X className="w-5 h-5 text-muted-foreground" />
                       </button>
                     </div>
                     <div className="flex-1 min-h-0">
                       <AITutor
                         passageText={state.passage.text}
                         gradeLevel={session?.readingLevel || 5}
                         currentQuestion={currentQuestion?.text}
                         currentQuestionType={currentQuestion?.type}
                         passageId={state.passage.id}
                       />
                     </div>
                   </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Session;
