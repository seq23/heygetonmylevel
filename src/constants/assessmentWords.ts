// Curated vocabulary words organized by grade level for quick assessment
// Words are selected based on common grade-level word lists and research

export interface GradeWords {
  grade: number;
  words: string[];
}

export const assessmentWords: GradeWords[] = [
  {
    grade: 1,
    words: ["cat", "dog", "run", "big", "happy"]
  },
  {
    grade: 2,
    words: ["friend", "beautiful", "important", "outside", "different"]
  },
  {
    grade: 3,
    words: ["adventure", "delicious", "enormous", "fascinating", "discover"]
  },
  {
    grade: 4,
    words: ["necessary", "accomplish", "mysterious", "environment", "brilliant"]
  },
  {
    grade: 5,
    words: ["consequence", "extraordinary", "determination", "civilization", "temperature"]
  },
  {
    grade: 6,
    words: ["sophisticated", "catastrophe", "phenomenon", "ambiguous", "predominant"]
  },
  {
    grade: 7,
    words: ["unprecedented", "meticulous", "hypothesis", "scrutinize", "formidable"]
  },
  {
    grade: 8,
    words: ["aesthetic", "paradox", "eloquent", "juxtaposition", "ephemeral"]
  },
  {
    grade: 9,
    words: ["ubiquitous", "dichotomy", "pragmatic", "idiosyncratic", "superfluous"]
  },
  {
    grade: 10,
    words: ["esoteric", "vicarious", "obfuscate", "quintessential", "sycophant"]
  },
  {
    grade: 11,
    words: ["verisimilitude", "epistemology", "surreptitious", "perspicacious", "concomitant"]
  },
  {
    grade: 12,
    words: ["antediluvian", "sesquipedalian", "ineffable", "recalcitrant", "pulchritudinous"]
  }
];

// Shuffle array function
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get a mixed set of words from different grade levels
export const getAssessmentWordSet = (count: number = 20): { word: string; grade: number }[] => {
  const allWords: { word: string; grade: number }[] = [];
  
  assessmentWords.forEach(gradeSet => {
    gradeSet.words.forEach(word => {
      allWords.push({ word, grade: gradeSet.grade });
    });
  });
  
  return shuffleArray(allWords).slice(0, count);
};

// Calculate estimated reading level based on known words
export const calculateLevelFromVocabulary = (
  knownWords: { word: string; grade: number }[],
  totalWords: { word: string; grade: number }[]
): number => {
  if (knownWords.length === 0) return 1;
  
  // Group known words by grade
  const knownByGrade: Record<number, number> = {};
  const totalByGrade: Record<number, number> = {};
  
  totalWords.forEach(({ grade }) => {
    totalByGrade[grade] = (totalByGrade[grade] || 0) + 1;
  });
  
  knownWords.forEach(({ grade }) => {
    knownByGrade[grade] = (knownByGrade[grade] || 0) + 1;
  });
  
  // Find the highest grade where user knows at least 60% of words
  let estimatedLevel = 1;
  
  for (let grade = 1; grade <= 12; grade++) {
    const total = totalByGrade[grade] || 0;
    const known = knownByGrade[grade] || 0;
    
    if (total > 0 && known / total >= 0.6) {
      estimatedLevel = grade;
    } else if (total > 0 && known / total < 0.4) {
      // Stop if user knows less than 40% at this level
      break;
    }
  }
  
  return estimatedLevel;
};
