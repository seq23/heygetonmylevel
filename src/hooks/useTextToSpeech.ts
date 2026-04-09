import { useCallback, useRef } from "react";

// Simple syllable splitting helper
const splitIntoSyllables = (word: string): string[] => {
  const cleanWord = word.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g, "").toLowerCase();
  
  if (cleanWord.length <= 3) {
    return [cleanWord];
  }
  
  const vowels = "aeiouyáéíóúü";
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

export const useTextToSpeech = (language: string = "en") => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getPreferredVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    
    if (language === "es") {
      // Prefer Spanish voices
      return voices.find(
        (v) => v.lang.startsWith("es") && v.name.includes("Paulina")
      ) || voices.find(
        (v) => v.lang.startsWith("es-US")
      ) || voices.find(
        (v) => v.lang.startsWith("es-MX")
      ) || voices.find(
        (v) => v.lang.startsWith("es")
      );
    }
    
    // English voices
    return voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Samantha")
    ) || voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Karen")
    ) || voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Natural")
    ) || voices.find(
      (v) => v.lang.startsWith("en-US") && v.name.toLowerCase().includes("female")
    ) || voices.find((v) => v.lang.startsWith("en-US"));
  }, [language]);

  const buildUtterance = useCallback((text: string, rate: number, pitch: number) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 0.75;
    utterance.lang = language === "es" ? "es-US" : "en-US";

    const preferredVoice = getPreferredVoice();
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utteranceRef.current = utterance;
    return utterance;
  }, [getPreferredVoice, language]);

  const speak = useCallback((text: string, rate: number = 0.7, pitch: number = 0.8) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = buildUtterance(text, rate, pitch);
    window.speechSynthesis.speak(utterance);
  }, [buildUtterance]);

  const speakAsync = useCallback((text: string, rate: number = 0.7, pitch: number = 0.8) => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = buildUtterance(text, rate, pitch);
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }, [buildUtterance]);

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
      utterance.lang = language === "es" ? "es-US" : "en-US";
      
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
  }, [getPreferredVoice, language]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  return { speak, speakAsync, soundOut, stop, isSupported };
};
