import { useCallback, useRef } from "react";

export const useTextToSpeech = () => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, rate: number = 1.0) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Natural")
    ) || voices.find((v) => v.lang.startsWith("en-US"));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const speakSlowly = useCallback((text: string) => {
    speak(text, 0.35);
  }, [speak]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  return { speak, speakSlowly, stop, isSupported };
};
