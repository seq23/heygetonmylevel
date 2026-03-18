// Text comparison utilities for read-aloud assessment

export interface ComparisonResult {
  originalWords: string[];
  transcribedWords: string[];
  wordResults: { word: string; isCorrect: boolean; transcribed: string | null }[];
  correctCount: number;
  totalWords: number;
  accuracy: number;
  wordsPerMinute: number;
}

// Normalize text for comparison (lowercase, remove punctuation)
const normalizeWord = (word: string): string => {
  return word
    .toLowerCase()
    .replace(/[^a-z0-9']/g, "")
    .trim();
};

// Split text into words
const splitIntoWords = (text: string): string[] => {
  return text
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 0);
};

// Compare original text with transcribed text
export const compareTexts = (
  originalText: string,
  transcribedText: string,
  elapsedSeconds: number
): ComparisonResult => {
  const originalWords = splitIntoWords(originalText);
  const transcribedWords = splitIntoWords(transcribedText);
  
  const normalizedOriginal = originalWords.map(normalizeWord);
  const normalizedTranscribed = transcribedWords.map(normalizeWord);
  
  // Word-by-word comparison with fuzzy matching using index tracking
  const wordResults: { word: string; isCorrect: boolean; transcribed: string | null }[] = [];
  let correctCount = 0;
  const usedTranscribedIndices = new Set<number>();
  
  normalizedOriginal.forEach((original, index) => {
    // Check if this word exists in transcribed text (allowing for order variations)
    const matchIndex = normalizedTranscribed.findIndex(
      (t, i) => t === original && !usedTranscribedIndices.has(i)
    );
    
    if (matchIndex !== -1) {
      usedTranscribedIndices.add(matchIndex);
      wordResults.push({
        word: originalWords[index],
        isCorrect: true,
        transcribed: transcribedWords[matchIndex],
      });
      correctCount++;
    } else {
      // Check for similar words (within edit distance of 1-2)
      const similarIndex = normalizedTranscribed.findIndex(
        (t, i) => 
          !usedTranscribedIndices.has(i) &&
          levenshteinDistance(t, original) <= 2 &&
          t.length > 2
      );
      
      if (similarIndex !== -1) {
        usedTranscribedIndices.add(similarIndex);
        wordResults.push({
          word: originalWords[index],
          isCorrect: true, // Accept close matches
          transcribed: transcribedWords[similarIndex],
        });
        correctCount++;
      } else {
        wordResults.push({
          word: originalWords[index],
          isCorrect: false,
          transcribed: null,
        });
      }
    }
  });
  
  const totalWords = originalWords.length;
  const accuracy = totalWords > 0 ? (correctCount / totalWords) * 100 : 0;
  const wordsPerMinute = elapsedSeconds > 0 
    ? Math.round((correctCount / elapsedSeconds) * 60) 
    : 0;
  
  return {
    originalWords,
    transcribedWords,
    wordResults,
    correctCount,
    totalWords,
    accuracy,
    wordsPerMinute,
  };
};

// Levenshtein distance for fuzzy matching
const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};

// Target WPM by grade level (research-based reading fluency norms)
export const getTargetWPM = (gradeLevel: number): number => {
  const targets: Record<number, number> = {
    1: 60,   // 50th percentile: 53-60
    2: 90,   // 50th percentile: 89-100
    3: 110,  // 50th percentile: 107-121
    4: 125,  // 50th percentile: 123-133
    5: 140,  // 50th percentile: 139-151
    6: 150,  // 50th percentile: 150-160
    7: 155,  // 50th percentile: 156-165
    8: 165,  // 50th percentile: 160-170
    9: 175,  // Extrapolated
    10: 185, // Extrapolated
    11: 190, // Extrapolated
    12: 195, // Extrapolated
    13: 200, // College level
  };
  return targets[gradeLevel] || 150;
};

// Get fluency feedback based on WPM and accuracy
export const getFluencyFeedback = (
  accuracy: number,
  wpm: number,
  targetWPM: number
): { rating: "excellent" | "good" | "developing" | "needs_practice"; message: string } => {
  const wpmRatio = wpm / targetWPM;
  
  if (accuracy >= 95 && wpmRatio >= 0.9) {
    return {
      rating: "excellent",
      message: "Excellent reading! Great accuracy and fluency.",
    };
  } else if (accuracy >= 90 && wpmRatio >= 0.75) {
    return {
      rating: "good",
      message: "Good job! You're reading well at this level.",
    };
  } else if (accuracy >= 80 && wpmRatio >= 0.5) {
    return {
      rating: "developing",
      message: "Keep practicing! You're making good progress.",
    };
  } else {
    return {
      rating: "needs_practice",
      message: "This level might be challenging. Let's try an easier level.",
    };
  }
};
