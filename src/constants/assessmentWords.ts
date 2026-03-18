// Curated vocabulary words organized by grade level for quick assessment
// Words are selected based on common grade-level word lists and research

export interface GradeWords {
  grade: number;
  words: string[];
}

export const assessmentWords: GradeWords[] = [
  {
    grade: 1,
    words: ["cat", "dog", "run", "big", "happy", "sun", "play", "red"]
  },
  {
    grade: 2,
    words: ["friend", "because", "around", "before", "different", "together", "thought", "brought"]
  },
  {
    grade: 3,
    words: ["adventure", "delicious", "enormous", "fascinating", "discover", "imagine", "curious", "wonderful"]
  },
  {
    grade: 4,
    words: ["necessary", "accomplish", "mysterious", "environment", "brilliant", "persuade", "disguise", "announce"]
  },
  {
    grade: 5,
    words: ["consequence", "extraordinary", "determination", "civilization", "temperature", "vocabulary", "independent", "investigate"]
  },
  {
    grade: 6,
    words: ["sophisticated", "catastrophe", "phenomenon", "ambiguous", "predominant", "accumulate", "beneficial", "consecutive"]
  },
  {
    grade: 7,
    words: ["unprecedented", "meticulous", "hypothesis", "scrutinize", "formidable", "inevitable", "compromise", "legitimate"]
  },
  {
    grade: 8,
    words: ["aesthetic", "paradox", "eloquent", "juxtaposition", "ephemeral", "ambivalent", "pragmatic", "conjecture"]
  },
  {
    grade: 9,
    words: ["ubiquitous", "dichotomy", "corroborate", "idiosyncratic", "superfluous", "articulate", "analogous", "substantiate"]
  },
  {
    grade: 10,
    words: ["esoteric", "vicarious", "obfuscate", "quintessential", "sycophant", "amalgamate", "perfunctory", "propensity"]
  },
  {
    grade: 11,
    words: ["verisimilitude", "epistemology", "surreptitious", "perspicacious", "concomitant", "disingenuous", "extemporaneous", "circumlocution"]
  },
  {
    grade: 12,
    words: ["antediluvian", "sesquipedalian", "ineffable", "recalcitrant", "magnanimous", "solipsistic", "pusillanimous", "sophistry"]
  },
  {
    grade: 13,
    words: ["hermeneutics", "dialectical", "ontological", "phenomenological", "axiom", "heuristic", "syllogism", "teleological"]
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

// Get a mixed set of words from different grade levels with guaranteed coverage
export const getAssessmentWordSet = (count: number = 24): { word: string; grade: number }[] => {
  const result: { word: string; grade: number }[] = [];
  
  // Guarantee 1 word from each grade (13 words)
  assessmentWords.forEach(gradeSet => {
    const shuffledWords = shuffleArray([...gradeSet.words]);
    result.push({ word: shuffledWords[0], grade: gradeSet.grade });
  });
  
  // Fill remaining slots randomly from remaining words
  const remainingWords: { word: string; grade: number }[] = [];
  assessmentWords.forEach(gradeSet => {
    const shuffledWords = shuffleArray([...gradeSet.words]);
    shuffledWords.slice(1).forEach(word => {
      remainingWords.push({ word, grade: gradeSet.grade });
    });
  });
  
  const extraWords = shuffleArray(remainingWords).slice(0, count - result.length);
  return shuffleArray([...result, ...extraWords]);
};

// Calculate estimated reading level based on known words using cumulative scoring
export const calculateLevelFromVocabulary = (
  knownWords: { word: string; grade: number }[],
  totalWords: { word: string; grade: number }[]
): number => {
  if (knownWords.length === 0) return 1;
  
  const knownByGrade: Record<number, number> = {};
  const totalByGrade: Record<number, number> = {};
  
  totalWords.forEach(({ grade }) => {
    totalByGrade[grade] = (totalByGrade[grade] || 0) + 1;
  });
  
  knownWords.forEach(({ grade }) => {
    knownByGrade[grade] = (knownByGrade[grade] || 0) + 1;
  });
  
  let cumulativeKnown = 0;
  let cumulativeTotal = 0;
  let estimatedLevel = 1;
  
  // Extended to grade 13 (College)
  for (let grade = 1; grade <= 13; grade++) {
    const total = totalByGrade[grade] || 0;
    const known = knownByGrade[grade] || 0;
    
    cumulativeKnown += known;
    cumulativeTotal += total;
    
    // Pass if cumulative >= 50%
    if (cumulativeTotal > 0 && cumulativeKnown / cumulativeTotal >= 0.5) {
      estimatedLevel = grade;
    }
    
    // Only stop if cumulative drops below 30% after 5+ words seen
    if (cumulativeTotal >= 5 && cumulativeKnown / cumulativeTotal < 0.3) {
      break;
    }
  }
  
  return estimatedLevel;
};
