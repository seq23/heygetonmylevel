import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
  const [words, setWords] = useState<WordItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const wordSet = getAssessmentWordSet(24);
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
    
    const knownWords = words.filter(w => w.selected).map(w => ({ word: w.word, grade: w.grade }));
    const allWords = words.map(w => ({ word: w.word, grade: w.grade }));
    
    const estimatedLevel = calculateLevelFromVocabulary(knownWords, allWords);
    
    setTimeout(() => {
      onComplete(estimatedLevel);
    }, 800);
  };

  const selectedCount = words.filter(w => w.selected).length;

  return (
    <div className="space-y-6 fade-in-up">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold mb-2">
          {t("vocab.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("vocab.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {words.map((item, index) => (
          <button
            key={`${item.word}-${index}`}
            onClick={() => toggleWord(index)}
            aria-pressed={item.selected}
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

      <div className="flex items-center justify-between p-4 bg-muted rounded-xl" aria-live="polite">
        <span className="text-muted-foreground">
          {t("vocab.selected")}
        </span>
        <span className="text-2xl font-bold text-primary">
          {selectedCount} / {words.length}
        </span>
      </div>

      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <p className="text-sm text-amber-700 dark:text-amber-300">
          💡 <strong>{t("vocab.tip.label")}</strong> {t("vocab.tip")}
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isAnalyzing}
        className="btn-hero w-full"
      >
        {isAnalyzing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            {t("vocab.analyzing")}
          </span>
        ) : (
          t("vocab.submit")
        )}
      </button>
    </div>
  );
};

export default VocabularyAssessment;
