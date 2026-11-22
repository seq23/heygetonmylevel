// The feedback form and the Reading Buddy speak the reader's language (engineering check of #24,
// 22 Nov 2026): FeedbackBubble hard-coded English, so Spanish readers saw English, and AITutor kept
// its own copy of the welcome lines beside tutor.welcome1-5. Every key in these namespaces must be
// read by its component, and every key the component reads must exist with its own Spanish text.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const table = readFileSync("src/contexts/LanguageContext.tsx", "utf8");
const entries = new Map([...table.matchAll(/"([\w.]+)":\s*\{\s*en:\s*("(?:[^"\\]|\\.)*")\s*,\s*es:\s*("(?:[^"\\]|\\.)*")/g)]
  .map(([, k, en, es]) => [k, { en: JSON.parse(en), es: JSON.parse(es) }]));
const reads = (file) => {
  const src = readFileSync(file, "utf8");
  const keys = new Set([...src.matchAll(/\bt\(\s*["'`]([\w.]+)["'`]/g)].map((m) => m[1]));
  // A key built from a template, e.g. t(`tutor.welcome${n}`) over [1, 2, 3, 4, 5]
  for (const m of src.matchAll(/\[([\d,\s]+)\]\.map\(\(\w+\)\s*=>\s*t\(`([\w.]+)\$\{\w+\}`\)\)/g))
    for (const n of m[1].split(",").map((s) => s.trim()).filter(Boolean)) keys.add(m[2] + n);
  return keys;
};

for (const [ns, file] of [["feedback.", "src/components/FeedbackBubble.tsx"], ["tutor.welcome", "src/components/AITutor.tsx"]]) {
  test(`${file} reads every ${ns}* string from the translation table, in both languages`, () => {
    const table_keys = [...entries.keys()].filter((k) => k.startsWith(ns));
    assert.ok(table_keys.length > 0, `zero ${ns}* keys read from the table must fail`);
    const used = reads(file);
    for (const k of table_keys) assert.ok(used.has(k), `${k} is in the table but ${file} never reads it`);
    for (const k of [...used].filter((k) => k.startsWith(ns))) {
      assert.ok(entries.has(k), `${file} reads ${k}, which is not in the table`);
      assert.notEqual(entries.get(k).es, entries.get(k).en, `${k} has no Spanish text`);
    }
  });
}
