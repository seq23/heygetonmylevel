// The feedback form and the Reading Buddy speak the reader's language (engineering check of #24,
// 22 Nov 2026): FeedbackBubble hard-coded English, so Spanish readers saw English, and AITutor kept
// its own English copy of its lines. Every key in these namespaces must be read by its component,
// every key read must exist with its own Spanish text, and no label may be typed into the
// components in English.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const table = readFileSync("src/contexts/LanguageContext.tsx", "utf8");
const entries = new Map([...table.matchAll(/"([\w.]+)":\s*\{\s*en:\s*("(?:[^"\\]|\\.)*")\s*,\s*es:\s*("(?:[^"\\]|\\.)*")/g)]
  .map(([, k, en, es]) => [k, { en: JSON.parse(en), es: JSON.parse(es) }]));

const AREAS = [
  { ns: "feedback.", files: ["src/components/FeedbackBubble.tsx"] },
  { ns: "tutor.", files: ["src/components/AITutor.tsx", "src/constants/readingHints.ts", "src/pages/Session.tsx"] },
];

const reads = (src, ns) => {
  const esc = ns.replace(".", "\\.");
  const keys = new Set([...src.matchAll(new RegExp(`["'\`](${esc}[\\w.]+)["'\`]`, "g"))].map((m) => m[1]));
  // A key built from a template, e.g. t(`tutor.welcome${n}`) over [1, 2, 3, 4, 5]
  for (const m of src.matchAll(/\[([\d,\s]+)\]\.map\(\(\w+\)\s*=>\s*t\(`([\w.]+)\$\{\w+\}`\)\)/g))
    for (const n of m[1].split(",").map((s) => s.trim()).filter(Boolean)) keys.add(m[2] + n);
  return keys;
};

// English typed straight into a component: JSX text, a label attribute, or a sentence-like string.
export const hardCodedLabels = (src) => {
  const code = src.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")
    .split("\n").filter((l) => !/\bconsole\.\w+\(/.test(l)).join("\n");
  const found = new Set();
  // JSX text, also when it sits beside an expression: <p>Hello {name}</p>, <p>{n} stories left</p>
  for (const m of code.matchAll(/>([^<>]*)</g)) {
    const pieces = m[1].split(/\{[^{}]*\}/);
    if (pieces.some((p) => /[();=[\]&|{}]/.test(p))) continue; // code, not text
    for (const p of pieces) if (/[A-Za-z]{2,}/.test(p)) found.add(p.trim());
  }
  // A single word is enough in a label position: label: "Next", toast({ title: "Saved" })
  for (const m of code.matchAll(/\b(?:label|title|description|placeholder|content|message|text)\s*:\s*(?:"([^"\n]*)"|`([^`]*)`)/g)) {
    const s = (m[1] ?? m[2]).replace(/\$\{[^}]*\}/g, "").trim();
    if (/[A-Za-z]{2,}/.test(s) && !/^[\w.]+\.[\w.]+$/.test(s)) found.add(s);
  }
  for (const m of code.matchAll(/\b(?:placeholder|aria-label|title|alt)="([^"]*[A-Za-z][^"]*)"/g)) found.add(m[1]);
  for (const m of code.matchAll(/"([^"\n]*)"|`([^`]*)`/g)) {
    const s = (m[1] ?? m[2]).replace(/\$\{[^}]*\}/g, "X").trim();
    const words = (m[1] ?? m[2]).replace(/\$\{[^}]*\}/g, "");
    if (/^[A-Z][A-Za-z']*(?:[ ,]+[A-Za-z]|[!?.:]$)/.test(s) && /[a-z]{2,}/.test(words)) found.add(s);
  }
  return [...found];
};

test("the label scanner catches each way English can be typed into a component", () => {
  const sample = `<span>Quick Tip</span> <X aria-label="Close form" /> <V placeholder="Pick one" />
    setInput("Give me a hint"); const a = \`Hi \${name}! How are you?\`; const b = "Done!"; const c = \`\${a} \${b}!\`;
    <p>Hello {name}</p> <p>{n} stories left</p> const o = { label: "Next" }; toast({ title: "Saved" });`;
  assert.deepEqual(hardCodedLabels(sample).sort(), ["Quick Tip", "Close form", "Pick one", "Give me a hint", "Hi X! How are you?", "Done!", "Hello", "stories left", "Next", "Saved"].sort());
  assert.deepEqual(hardCodedLabels(`<b>{t("x.y")}</b> e.key === "Enter"; className="flex gap-2"; console.error("Tutor error:", e);`), []);
});

for (const { ns, files } of AREAS) {
  const src = files.map((f) => readFileSync(f, "utf8")).join("\n");
  test(`${files[0]} reads every ${ns}* string from the translation table, in both languages`, () => {
    const table_keys = [...entries.keys()].filter((k) => k.startsWith(ns));
    assert.ok(table_keys.length > 0, `zero ${ns}* keys read from the table must fail`);
    const used = reads(src, ns);
    for (const k of table_keys) assert.ok(used.has(k), `${k} is in the table but ${files.join(" / ")} never reads it`);
    for (const k of used) {
      assert.ok(entries.has(k), `${files[0]} reads ${k}, which is not in the table`);
      const { en, es } = entries.get(k);
      assert.notEqual(es, en, `${k} has no Spanish text`);
      const slots = (s) => [...s.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort().join();
      assert.equal(slots(es), slots(en), `${k}: the Spanish text must keep the same {name}/{count} slots`);
    }
  });
  for (const f of files) {
    test(`${f} has no label typed in English`, () => {
      assert.deepEqual(hardCodedLabels(readFileSync(f, "utf8")), [], `${f} has English typed in; put it in the translation table`);
    });
  }
}
