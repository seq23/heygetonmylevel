// Spanish uses sentence case: only the first word of a sentence and names take a capital.
// "Reporte de Error" reads as machine-translated; "Reporte de error" is right (22 Nov 2026 review).
// A word starts a sentence when nothing but punctuation or emoji comes before it in the string, or
// it follows . ! ? : • — a line break or an opening quote (a quoted button name), or it opens with ¡ or ¿.
export const NAMES = ["IA", "EE.UU.", "Compañero de Lectura"];

export function midSentenceCapitals(text) {
  const masked = NAMES.reduce((t, n) => t.split(n).join("\u0000".repeat(n.length)), text);
  const found = [];
  for (const m of masked.matchAll(/[¡¿]?[\p{Lu}][\p{L}]*/gu)) {
    if (/^[¡¿]/.test(m[0])) continue;
    const before = masked.slice(0, m.index).replace(/\\n/g, "\n").replace(/\\"/g, '"');
    if (!/[\p{L}\p{N}\u0000]/u.test(before) || /[.!?:•—\n"“«]\s*$/u.test(before)) continue;
    found.push({ index: m.index, word: m[0] });
  }
  return found;
}

export const toSentenceCase = (text) =>
  midSentenceCapitals(text).reduceRight(
    (t, { index }) => t.slice(0, index) + t[index].toLowerCase() + t.slice(index + 1), text);
