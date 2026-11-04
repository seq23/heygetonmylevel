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
// and the Search Console token ship; sitemap and redirects match the nonempty kept ledger.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { renderGuide } from "./reading-page.mjs";
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
  const ledger = JSON.parse(readFileSync(join(root, "data/page-quality/kept.json"), "utf8"));
  const guides = JSON.parse(readFileSync(join(root, "data/page-quality/guides.json"), "utf8"));
  const cfg = JSON.parse(readFileSync(join(root, "search-loop.config.json"), "utf8"));
  if (!ledger.kept.length || new Set(ledger.kept).size !== ledger.kept.length) throw new Error("kept ledger must contain unique pages, never zero");
  if (JSON.stringify(Object.keys(guides).sort()) !== JSON.stringify([...ledger.kept].sort())) throw new Error("guide data must exactly match kept ledger");
  mkdirSync(join(out, "questions"), { recursive: true });
  cpSync(join(root, "questions/index.html"), join(out, "questions/index.html"));
  for (const slug of ledger.kept) {
    mkdirSync(join(out, "questions", slug), { recursive: true });
    writeFileSync(join(out, "questions", slug, "index.html"), renderGuide(slug, guides[slug], cfg));
  }
  const rules = ["/ /questions/ 301"];
  for (const [from, to] of Object.entries(ledger.redirects)) {
    if (ledger.kept.includes(from) || !ledger.kept.includes(to)) throw new Error(`redirect must go directly to a kept page: ${from}`);
    for (const suffix of ["", "/", "/index.html"]) rules.push(`/questions/${from}${suffix} /questions/${to}/ 301`);
  }
  writeFileSync(join(out, "_redirects"), rules.join("\n") + "\n");
  writeFileSync(join(out, "llms.txt"), `# HeyGetOnMyLevel reading guides\n\n${ledger.kept.map(slug => `- [${guides[slug].h1}](${BASE}/questions/${slug}/)`).join("\n")}\n`);
  const pages = readPages(join(out, "questions"));
  const hubFile = join(out, "questions", "index.html");
  const hub = readFileSync(hubFile, "utf8");
  const list = pages.length
    ? `<h2>All questions</h2><ul class="question-list">${pages.map((p) => `<li><a href="/questions/${p.slug}/">${esc(p.h1 || p.slug)}</a></li>`).join("")}</ul>`
    : "";
  writeFileSync(hubFile, hub.replace("<!-- learn:list -->", list));
  const urls = [{ loc: `${BASE}/questions/` }, ...pages.map((p) => ({ loc: `${BASE}/questions/${p.slug}/`, lastmod: pick(/Updated <time datetime="(\d{4}-\d{2}-\d{2})"/, p.html) || p.published }))];
  writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>\n`);
  return { out, pages, urls, ledger };
}

export function check({ out, pages, urls, ledger }) {
  const problems = [];
  if (!pages.length || pages.length !== ledger.kept.length) problems.push("page count differs from nonempty kept ledger");
  const hub = existsSync(join(out, "questions", "index.html")) ? readFileSync(join(out, "questions", "index.html"), "utf8") : "";
  if (!hub) problems.push("hub questions/index.html missing");
  if (hub.includes("<!-- learn:list -->") && pages.length) problems.push("hub list not filled");
  for (const p of pages) {
    if (!p.html.includes(`href="${ACTION}"`)) problems.push(`${p.slug}: does not end in the one action (${ACTION})`);
    if (p.canonical !== `${BASE}/questions/${p.slug}/`) problems.push(`${p.slug}: canonical ${p.canonical || "missing"} is not on ${BASE}`);
    if (!hub.includes(`href="/questions/${p.slug}/"`)) problems.push(`${p.slug}: not linked from the hub`);
  }
  const redirects = readFileSync(join(out, "_redirects"), "utf8").split("\n");
  const llms = readFileSync(join(out, "llms.txt"), "utf8");
  for (const [from, to] of Object.entries(ledger.redirects)) {
    for (const suffix of ["", "/", "/index.html"]) {
      if (!redirects.includes(`/questions/${from}${suffix} /questions/${to}/ 301`)) problems.push(`${from}: missing direct 301`);
    }
    if (existsSync(join(out, "questions", from))) problems.push(`${from}: retired page still served`);
    if (llms.includes(`/questions/${from}/`)) problems.push(`${from}: retired page in llms.txt`);
  }
  const sitemap = readFileSync(join(out, "sitemap.xml"), "utf8");
  const expected = [`${BASE}/questions/`, ...ledger.kept.map(slug => `${BASE}/questions/${slug}/`)].sort();
  const actual = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) problems.push("sitemap differs from kept ledger");
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
    cpSync(join(process.cwd(), "data/page-quality"), join(tmp, "data/page-quality"), { recursive: true });
    cpSync(join(process.cwd(), "search-loop.config.json"), join(tmp, "search-loop.config.json"));
    const res = build({ root: tmp });
    const okProblems = check(res);
    if (okProblems.length) throw new Error(`good build failed: ${okProblems.join("; ")}`);
    const badPage = res.pages[0];
    badPage.html = badPage.html.replace(`href="${ACTION}"`, 'href="https://example.com"');
    badPage.canonical = "https://example.com/bad";
    const bad = check(res);
    if (!bad.some(p => p.includes(": does not end")) || !bad.some(p => p.includes(": canonical"))) throw new Error("missing action or foreign canonical passed");
    if (!check({ ...res, pages: [] }).length) throw new Error("zero pages passed");
    for (const slug of Object.keys(res.ledger.redirects)) {
      if (existsSync(join(res.out, "questions", slug))) throw new Error("retired page regenerated");
      if (readFileSync(join(res.out, "sitemap.xml"), "utf8").includes(`/questions/${slug}/`)) throw new Error("retired page in sitemap");
      if (readFileSync(join(res.out, "llms.txt"), "utf8").includes(`/questions/${slug}/`)) throw new Error("retired page in llms");
    }
    const redirectFile = join(res.out, "_redirects");
    writeFileSync(redirectFile, "/ /questions/ 301\n");
    if (!check(res).some(p => p.includes("missing direct 301"))) throw new Error("missing redirect passed");
    // An old upstream artifact must never republish, even if left on disk.
    mkdirSync(join(tmp, "questions/retired-artifact"), { recursive: true });
    writeFileSync(join(tmp, "questions/retired-artifact/index.html"), "stale");
    if (build({ root: tmp }).pages.length !== res.ledger.kept.length) throw new Error("stale artifact republished");
    const badLedger = { ...res.ledger, redirects: { bad: "another-retired-page" } };
    writeFileSync(join(tmp, "data/page-quality/kept.json"), JSON.stringify(badLedger));
    let chainRejected = false;
    try { build({ root: tmp }); } catch { chainRejected = true; }
    if (!chainRejected) throw new Error("redirect to retired page passed");
    writeFileSync(join(tmp, "data/page-quality/kept.json"), JSON.stringify({ kept: [], redirects: {} }));
    let rejected = false;
    try { build({ root: tmp }); } catch { rejected = true; }
    if (!rejected) throw new Error("empty ledger passed");
    console.log("learn-build self-test ok (good page passes; missing action, foreign canonical and empty ledger fail; stale pages stay retired)");
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
