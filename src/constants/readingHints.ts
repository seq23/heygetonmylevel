// Strategy 7: Client-side hints before AI
// Show these first to reduce AI tutor calls

export const READING_HINTS: Record<string, string[]> = {
  recall: [
    "Look for the answer stated directly in the passage.",
    "Scan for names, dates, or specific details mentioned.",
    "The answer is usually word-for-word in the text!"
  ],
  inference: [
    "Think about what the author is suggesting but not saying directly.",
    "Ask yourself: 'What can I figure out from the clues?'",
    "Combine details from the passage to draw a conclusion."
  ],
  vocabulary: [
    "Look at the words around it for context clues.",
    "Think about word parts - prefixes, suffixes, root words.",
    "Try replacing the word with each answer choice to see what fits."
  ],
  cause_effect: [
    "Look for words like 'because', 'so', 'therefore', 'as a result'.",
    "Ask: 'What happened?' and 'Why did it happen?'",
    "Find the event first, then look for what caused it."
  ],
  general: [
    "Read the question twice to make sure you understand it.",
    "Go back to the passage and find the relevant paragraph.",
    "Eliminate answers that are clearly wrong first."
  ]
};

export const STATIC_HELP_TIPS = [
  "Re-read the paragraph that mentions the answer",
  "Look for key words in the question",
  "Eliminate obviously wrong answers",
  "Don't rush - take your time to think"
];

export const getHintForQuestionType = (questionType?: string, hintIndex: number = 0): string => {
  const type = questionType?.toLowerCase().replace(/[^a-z_]/g, '') || 'general';
  const hints = READING_HINTS[type] || READING_HINTS.general;
  return hints[hintIndex % hints.length];
};
