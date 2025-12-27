import { useState, useEffect } from "react";
import { Mic, MicOff, Loader2, AlertCircle, CheckCircle2, RotateCcw, BookOpen, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { compareTexts, getTargetWPM, getFluencyFeedback, ComparisonResult } from "@/utils/textComparison";
import { useAI } from "@/hooks/useAI";

interface ReadAloudAssessmentProps {
  currentLevel: number;
  onComplete: (accuracy: number, wpm: number, level: number) => void;
  onSkip: () => void;
}

type Phase = "loading" | "ready" | "countdown" | "recording" | "results";

const ReadAloudAssessment = ({ currentLevel, onComplete, onSkip }: ReadAloudAssessmentProps) => {
  const [phase, setPhase] = useState<Phase>("loading");
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  
  const { generateReadAloudSentences, isLoading } = useAI();
  const {
    isListening,
    transcript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    elapsedTime,
  } = useSpeechRecognition();

  // Load sentences for current level
  useEffect(() => {
    const loadSentences = async () => {
      setPhase("loading");
      const data = await generateReadAloudSentences(currentLevel);
      if (data?.sentences) {
        setSentences(data.sentences);
        setPhase("ready");
      }
    };
    loadSentences();
  }, [currentLevel]);

  // Handle countdown
  useEffect(() => {
    if (phase === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === "countdown" && countdown === 0) {
      setPhase("recording");
      startListening();
    }
  }, [phase, countdown, startListening]);

  const handleStartRecording = () => {
    setCountdown(3);
    resetTranscript();
    setPhase("countdown");
  };

  const handleStopRecording = () => {
    stopListening();
    
    // Calculate results
    const currentSentence = sentences[currentSentenceIndex];
    const comparison = compareTexts(currentSentence, transcript, elapsedTime);
    setResult(comparison);
    setPhase("results");
  };

  const handleNextSentence = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
      resetTranscript();
      setResult(null);
      setPhase("ready");
    } else {
      // Assessment complete - use last result
      if (result) {
        onComplete(result.accuracy, result.wordsPerMinute, currentLevel);
      }
    }
  };

  const handleRetry = () => {
    resetTranscript();
    setResult(null);
    setPhase("ready");
  };

  if (!isSupported) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Speech Recognition Not Available</h3>
          <p className="text-muted-foreground mb-4">
            Your browser doesn't support speech recognition. Please use Chrome, Safari, or Edge.
          </p>
        </div>
        <button onClick={onSkip} className="btn-hero">
          Skip to Vocabulary Assessment
        </button>
      </div>
    );
  }

  const currentSentence = sentences[currentSentenceIndex];
  const targetWPM = getTargetWPM(currentLevel);
  const feedback = result ? getFluencyFeedback(result.accuracy, result.wordsPerMinute, targetWPM) : null;

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold mb-2">
          Read Aloud
        </h2>
        <p className="text-muted-foreground">
          Grade {currentLevel} • Sentence {currentSentenceIndex + 1} of {sentences.length}
        </p>
      </div>

      {/* Loading State */}
      {phase === "loading" && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Generating sentences...</p>
        </div>
      )}

      {/* Ready State */}
      {phase === "ready" && currentSentence && (
        <div className="space-y-6">
          <div className="card-elevated text-center">
            <p className="text-xl sm:text-2xl font-medium leading-relaxed">
              "{currentSentence}"
            </p>
          </div>
          
          <div className="text-center text-muted-foreground">
            <p>When you're ready, tap the button and read the sentence aloud.</p>
          </div>
          
          <button
            onClick={handleStartRecording}
            className="btn-hero w-full flex items-center justify-center gap-3"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </button>
        </div>
      )}

      {/* Countdown State */}
      {phase === "countdown" && (
        <div className="flex flex-col items-center justify-center py-12 gap-6">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-6xl font-bold text-primary celebration-bounce">
              {countdown}
            </span>
          </div>
          <p className="text-muted-foreground">Get ready to read...</p>
          <div className="card-elevated text-center max-w-md">
            <p className="text-lg font-medium">"{currentSentence}"</p>
          </div>
        </div>
      )}

      {/* Recording State */}
      {phase === "recording" && (
        <div className="space-y-6">
          <div className="card-elevated text-center">
            <p className="text-xl sm:text-2xl font-medium leading-relaxed">
              "{currentSentence}"
            </p>
          </div>
          
          {/* Recording Indicator */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
                <Mic className="w-12 h-12 text-destructive" />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-destructive text-destructive-foreground text-sm rounded-full">
                Recording...
              </span>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-mono font-bold">{elapsedTime}s</p>
              {transcript && (
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                  Heard: "{transcript}"
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={handleStopRecording}
            className="btn-hero w-full bg-destructive hover:bg-destructive/90 flex items-center justify-center gap-3"
          >
            <MicOff className="w-5 h-5" />
            Stop Recording
          </button>
          
          {speechError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              {speechError}
            </div>
          )}
        </div>
      )}

      {/* Results State */}
      {phase === "results" && result && feedback && (
        <div className="space-y-6">
          {/* Sentence with word highlighting */}
          <div className="card-elevated">
            <p className="text-sm text-muted-foreground mb-3">Your reading:</p>
            <p className="text-lg leading-relaxed">
              {result.wordResults.map((wr, i) => (
                <span
                  key={i}
                  className={`inline-block mr-1 px-1 rounded ${
                    wr.isCorrect 
                      ? "bg-success/20 text-success" 
                      : "bg-destructive/20 text-destructive line-through"
                  }`}
                >
                  {wr.word}
                </span>
              ))}
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card-elevated text-center">
              <p className="text-3xl font-bold text-primary">
                {Math.round(result.accuracy)}%
              </p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
            <div className="card-elevated text-center">
              <p className="text-3xl font-bold text-primary">
                {result.wordsPerMinute}
              </p>
              <p className="text-sm text-muted-foreground">Words/Min</p>
            </div>
          </div>
          
          {/* Feedback */}
          <div className={`p-4 rounded-xl ${
            feedback.rating === "excellent" || feedback.rating === "good"
              ? "bg-success/10 border border-success/20"
              : feedback.rating === "developing"
              ? "bg-amber-500/10 border border-amber-500/20"
              : "bg-destructive/10 border border-destructive/20"
          }`}>
            <div className="flex items-start gap-3">
              {feedback.rating === "excellent" || feedback.rating === "good" ? (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{feedback.message}</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={handleNextSentence}
              className="flex-1 btn-hero"
            >
              {currentSentenceIndex < sentences.length - 1 ? "Next Sentence" : "Complete"}
            </button>
          </div>
        </div>
      )}

      {/* Research Methodology Section - shown on all phases except loading */}
      {phase !== "loading" && (
        <Collapsible className="mt-8 border-t border-border pt-6">
          <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center group">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Research-Based Methodology</span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4 text-xs text-muted-foreground">
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="font-medium text-foreground/80 mb-1.5">Key Research Sources</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li><span className="font-medium">Hasbrouck & Tindal (2017)</span> — Most widely cited oral reading fluency norms</li>
                  <li><span className="font-medium">DIBELS Next</span> — Dynamic Indicators of Basic Early Literacy Skills</li>
                  <li><span className="font-medium">National Reading Panel</span> — Fluency as critical component of reading instruction</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground/80 mb-1.5">Important Considerations</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Oral reading fluency (measured via speech recognition) typically plateaus around 200 WPM for fluent adult readers</li>
                  <li>Silent reading is faster (250–300+ WPM for adults), but we measure oral reading</li>
                  <li>College-level (Grade 13) at 200 WPM represents mature, fluent oral reading</li>
                </ul>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default ReadAloudAssessment;
