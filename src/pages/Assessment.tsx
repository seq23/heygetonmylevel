import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Mic, CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useAI } from "@/hooks/useAI";
import VocabularyAssessment from "@/components/VocabularyAssessment";
import ReadAloudAssessment from "@/components/ReadAloudAssessment";

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
  
  // Confirmation passage state
  const [confirmationPassage, setConfirmationPassage] = useState<ConfirmationPassage | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [confirmationCorrect, setConfirmationCorrect] = useState(0);

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
    }
  };

  const handleVocabularyComplete = async (level: number) => {
    setEstimatedLevel(level);
    
    if (assessmentType === "both") {
      setPhase("read_aloud");
    } else {
      // Load confirmation passage
      await loadConfirmationPassage(level);
    }
  };

  const handleReadAloudComplete = async (accuracy: number, wpm: number, level: number) => {
    setReadAloudResults({ accuracy, wpm, level });
    
    // Calculate combined level if both assessments done
    if (assessmentType === "both" && estimatedLevel) {
      const combinedLevel = Math.round((estimatedLevel + level) / 2);
      await loadConfirmationPassage(combinedLevel);
    } else {
      await loadConfirmationPassage(level);
    }
  };

  const loadConfirmationPassage = async (level: number) => {
    setPhase("confirmation");
    const data = await generateVocabularyConfirmation(level);
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
      // Calculate final level
      calculateFinalLevel();
    }
  };

  const calculateFinalLevel = () => {
    let baseLevel = estimatedLevel || readAloudResults?.level || 5;
    
    // Adjust based on confirmation passage performance
    if (confirmationPassage) {
      const accuracy = confirmationCorrect / confirmationPassage.questions.length;
      if (accuracy >= 0.8) {
        baseLevel = Math.min(12, baseLevel + 1);
      } else if (accuracy < 0.5) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <h1 className="text-xl font-display font-bold">Reading Assessment</h1>
            <p className="text-sm text-muted-foreground">
              {phase === "select_type" && "Choose assessment type"}
              {phase === "vocabulary" && "Vocabulary Check"}
              {phase === "read_aloud" && "Read Aloud"}
              {phase === "confirmation" && "Confirm Your Level"}
              {phase === "result" && "Assessment Complete"}
            </p>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-8 px-6">
        {/* Assessment Type Selection */}
        {phase === "select_type" && (
          <div className="space-y-6 fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold mb-2">
                How would you like to assess your reading?
              </h2>
              <p className="text-muted-foreground">
                Choose the assessment method that works best for you
              </p>
            </div>

            <div className="grid gap-4">
              {/* Vocabulary Option */}
              <button
                onClick={() => handleTypeSelect("vocabulary")}
                className="card-elevated text-left hover:border-primary/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Vocabulary Check</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Quick 30-second assessment – tap words you know
                    </p>
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Sparkles className="w-4 h-4" />
                      <span>Fastest option</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Read Aloud Option */}
              <button
                onClick={() => handleTypeSelect("read_aloud")}
                className="card-elevated text-left hover:border-primary/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Mic className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Read Aloud</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Read sentences out loud to test fluency & speed
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Requires microphone</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Both Option */}
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
                      <h3 className="text-lg font-semibold">Both</h3>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Comprehensive assessment for the most accurate level
                    </p>
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Sparkles className="w-4 h-4" />
                      <span>Most accurate results</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Vocabulary Assessment */}
        {phase === "vocabulary" && (
          <VocabularyAssessment onComplete={handleVocabularyComplete} />
        )}

        {/* Read Aloud Assessment */}
        {phase === "read_aloud" && (
          <ReadAloudAssessment
            currentLevel={estimatedLevel || 5}
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

        {/* Confirmation Passage */}
        {phase === "confirmation" && (
          <div className="space-y-6 fade-in-up">
            {isLoading || !confirmationPassage ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground">Preparing confirmation passage...</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <h2 className="text-xl font-display font-bold">
                    Let's confirm your level
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Read this short passage and answer the questions
                  </p>
                </div>

                {/* Passage */}
                <div className="card-elevated">
                  <h3 className="text-lg font-semibold mb-3">{confirmationPassage.title}</h3>
                  <p className="reading-passage text-foreground whitespace-pre-wrap">
                    {confirmationPassage.text}
                  </p>
                </div>

                {/* Question */}
                <div className="question-card">
                  <div className="mb-2 text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {confirmationPassage.questions.length}
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

                  {/* Feedback */}
                  {showFeedback && (
                    <div
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
                            {isCorrect ? "Correct!" : "Not quite right"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {confirmationPassage.questions[currentQuestionIndex].explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6">
                    {!showFeedback ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedAnswer}
                        className="btn-hero w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button onClick={handleNextQuestion} className="btn-hero w-full">
                        {currentQuestionIndex < confirmationPassage.questions.length - 1
                          ? "Next Question"
                          : "See Results"}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Result Phase */}
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
                Your reading level is{" "}
                <span className="text-primary">
                  {finalLevel <= 12 ? `Grade ${finalLevel}` : "College"}
                </span>
              </h2>
              <p className="text-muted-foreground mt-2">
                Based on your assessment, we've found the perfect level for you to practice.
              </p>
            </div>

            {/* Summary */}
            <div className="card-elevated max-w-sm mx-auto text-left">
              <div className="text-sm text-muted-foreground mb-3">Assessment Summary</div>
              
              {estimatedLevel && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span>Vocabulary Level</span>
                  <span className="font-semibold">Grade {estimatedLevel}</span>
                </div>
              )}
              
              {readAloudResults && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span>Reading Accuracy</span>
                    <span className="font-semibold text-success">{Math.round(readAloudResults.accuracy)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span>Reading Speed</span>
                    <span className="font-semibold">{readAloudResults.wpm} WPM</span>
                  </div>
                </>
              )}
              
              {confirmationPassage && (
                <div className="flex justify-between items-center py-2">
                  <span>Confirmation Score</span>
                  <span className="font-semibold">
                    {confirmationCorrect}/{confirmationPassage.questions.length}
                  </span>
                </div>
              )}
            </div>

            <button onClick={handleStartLearning} className="btn-hero">
              Start Learning at Grade {finalLevel <= 12 ? finalLevel : "College"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Assessment;
