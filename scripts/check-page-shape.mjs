#!/usr/bin/env node
/**
 * Search Readiness q1 (the weekly quality sample): every prerendered content page must be worth
 * quoting, not only present. The Monday sample reads the words on five live pages and on
 * 3 November 2026 failed all five of this site's:
 *
 *   b3  none of its 5 H2 headings is a question   (the H2s were band names and device names)
 *   c6  no named author or reviewer is visible    (no byline, and no author in the page JSON-LD)
 *
 * Both came from the templates, so both are fixed in the templates (SEO.tsx states the author on
 * every page, PageByline shows it to readers, the curriculum pages lead with a question heading).
 * This check holds that shape in dist, where the crawler reads it:
 *
 *   - every content page carries a JSON-LD author whose name appears in the page's visible text
 *   - a content page with two or more H2s has at least one phrased as a question
 *
 * Utility pages (privacy, terms) and the homepage are not sampled by the audit and are not held here.
 * The question/answer wording itself is NOT pinned: this is a shape check, never a wording check.
 *
 *   node scripts/check-page-shape.mjs [dist]
 *   node scripts/check-page-shape.mjs --self-test
 *
 * Rule 0: zero content pages examined exits 1 — a check that reads nothing must never pass.
 */
import fs from "node:fs";
import path from "node:path";

const UTILITY = /\/(privacy|terms|legal|cookie|disclaimer|accessibility|contact|thank|login|signin|404|search|unsubscribe|sitemap)(\/|$)/i;
// The same test the audit uses: a trailing "?" or an opening question word.
const QUESTION = /\?\s*$|^(what|how|why|when|where|who|which|is|are|can|does|do|should|will|was|were)\b/i;

const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

export function visibleText(html) {
  return decode(
    String(html)
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function jsonLdNodes(html) {
  const out = [];
  for (const m of String(html).matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let json;
    try {
      json = JSON.parse(m[1]);
    } catch {
      out.push({ __unparsable: true });
      continue;
    }
    for (const n of Array.isArray(json) ? json : (json["@graph"] ?? [json])) out.push(n);
  }
  return out;
}

const authorNames = (nodes) =>
  nodes
    .flatMap((n) => [].concat(n?.author ?? []))
    .map((a) => (typeof a === "string" ? a : a?.name))
    .filter(Boolean)
    .map(String);

/** Every way one page falls short of the shape. Empty means it holds. */
export function shapeErrors(html, where) {
  const e = [];
  const say = (m) => e.push(`${where}: ${m}`);
  const nodes = jsonLdNodes(html);
  if (nodes.some((n) => n.__unparsable)) say("a JSON-LD block does not parse");
  const vis = visibleText(html);
  const named = authorNames(nodes).filter((a) => vis.includes(a));
  if (!named.length) {
    const had = authorNames(nodes);
    say(
      had.length
        ? `c6 the JSON-LD author (${had.join(", ")}) is not in the visible text — a reader cannot see who wrote it`
        : "c6 no author in the page JSON-LD and no visible byline",
    );
  }
  const h2s = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => visibleText(m[1]));
  if (h2s.length >= 2 && !h2s.some((h) => QUESTION.test(h))) {
    say(`b3 none of its ${h2s.length} H2 headings is a question`);
  }
  return e;
}

function contentPages(dir) {
  const out = [];
  const walk = (d) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name === "index.html") out.push(p);
    }
  };
  walk(dir);
  // The homepage is never sampled by the audit; utility pages are excluded by it too.
  return out.filter((p) => {
    const route = `/${path.relative(dir, p).replace(/index\.html$/, "")}`;
    return route !== "/" && !UTILITY.test(route);
  });
}

function selfTest() {
  const byline = '<script type="application/ld+json">{"@type":"WebPage","author":{"@type":"Organization","name":"HeyGetOnMyLevel"}}</script><p>Written and maintained by HeyGetOnMyLevel</p>';
  const cases = [
    ["a page with a visible author and a question H2 holds", `${byline}<h2>What does it cover?</h2><h2>Modules</h2>`, 0],
    ["a page with no author is caught", "<h2>What does it cover?</h2><h2>Modules</h2>", 1],
    ["an author only in the schema is caught", '<script type="application/ld+json">{"author":{"name":"Someone Else"}}</script><h2>What is it?</h2>', 1],
    ["H2s with no question are caught", `${byline}<h2>Early Elementary</h2><h2>Upper Elementary</h2>`, 1],
    ["a single non-question H2 is allowed", `${byline}<h2>Early Elementary</h2>`, 0],
    ["unparsable JSON-LD is caught", '<script type="application/ld+json">{oops}</script><h2>What?</h2>', 1],
  ];
  let bad = 0;
  for (const [what, html, want] of cases) {
    const got = shapeErrors(html, "self-test").length;
    const ok = want === 0 ? got === 0 : got >= 1;
    console.log(`${ok ? "ok  " : "FAIL"} ${what} (${got} problem${got === 1 ? "" : "s"})`);
    if (!ok) bad += 1;
  }
  if (bad) {
    console.error(`check-page-shape --self-test: ${bad} case(s) failed`);
    process.exit(1);
  }
  console.log("check-page-shape --self-test: every case behaved");
}

function main() {
  if (process.argv.includes("--self-test")) return selfTest();
  const dir = path.resolve(process.argv[2] ?? "dist");
  if (!fs.existsSync(dir)) {
    console.error(`check-page-shape: ${dir} does not exist (build first)`);
    process.exit(1);
  }
  const pages = contentPages(dir);
  if (!pages.length) {
    console.error(`check-page-shape examined zero content pages in ${dir} (nothing was read)`);
    process.exit(1);
  }
  const errors = pages.flatMap((p) => shapeErrors(fs.readFileSync(p, "utf8"), path.relative(dir, p)));
  if (errors.length) {
    for (const e of errors) console.error(`FAIL ${e}`);
    console.error(`check-page-shape: ${errors.length} problem(s) across ${pages.length} content page(s)`);
    process.exit(1);
  }
  console.log(`check-page-shape OK: ${pages.length} content page(s) name a visible author and ask a question in a heading`);
}

main();
