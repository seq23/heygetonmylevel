import { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { getAssessmentWordSet, calculateLevelFromVocabulary } from "@/constants/assessmentWords";

interface VocabularyAssessmentProps {
  onComplete: (estimatedLevel: number) => void;
}

interface WordItem {
  word: string;
  grade: number;
  selected: boolean;
}

const VocabularyAssessment = ({ onComplete }: VocabularyAssessmentProps) => {
  const [words, setWords] = useState<WordItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Get 20 random words from different grade levels
    const wordSet = getAssessmentWordSet(20);
    setWords(wordSet.map(w => ({ ...w, selected: false })));
  }, []);

  const toggleWord = (index: number) => {
    setWords(prev => 
      prev.map((w, i) => 
        i === index ? { ...w, selected: !w.selected } : w
      )
    );
  };

  const handleSubmit = () => {
    setIsAnalyzing(true);
    
    // Calculate level based on selected words
    const knownWords = words.filter(w => w.selected).map(w => ({ word: w.word, grade: w.grade }));
    const allWords = words.map(w => ({ word: w.word, grade: w.grade }));
    
    const estimatedLevel = calculateLevelFromVocabulary(knownWords, allWords);
    
    // Brief delay for UX
    setTimeout(() => {
      onComplete(estimatedLevel);
    }, 800);
  };

  const selectedCount = words.filter(w => w.selected).length;

  return (
    <div className="space-y-6 fade-in-up">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold mb-2">
          Quick Vocabulary Check
        </h2>
        <p className="text-muted-foreground">
          Tap all the words you know and understand. Be honest – this helps us find the right level for you!
        </p>
      </div>

      {/* Word Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {words.map((item, index) => (
          <button
            key={`${item.word}-${index}`}
            onClick={() => toggleWord(index)}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-200
              font-medium text-lg
              ${item.selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card hover:border-primary/50 hover:bg-muted"
              }
            `}
          >
            {item.word}
            {item.selected && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Status */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
        <span className="text-muted-foreground">
          Words selected
        </span>
        <span className="text-2xl font-bold text-primary">
          {selectedCount} / {words.length}
        </span>
      </div>

      {/* Tip */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <p className="text-sm text-amber-700 dark:text-amber-300">
          💡 <strong>Tip:</strong> Only select words you're confident you know. It's okay if you don't know all of them!
        </p>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isAnalyzing}
        className="btn-hero w-full"
      >
        {isAnalyzing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing...
          </span>
        ) : (
          "Find My Reading Level"
        )}
      </button>
    </div>
  );
};

export default VocabularyAssessment;
