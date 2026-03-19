import { useState, useEffect } from "react";
import { Volume2, VolumeX, BookOpen, Loader2 } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PhonicsWordProps {
  word: string;
  gradeLevel: number;
  fontSize?: string;
}

interface DictionaryDefinition {
  partOfSpeech: string;
  definition: string;
  example?: string;
}

// Simple phonetic breakdown helper
const getPhoneticBreakdown = (word: string): string => {
  const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
  
  const vowels = "aeiouy";
  let syllables: string[] = [];
  let currentSyllable = "";
  let prevWasVowel = false;
  
  for (let i = 0; i < cleanWord.length; i++) {
    const char = cleanWord[i];
    const isVowel = vowels.includes(char);
    
    currentSyllable += char;
    
    if (isVowel && !prevWasVowel && currentSyllable.length > 1 && i < cleanWord.length - 1) {
      const nextIsVowel = vowels.includes(cleanWord[i + 1]);
      if (!nextIsVowel && i < cleanWord.length - 2) {
        syllables.push(currentSyllable);
        currentSyllable = "";
      }
    }
    prevWasVowel = isVowel;
  }
  
  if (currentSyllable) {
    syllables.push(currentSyllable);
  }
  
  if (syllables.length <= 1) {
    return cleanWord;
  }
  
  return syllables.join(" · ");
};

const PhonicsWord = ({ word, gradeLevel, fontSize }: PhonicsWordProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [definition, setDefinition] = useState<DictionaryDefinition | null>(null);
  const [isLoadingDefinition, setIsLoadingDefinition] = useState(false);
  const { speak, soundOut, isSupported } = useTextToSpeech();
  
  const cleanWord = word.replace(/[.,!?;:'"]+$/, "");
  const punctuation = word.slice(cleanWord.length);
  const phoneticBreakdown = getPhoneticBreakdown(cleanWord);
  const showDefinition = gradeLevel >= 4;

  // Fetch dictionary definition when popover opens (only for grade 4+)
  useEffect(() => {
    if (isOpen && showDefinition && !definition && cleanWord.length >= 3) {
      setIsLoadingDefinition(true);
      fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord.toLowerCase()}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data[0]?.meanings?.[0]) {
            const meaning = data[0].meanings[0];
            const def = meaning.definitions[0];
            setDefinition({
              partOfSpeech: meaning.partOfSpeech,
              definition: def.definition,
              example: def.example,
            });
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingDefinition(false));
    }
  }, [isOpen, cleanWord, definition, showDefinition]);

  if (cleanWord.length < 2) {
    return <span>{word} </span>;
  }




  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={`hover:bg-primary/10 hover:text-primary rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px] min-w-[44px] inline-flex items-center justify-center ${
              gradeLevel <= 2 ? "px-1.5 -mx-1" : gradeLevel <= 4 ? "px-1 -mx-0.5" : "px-0.5 -mx-0.5"
            }`}
            style={fontSize ? { fontSize } : undefined}
            onClick={() => setIsOpen(true)}
          >
            {cleanWord}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="center">
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{cleanWord}</p>
              <p className="text-sm text-muted-foreground font-mono">
                {phoneticBreakdown}
              </p>
            </div>

            {/* Dictionary Definition - only for Grade 4+ */}
            {showDefinition && (
              <div className="border-t pt-3">
                {isLoadingDefinition ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading definition...</span>
                  </div>
                ) : definition ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-primary uppercase">
                        {definition.partOfSpeech}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{definition.definition}</p>
                    {definition.example && (
                      <p className="text-xs text-muted-foreground italic">
                        "{definition.example}"
                      </p>
                    )}
                  </div>
                ) : cleanWord.length >= 3 ? (
                  <p className="text-xs text-muted-foreground text-center">
                    No definition available
                  </p>
                ) : null}
              </div>
            )}
            
            {isSupported ? (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => speak(cleanWord)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
                >
                  <Volume2 className="w-4 h-4" />
                  Say it
                </button>
                <button
                  onClick={() => soundOut(cleanWord)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors text-sm"
                >
                  <Volume2 className="w-4 h-4" />
                  Sound Out
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <VolumeX className="w-4 h-4" />
                <span>Audio not available</span>
              </div>
            )}
            
            <p className="text-xs text-center text-muted-foreground">
              Tap the buttons to hear the word
            </p>
          </div>
        </PopoverContent>
      </Popover>
      {punctuation}
      <span> </span>
    </>
  );
};

export default PhonicsWord;
