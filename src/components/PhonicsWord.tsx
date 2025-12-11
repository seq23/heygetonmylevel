import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PhonicsWordProps {
  word: string;
  gradeLevel: number;
}

// Simple phonetic breakdown helper
const getPhoneticBreakdown = (word: string): string => {
  // Remove punctuation for phonetic analysis
  const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
  
  // Simple syllable detection (basic heuristic)
  const vowels = "aeiouy";
  let syllables: string[] = [];
  let currentSyllable = "";
  let prevWasVowel = false;
  
  for (let i = 0; i < cleanWord.length; i++) {
    const char = cleanWord[i];
    const isVowel = vowels.includes(char);
    
    currentSyllable += char;
    
    if (isVowel && !prevWasVowel && currentSyllable.length > 1 && i < cleanWord.length - 1) {
      // End syllable after vowel if next is consonant
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
  
  // If only one syllable or detection failed, return the word
  if (syllables.length <= 1) {
    return cleanWord;
  }
  
  return syllables.join(" · ");
};

const PhonicsWord = ({ word, gradeLevel }: PhonicsWordProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { speak, soundOut, isSupported } = useTextToSpeech();
  
  // Clean word for display (remove trailing punctuation for speech)
  const cleanWord = word.replace(/[.,!?;:'"]+$/, "");
  const punctuation = word.slice(cleanWord.length);
  
  // Skip very short words or punctuation-only
  if (cleanWord.length < 2) {
    return <span>{word} </span>;
  }

  const phoneticBreakdown = getPhoneticBreakdown(cleanWord);

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="hover:bg-primary/10 hover:text-primary rounded px-0.5 -mx-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            onClick={() => setIsOpen(true)}
          >
            {cleanWord}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="center">
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{cleanWord}</p>
              <p className="text-sm text-muted-foreground font-mono">
                {phoneticBreakdown}
              </p>
            </div>
            
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
