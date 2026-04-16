import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Mic, CheckCircle2, XCircle, Loader2, Sparkles, Globe } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAI } from "@/hooks/useAI";
import VocabularyAssessment from "@/components/VocabularyAssessment";
import ReadAloudAssessment from "@/components/ReadAloudAssessment";
import Footer from "@/components/Footer";

type AssessmentType = "vocabulary" | "read_aloud" | "both";
type Phase = "select_type" | "vocabulary" | "read_aloud" | "confirmation" | "result";

interface ConfirmationQuestion {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface ConfirmationPassage {
  title: string;
  text: string;
  questions: ConfirmationQuestion[];
}

const Assessment = () => {
  const navigate = useNavigate();
  const { session, updateReadingLevel, setAssessmentTaken } = useSession();
  const { t, language } = useLanguage();
  const { generateVocabularyConfirmation, isLoading } = useAI();

  const [assessmentType, setAssessmentType] = useState<AssessmentType | null>(null);
  const [phase, setPhase] = useState<Phase>("select_type");
  const [estimatedLevel, setEstimatedLevel] = useState<number | null>(null);
  const [readAloudResults, setReadAloudResults] = useState<{
    accuracy: number;
    wpm: number;
    level: number;
  } | null>(null);
  const [finalLevel, setFinalLevel] = useState<number | null>(null);
  const [isESL, setIsESL] = useState(false);
  
  const [confirmationPassage, setConfirmationPassage] = useState<ConfirmationPassage | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [confirmationCorrect, setConfirmationCorrect] = useState(0);

  // Pre-fetch cache for the confirmation passage so it's ready by the time
  // the user finishes read-aloud. Keyed by level to avoid stale matches.
  const [prefetchedConfirmation, setPrefetchedConfirmation] = useState<{
    level: number;
    promise: Promise<ConfirmationPassage | null>;
  } | null>(null);

  useEffect(() => {
    if (!session) {
      navigate("/");
    }
  }, [session, navigate]);

  const handleTypeSelect = (type: AssessmentType) => {
    setAssessmentType(type);
    if (type === "vocabulary" || type === "both") {
      setPhase("vocabulary");
    } else {
      setPhase("read_aloud");
      // Pre-fetch confirmation passage in parallel using a sensible starting level.
      // If the read-aloud assessment lands on a different level, we'll re-fetch then.
      const guessLevel = 5;
      setPrefetchedConfirmation({
        level: guessLevel,
        promise: generateVocabularyConfirmation(guessLevel, language),
      });
    }
  };

  const handleVocabularyComplete = async (level: number) => {
    setEstimatedLevel(level);
    
    if (assessmentType === "both") {
      setPhase("read_aloud");
      // Pre-fetch confirmation passage in parallel while user does read-aloud.
      setPrefetchedConfirmation({
        level,
        promise: generateVocabularyConfirmation(level, language),
      });
    } else {
      await loadConfirmationPassage(level);
    }
  };

  const handleReadAloudComplete = async (accuracy: number, wpm: number, level: number) => {
    setReadAloudResults({ accuracy, wpm, level });
    
    if (assessmentType === "both" && estimatedLevel) {
      const combinedLevel = Math.round(estimatedLevel * 0.6 + level * 0.4);
      await loadConfirmationPassage(combinedLevel);
    } else {
      await loadConfirmationPassage(level);
    }
  };

  const loadConfirmationPassage = async (level: number) => {
    setPhase("confirmation");

    // Reuse pre-fetched passage if it matches the level we ended up at.
    if (prefetchedConfirmation && prefetchedConfirmation.level === level) {
      const data = await prefetchedConfirmation.promise;
      if (data) {
        setConfirmationPassage(data);
        return;
      }
    }

    const data = await generateVocabularyConfirmation(level, language);
    if (data) {
      setConfirmationPassage(data);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !confirmationPassage) return;
    
    const currentQuestion = confirmationPassage.questions[currentQuestionIndex];
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) {
      setConfirmationCorrect(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!confirmationPassage) return;
    
    if (currentQuestionIndex < confirmationPassage.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(null);
    } else {
      calculateFinalLevel();
    }
  };

  const calculateFinalLevel = () => {
    let baseLevel = estimatedLevel || readAloudResults?.level || 5;
    
    if (confirmationPassage) {
      const accuracy = confirmationCorrect / confirmationPassage.questions.length;
      if (accuracy >= 1.0) {
        baseLevel = Math.min(13, baseLevel + 2);
      } else if (accuracy >= 0.8) {
        baseLevel = Math.min(13, baseLevel + 1);
      } else if (accuracy < 0.4) {
        baseLevel = Math.max(1, baseLevel - 1);
      }
    }
    
    setFinalLevel(baseLevel);
    setPhase("result");
  };

  const handleStartLearning = async () => {
    if (finalLevel) {
      await updateReadingLevel(finalLevel);
      await setAssessmentTaken(true);
      navigate("/dashboard");
    }
  };

  if (!session) return null;

  const gradeLabel = (level: number) =>
    level <= 12 ? `${t("level.grade")} ${level}` : t("level.college");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container max-w-4xl py-4 flex items-center gap-4 px-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold">{t("assessment.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {phase === "select_type" && t("assessment.chooseType")}
              {phase === "vocabulary" && t("assessment.vocabCheck")}
              {phase === "read_aloud" && t("assessment.readAloud")}
              {phase === "confirmation" && t("assessment.confirmLevel")}
              {phase === "result" && t("assessment.complete")}
            </p>
          </div>
        </div>
      </header>

      {phase === "select_type" && (
        <div className="bg-primary/5 border-b border-primary/10 py-3 px-4">
          <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
            <span className="text-primary font-medium">✨ </span>
            {t("assessment.reassurance")}
          </p>
        </div>
      )}

      <main className="container max-w-4xl py-8 px-6">
        {phase === "select_type" && (
          <div className="space-y-6 fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold mb-2">
                {t("assessment.howAssess")}
              </h2>
              <p className="text-muted-foreground">
                {t("assessment.chooseMethod")}
              </p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={() => handleTypeSelect("vocabulary")}
                className="card-elevated text-left hover:border-primary/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{t("assessment.vocabCheck")}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("assessment.quick30")}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Sparkles className="w-4 h-4" />
                      <span>{t("assessment.fastest")}</span>
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect("read_aloud")}
                className="card-elevated text-left hover:border-primary/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Mic className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{t("assessment.readAloud")}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("assessment.readSentences")}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{t("assessment.requiresMic")}</span>
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect("both")}
                className="card-elevated text-left hover:border-primary/50 transition-all group border-primary/30"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                    <div className="flex -space-x-1">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <Mic className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{t("assessment.both")}</h3>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        {t("assessment.recommended")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("assessment.comprehensive")}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Sparkles className="w-4 h-4" />
                      <span>{t("assessment.mostAccurate")}</span>
                    </div>
                  </div>
                </div>
              </button>

              <label
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-card hover:border-primary/30 transition-all cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t("assessment.eslToggle")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("assessment.eslDesc")}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isESL}
                  onChange={(e) => setIsESL(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary accent-primary cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {phase === "vocabulary" && (
          <VocabularyAssessment onComplete={handleVocabularyComplete} />
        )}

        {phase === "read_aloud" && (
          <ReadAloudAssessment
            currentLevel={estimatedLevel || 5}
            isESL={isESL}
            onComplete={handleReadAloudComplete}
            onSkip={() => {
              if (estimatedLevel) {
                loadConfirmationPassage(estimatedLevel);
              } else {
                loadConfirmationPassage(5);
              }
            }}
          />
        )}

        {phase === "confirmation" && (
          <div className="space-y-6 fade-in-up">
            {isLoading || !confirmationPassage ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground">{t("assessment.preparing")}</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <h2 className="text-xl font-display font-bold">
                    {t("assessment.confirmTitle")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("assessment.confirmDesc")}
                  </p>
                </div>

                <div className="card-elevated">
                  <h3 className="text-lg font-semibold mb-3">{confirmationPassage.title}</h3>
                  <p className="reading-passage text-foreground whitespace-pre-wrap">
                    {confirmationPassage.text}
                  </p>
                </div>

                <div className="question-card">
                  <div className="mb-2 text-sm text-muted-foreground">
                    {t("assessment.questionOf")} {currentQuestionIndex + 1} {t("assessment.of")} {confirmationPassage.questions.length}
                  </div>
                  <h3 className="text-lg font-semibold mb-6">
                    {confirmationPassage.questions[currentQuestionIndex].text}
                  </h3>

                  <div className="space-y-3">
                    {confirmationPassage.questions[currentQuestionIndex].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={showFeedback}
                        aria-pressed={selectedAnswer === option}
                        className={`answer-option ${
                          selectedAnswer === option ? "selected" : ""
                        } ${
                          showFeedback
                            ? option === confirmationPassage.questions[currentQuestionIndex].correctAnswer
                              ? "correct"
                              : selectedAnswer === option
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

                  {showFeedback && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className={`mt-6 p-4 rounded-2xl fade-in-up ${
                        isCorrect ? "bg-success/10" : "bg-destructive/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                        ) : (
                          <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold">
                            {isCorrect ? t("assessment.correct") : t("assessment.notQuiteRight")}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {confirmationPassage.questions[currentQuestionIndex].explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    {!showFeedback ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedAnswer}
                        className="btn-hero w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t("session.submitAnswer")}
                      </button>
                    ) : (
                      <button onClick={handleNextQuestion} className="btn-hero w-full">
                        {currentQuestionIndex < confirmationPassage.questions.length - 1
                          ? t("session.nextQuestion")
                          : t("assessment.seeResults")}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {phase === "result" && finalLevel && (
          <div className="text-center space-y-8 py-8 fade-in-up">
            <div className="celebration-bounce">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-4">
                <span className="text-5xl font-display font-bold text-primary">
                  {finalLevel <= 12 ? finalLevel : "C"}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-display font-bold">
                {t("assessment.yourLevel")}{" "}
                <span className="text-primary">
                  {gradeLabel(finalLevel)}
                </span>
              </h2>
              <p className="text-muted-foreground mt-2">
                {t("assessment.foundLevel")}
              </p>
            </div>

            <div className="card-elevated max-w-sm mx-auto text-left">
              <div className="text-sm text-muted-foreground mb-3">{t("assessment.summary")}</div>
              
              {estimatedLevel && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span>{t("assessment.vocabLevel")}</span>
                  <span className="font-semibold">{gradeLabel(estimatedLevel)}</span>
                </div>
              )}
              
              {readAloudResults && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span>{t("assessment.readingAccuracy")}</span>
                    <span className="font-semibold text-success">{Math.round(readAloudResults.accuracy)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span>{t("assessment.readingSpeed")}</span>
                    <span className="font-semibold">{readAloudResults.wpm} WPM</span>
                  </div>
                </>
              )}
              
              {confirmationPassage && (
                <div className="flex justify-between items-center py-2">
                  <span>{t("assessment.confirmScore")}</span>
                  <span className="font-semibold">
                    {confirmationCorrect}/{confirmationPassage.questions.length}
                  </span>
                </div>
              )}
            </div>

            <button onClick={handleStartLearning} className="btn-hero">
              {t("assessment.startLearning")} {finalLevel <= 12 ? finalLevel : t("level.college")}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Assessment;
