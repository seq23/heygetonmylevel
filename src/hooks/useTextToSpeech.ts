import { useCallback, useRef } from "react";

// Simple syllable splitting helper
const splitIntoSyllables = (word: string): string[] => {
  const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
  
  if (cleanWord.length <= 3) {
    return [cleanWord];
  }
  
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
  
  return syllables.length > 0 ? syllables : [cleanWord];
};

export const useTextToSpeech = () => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getPreferredVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    // Prefer softer, natural-sounding voices (Samantha on macOS/iOS, Karen on some systems)
    return voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Samantha")
    ) || voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Karen")
    ) || voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Natural")
    ) || voices.find(
      (v) => v.lang.startsWith("en-US") && v.name.toLowerCase().includes("female")
    ) || voices.find((v) => v.lang.startsWith("en-US"));
  }, []);

  const speak = useCallback((text: string, rate: number = 0.9, pitch: number = 0.95) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 0.9;

    const preferredVoice = getPreferredVoice();
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [getPreferredVoice]);

  const soundOut = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    
    const syllables = splitIntoSyllables(text);
    let index = 0;
    
    const speakNextSyllable = () => {
      if (index >= syllables.length) return;
      
      const utterance = new SpeechSynthesisUtterance(syllables[index]);
      utterance.rate = 0.5;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      const preferredVoice = getPreferredVoice();
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onend = () => {
        index++;
        if (index < syllables.length) {
          setTimeout(speakNextSyllable, 700);
        }
      };
      
      window.speechSynthesis.speak(utterance);
    };
    
    speakNextSyllable();
  }, [getPreferredVoice]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  return { speak, soundOut, stop, isSupported };
};
