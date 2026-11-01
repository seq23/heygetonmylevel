// Builds learn.heygetonmylevel.com — the static reading-questions section — into learn-dist/.
// Cloudflare Pages (project heygetonmylevel-learn, git-connected) runs this on every push to
// main that touches questions/ or learn-static/; it never depends on Lovable Publish.
//
//   node scripts/learn-build.mjs              build learn-dist/ (hub list + sitemap.xml)
//   node scripts/learn-build.mjs --check      build, then fail on any page that breaks the section's rules
//   node scripts/learn-build.mjs --self-test  prove --check fails on a page with no action / a foreign canonical
//
// Rules checked: the hub exists and lists every question page; every page ends in the one
// action (Time-2-Read's free week) and canonicalises to the learn host; the IndexNow key file
// and the Search Console token ship; the sitemap names every page. Zero pages is not an error
// (the loop may not have published yet) but the hub itself must always be present.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

export const BASE = "https://learn.heygetonmylevel.com";
export const ACTION = "https://time-2-read.com/pricing";
const KEY = "06acc33193fad58e3b116f69d73bb6c6";
const TOKEN = "google706548b58060eed8.html";

const pick = (re, s) => (s.match(re) || [])[1] || "";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const unesc = (s) => String(s).replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&amp;/g, "&");

function readPages(questionsDir) {
  const pages = [];
  for (const slug of readdirSync(questionsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
    const file = join(questionsDir, slug, "index.html");
    if (!existsSync(file)) continue;
    const html = readFileSync(file, "utf8");
    pages.push({
      slug, file, html,
      h1: unesc(pick(/<h1[^>]*>([\s\S]*?)<\/h1>/i, html).replace(/<[^>]+>/g, "").trim()),
      canonical: pick(/<link[^>]+href="([^"]+)"[^>]*rel="canonical"/i, html) || pick(/<link[^>]+rel="canonical"[^>]*href="([^"]+)"/i, html),
      published: pick(/<time datetime="(\d{4}-\d{2}-\d{2})"/, html),
    });
  }
  return pages;
}

export function build({ root = process.cwd(), out = join(root, "learn-dist") } = {}) {
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  cpSync(join(root, "learn-static"), out, { recursive: true });
  cpSync(join(root, "questions"), join(out, "questions"), { recursive: true });
  const pages = readPages(join(root, "questions"));
  const hubFile = join(out, "questions", "index.html");
  const hub = readFileSync(hubFile, "utf8");
  const list = pages.length
    ? `<h2>All questions</h2><ul class="question-list">${pages.map((p) => `<li><a href="/questions/${p.slug}/">${esc(p.h1 || p.slug)}</a></li>`).join("")}</ul>`
    : "";
  writeFileSync(hubFile, hub.replace("<!-- learn:list -->", list));
  const urls = [{ loc: `${BASE}/questions/` }, ...pages.map((p) => ({ loc: `${BASE}/questions/${p.slug}/`, lastmod: p.published }))];
  writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>\n`);
  return { out, pages, urls };
}

export function check({ out, pages, urls }) {
  const problems = [];
  const hub = existsSync(join(out, "questions", "index.html")) ? readFileSync(join(out, "questions", "index.html"), "utf8") : "";
  if (!hub) problems.push("hub questions/index.html missing");
  if (hub.includes("<!-- learn:list -->") && pages.length) problems.push("hub list not filled");
  for (const p of pages) {
    if (!p.html.includes(`href="${ACTION}"`)) problems.push(`${p.slug}: does not end in the one action (${ACTION})`);
    if (!p.canonical.startsWith(`${BASE}/questions/`)) problems.push(`${p.slug}: canonical ${p.canonical || "missing"} is not on ${BASE}`);
    if (!hub.includes(`href="/questions/${p.slug}/"`)) problems.push(`${p.slug}: not linked from the hub`);
  }
  const sitemap = readFileSync(join(out, "sitemap.xml"), "utf8");
  if ((sitemap.match(/<loc>/g) || []).length !== urls.length || urls.length < 1) problems.push("sitemap.xml does not list the hub and every page");
  if (readFileSync(join(out, `${KEY}.txt`), "utf8").trim() !== KEY) problems.push("IndexNow key file body is not its key");
  if (!existsSync(join(out, TOKEN))) problems.push(`${TOKEN} (Search Console token) missing`);
  return problems;
}

function selfTest() {
  const tmp = mkdtempSync(join(tmpdir(), "learn-selftest-"));
  try {
    cpSync(join(process.cwd(), "learn-static"), join(tmp, "learn-static"), { recursive: true });
    mkdirSync(join(tmp, "questions"), { recursive: true });
    cpSync(join(process.cwd(), "questions", "index.html"), join(tmp, "questions", "index.html"));
    const good = `<html><head><link href="${BASE}/questions/good/" rel="canonical"/></head><body><h1>Good</h1><p><time datetime="2026-11-01">1 Nov</time></p><a class="button" href="${ACTION}">Start</a></body></html>`;
    mkdirSync(join(tmp, "questions", "good"), { recursive: true });
    writeFileSync(join(tmp, "questions", "good", "index.html"), good);
    const okProblems = check(build({ root: tmp }));
    if (okProblems.length) throw new Error(`a good page failed: ${okProblems.join("; ")}`);
    mkdirSync(join(tmp, "questions", "bad"), { recursive: true });
    writeFileSync(join(tmp, "questions", "bad", "index.html"), good.replace(`href="${ACTION}"`, 'href="https://example.com"').replace(`${BASE}/questions/good/`, "https://heygetonmylevel.com/bad"));
    const bad = check(build({ root: tmp }));
    if (!bad.some((p) => p.startsWith("bad: does not end")) || !bad.some((p) => p.startsWith("bad: canonical"))) throw new Error(`a bad page passed: ${bad.join("; ")}`);
    console.log("learn-build self-test ok (good page passes; missing action and foreign canonical fail)");
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv[2];
  if (arg === "--self-test") selfTest();
  else {
    const res = build();
    if (arg === "--check") {
      const problems = check(res);
      if (problems.length) { for (const p of problems) console.error(`LEARN_SECTION ${p}`); process.exit(1); }
    }
    console.log(`learn-dist built: hub + ${res.pages.length} question page(s), sitemap ${res.urls.length} url(s)`);
  }
}
