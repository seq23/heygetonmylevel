// Every Spanish string in the app's table is in sentence case (22 Nov 2026 review of #25:
// "Reporte de Error", "Estoy Listo para las Preguntas" and 55 more read as machine-translated).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { midSentenceCapitals } from "./sentence-case.mjs";

const table = readFileSync("src/contexts/LanguageContext.tsx", "utf8");
const spanish = [...table.matchAll(/"([\w.]+)":\s*\{\s*en:\s*"(?:[^"\\]|\\.)*"\s*,\s*es:\s*"((?:[^"\\]|\\.)*)"/g)]
  .map(([, key, es]) => ({ key, es }));

test("knows title case from sentence case", () => {
  assert.deepEqual(midSentenceCapitals("Reporte de Error").map((h) => h.word), ["Error"]);
  assert.deepEqual(midSentenceCapitals("¡Hola! ¡Soy tu Compañero de Lectura! Ahora lee."), []);
  assert.deepEqual(midSentenceCapitals('presiona el botón "Ir a las preguntas" con IA'), []);
});

test("every Spanish string capitalises only sentence starts and names", () => {
  assert.ok(spanish.length > 100, `read ${spanish.length} Spanish strings`);
  const bad = spanish.flatMap(({ key, es }) =>
    midSentenceCapitals(es).map((h) => `${key}: "${h.word}" in "${es.slice(0, 60)}"`));
  assert.deepEqual(bad, []);
});
