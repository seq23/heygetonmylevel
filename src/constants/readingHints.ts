// Strategy 7: Client-side hints before AI
// Show these first to reduce AI tutor calls. The words live in the translation table
// (src/contexts/LanguageContext.tsx) so Spanish readers get them in Spanish; these are their keys.

const HINT_KEYS: Record<string, string[]> = {
  recall: ["tutor.hint.recall1", "tutor.hint.recall2", "tutor.hint.recall3"],
  inference: ["tutor.hint.inference1", "tutor.hint.inference2", "tutor.hint.inference3"],
  vocabulary: ["tutor.hint.vocabulary1", "tutor.hint.vocabulary2", "tutor.hint.vocabulary3"],
  cause_effect: ["tutor.hint.cause_effect1", "tutor.hint.cause_effect2", "tutor.hint.cause_effect3"],
  general: ["tutor.hint.general1", "tutor.hint.general2", "tutor.hint.general3"],
};

export const STATIC_HELP_TIP_KEYS = ["tutor.tip1", "tutor.tip2", "tutor.tip3"];

export const getHintKeyForQuestionType = (questionType?: string, hintIndex: number = 0): string => {
  const type = questionType?.toLowerCase().replace(/[^a-z_]/g, "") || "general";
  const keys = HINT_KEYS[type] || HINT_KEYS.general;
  return keys[hintIndex % keys.length];
};
