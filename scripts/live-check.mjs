#!/usr/bin/env node
/**
 * Search Readiness h4: read the DEPLOYED site from outside and say what is wrong with it.
 *
 * "The build can pass and the edge can still serve the wrong thing (a Worker that 301'd
 * robots.txt did)." this holds the live host.
 *
 *   node scripts/live-check.mjs                      # https://heygetonmylevel.com
 *   node scripts/live-check.mjs --host example.com   # another host
 *   node scripts/live-check.mjs --self-test          # the check fails on each kind of miss
 *
 * TWO TIERS, because this site is published BY HAND from Lovable, outside GitHub Actions.
 *
 *   Invariants are hard failures, whatever is published: robots.txt and sitemap.xml answer and
 *   are not redirected, every sitemap URL answers 200 without a redirect, the icons / og image /
 *   manifest / IndexNow key / Search Console file answer, http and www reach the canonical host,
 *   and every page carries a parsable Organization and WebSite node, a title and a description.
 *
 *   Current-build checks (site.webmanifest, og:site_name, the sameAs and parentOrganization that
 *   entity.json declares) are held hard only when the live build is this commit's or newer. When
 *   the published build predates them, each prints AWAITING_PUBLISH and the job stays green: the
 *   fix is merged and the publish is the next step, and a red main nobody can clear by changing
 *   code teaches everyone to ignore it.
 *
 *   That grace is bounded two ways, so "awaiting publish" can never become permanent:
 *     - a live build older than MAX_BUILD_AGE_DAYS fails as LIVE_BUILD_STALE;
 *     - a live build with no x-build-date at all fails from STAMP_REQUIRED_FROM onward.
 *
 * Rule 0: it exits 1 having checked zero URLs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_HOST = "heygetonmylevel.com";
const UA = "Mozilla/5.0 (compatible; heygetonmylevel-live-check/1.0; +https://heygetonmylevel.com)";
const MAX_BUILD_AGE_DAYS = 45;
/** Every build from 3 Nov 2026 writes x-build-date; after this date its absence is a fault. */
const STAMP_REQUIRED_FROM = "2026-12-01";
const SAMPLE = 12;

const problems = [];
const waiting = [];
const notes = [];
let checked = 0;

const fail = (m) => problems.push(m);
const await_publish = (m) => waiting.push(m);

async function get(url, { method = "GET" } = {}) {
  checked += 1;
  try {
    const res = await fetch(url, { method, redirect: "manual", headers: { "user-agent": UA } });
    const body = method === "GET" && res.status < 400 ? await res.text() : "";
    return { ok: res.status >= 200 && res.status < 300, status: res.status, location: res.headers.get("location"), type: res.headers.get("content-type") ?? "", body };
  } catch (error) {
    return { ok: false, status: 0, error: String(error?.message ?? error), type: "", body: "" };
  }
}

/** A URL that must answer 200 with no redirect. */
async function mustAnswer(url, what, { type } = {}) {
  const r = await get(url);
  if (!r.ok) { fail(`${what}: ${url} answered ${r.status || r.error}${r.location ? ` -> ${r.location}` : ""}`); return null; }
  if (type && !r.type.includes(type)) fail(`${what}: ${url} is ${r.type || "(no content-type)"}, expected ${type}`);
  return r;
}

export function jsonLdNodes(html) {
  const out = [];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let json; try { json = JSON.parse(m[1]); } catch { out.push({ __unparsable: true }); continue; }
    for (const n of Array.isArray(json) ? json : json["@graph"] ?? [json]) out.push(n);
  }
  return out;
}
const typesOf = (n) => [n?.["@type"]].flat().filter(Boolean).map(String);
const metaOf = (html, prop) => html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']*)["']`, "i"))?.[1]
  ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${prop}["']`, "i"))?.[1] ?? null;

/** How old the published build is, in days, or null when it carries no stamp. */
export function buildAgeDays(html, now = Date.now()) {
  const stamp = metaOf(html, "x-build-date");
  const t = stamp ? Date.parse(stamp) : NaN;
  return Number.isFinite(t) ? (now - t) / 86_400_000 : null;
}

/** Is the live build new enough to be held to what this checkout declares? */
export function liveBuildState(html, { now = Date.now(), builtAt = null } = {}) {
  const age = buildAgeDays(html, now);
  if (age === null) {
    return Date.parse(STAMP_REQUIRED_FROM) <= now
      ? { state: "no_stamp_overdue", why: `the live build carries no x-build-date and every build since 3 Nov 2026 writes one (overdue since ${STAMP_REQUIRED_FROM})` }
      : { state: "no_stamp", why: `the live build carries no x-build-date, so it predates 3 Nov 2026; a missing stamp becomes a failure on ${STAMP_REQUIRED_FROM}` };
  }
  if (age > MAX_BUILD_AGE_DAYS) return { state: "stale", age, why: `the live build is ${age.toFixed(1)} days old (over ${MAX_BUILD_AGE_DAYS}); nothing has been published in that time` };
  if (builtAt && Date.parse(metaOf(html, "x-build-date")) < Date.parse(builtAt)) {
    return { state: "older_than_checkout", age, why: `the live build (${metaOf(html, "x-build-date")}) predates this checkout's build (${builtAt})` };
  }
  return { state: "current", age };
}

async function main() {
  if (process.argv.includes("--self-test")) return selfTest();
  const hostArg = process.argv.indexOf("--host");
  const host = hostArg > -1 ? process.argv[hostArg + 1] : DEFAULT_HOST;
  const origin = `https://${host}`;
  const entity = JSON.parse(fs.readFileSync(path.join(ROOT, "entity.json"), "utf8"));

  // ── Crawl files ──────────────────────────────────────────────────────────────
  const robots = await mustAnswer(`${origin}/robots.txt`, "robots.txt");
  if (robots && !/sitemap:/i.test(robots.body)) fail("robots.txt names no sitemap");
  if (robots && /^\s*Disallow:\s*\/\s*$/im.test(robots.body)) fail("robots.txt disallows the whole site");

  const sitemap = await mustAnswer(`${origin}/sitemap.xml`, "sitemap.xml");
  const locs = sitemap ? [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()) : [];
  if (sitemap && locs.length < 10) fail(`sitemap.xml lists ${locs.length} URLs (expected at least 10)`);
  for (const u of locs) if (new URL(u).hostname.replace(/^www\./, "") !== host.replace(/^www\./, "")) fail(`sitemap.xml lists ${u}, which is not on ${host}`);

  // ── Static surfaces the build ships ──────────────────────────────────────────
  // ── The homepage, and which build is actually out there ──────────────────────
  const home = await mustAnswer(`${origin}/`, "homepage");
  if (!home) { report(host); return; }
  const live = liveBuildState(home.body, { builtAt: builtAtOfCheckout() });
  notes.push(`live build: ${live.state}${live.age === undefined ? "" : ` (${live.age?.toFixed(1)} days old)`}`);
  if (live.state === "stale" || live.state === "no_stamp_overdue") fail(`LIVE_BUILD_STALE ${live.why}`);
  const currentBuild = live.state === "current";
  const held = (what, isOk, why) => {
    if (isOk) return;
    if (currentBuild) fail(`${what}: ${why}`);
    else await_publish(`AWAITING_PUBLISH ${what}: ${why} (${live.why})`);
  };

  const pages = [`${origin}/`, ...locs.filter((u) => u !== `${origin}/`).slice(0, SAMPLE - 1)];
  for (const url of pages) {
    const r = url === `${origin}/` ? home : await get(url);
    const where = new URL(url).pathname;
    if (!r.ok) { fail(`sitemap URL ${url} answered ${r.status || r.error}${r.location ? ` -> ${r.location}` : ""}`); continue; }
    const nodes = jsonLdNodes(r.body);
    if (nodes.some((n) => n.__unparsable)) fail(`${where}: a JSON-LD block does not parse`);
    const org = nodes.find((n) => typesOf(n).some((t) => /Organization/.test(t)));
    const site = nodes.find((n) => typesOf(n).includes("WebSite"));
    if (!org) fail(`${where}: no Organization node in the JSON-LD`);
    if (!site) fail(`${where}: no WebSite node in the JSON-LD`);
    if (!/<title[^>]*>[^<]{10,}<\/title>/.test(r.body)) fail(`${where}: no usable <title>`);
    if (!metaOf(r.body, "description")) fail(`${where}: no meta description`);
    if (org) {
      if (org.name && org.name !== entity.name) fail(`${where}: Organization name ${JSON.stringify(org.name)} is not entity.json's ${JSON.stringify(entity.name)}`);
      held(`${where} og:site_name`, Boolean(metaOf(r.body, "og:site_name")), "the page carries no og:site_name (Search Readiness f6)");
      held(`${where} sameAs`, (org.sameAs ?? []).some((u) => entity.sameAs.includes(u)), `the Organization node lists no sameAs from entity.json (${entity.sameAs.join(", ")})`);
      held(`${where} parentOrganization`, String(org.parentOrganization?.["@id"] ?? "").includes("billionairehighperformancecoach.com/spry-labs"), "the Organization node names no Spry Labs parent (Search Readiness k4)");
    }
  }
  // ── The surfaces this build ships ────────────────────────────────────────────
  // Each is a claim about the CURRENT build: a file a published-but-older build never had
  // cannot answer yet, and saying "404" about it would be true and useless.
  const keyFile = fs.readdirSync(path.join(ROOT, "public")).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (!keyFile) fail("no IndexNow key file in public/ (nothing to verify on the live host)");
  else {
    const key = keyFile.replace(/\.txt$/, "");
    const r = await get(`${origin}/${keyFile}`);
    held("IndexNow key", r.ok && r.body.trim() === key, r.ok ? `the key file serves ${JSON.stringify(r.body.trim().slice(0, 40))}, not ${key}` : `${origin}/${keyFile} answered ${r.status || r.error}`);
  }
  const gsc = fs.readdirSync(path.join(ROOT, "public")).find((f) => /^google[0-9a-f]+\.html$/.test(f));
  if (gsc) {
    const r = await get(`${origin}/${gsc}`);
    held("Search Console verification file", r.ok, `${origin}/${gsc} answered ${r.status || r.error}`);
  }
  for (const [p, what] of [["/apple-touch-icon.png", "apple touch icon"], ["/icons/icon-192.png", "icon 192"], ["/icons/icon-512.png", "icon 512"], ["/og-image.jpg", "og image"], ["/manifest.json", "web manifest"], ["/site.webmanifest", "site.webmanifest"]]) {
    const r = await get(`${origin}${p}`);
    held(what, r.ok, `${origin}${p} answered ${r.status || r.error}${r.location ? ` -> ${r.location}` : ""}`);
  }

  // ── Canonicalisation: http reaches https, and www never serves a second copy ──
  const insecure = await get(`http://${host}/`);
  const to = insecure.location ?? "";
  const redirectsHome = insecure.status >= 300 && insecure.status < 400 && to && new URL(to, `http://${host}/`).protocol === "https:"
    && new URL(to, `http://${host}/`).hostname.replace(/^www\./, "") === host.replace(/^www\./, "");
  if (!redirectsHome) fail(`http://${host}/ answered ${insecure.status || insecure.error}${to ? ` -> ${to}` : ""} instead of a redirect to ${origin}/`);
  const www = await get(`https://www.${host}/`);
  if (www.ok) fail(`https://www.${host}/ answers 200 instead of redirecting to ${origin}/ (two hosts serving one site)`);
  else if (!www.status) notes.push(`no www host: https://www.${host}/ does not resolve, so there is no second copy to canonicalise`);
  else if (www.status >= 400) notes.push(`https://www.${host}/ answers ${www.status}; no second copy of the site`);

  report(host);
}

/** When this checkout's own build was made, if it has been built. */
function builtAtOfCheckout() {
  const f = path.join(ROOT, "dist", "index.html");
  if (!fs.existsSync(f)) return null;
  return metaOf(fs.readFileSync(f, "utf8"), "x-build-date");
}

function report(host) {
  for (const n of notes) console.log(`note  ${n}`);
  for (const w of waiting) console.log(w);
  for (const p of problems) console.error(`FAIL  ${p}`);
  if (!checked) { console.error("live-check checked zero URLs (nothing was read)"); process.exit(1); }
  if (problems.length) {
    console.error(`live-check: ${problems.length} problem(s) on ${host} after ${checked} requests`);
    process.exit(1);
  }
  console.log(`live-check OK: ${host}, ${checked} requests, ${waiting.length} awaiting the next publish`);
}

function selfTest() {
  const now = Date.parse("2026-11-10T00:00:00Z");
  const page = (stamp) => `<html><head>${stamp ? `<meta name="x-build-date" content="${stamp}" />` : ""}</head></html>`;
  const cases = [
    ["a fresh stamp is the current build", page("2026-11-09T00:00:00Z"), "current"],
    ["a 60-day-old build is stale", page("2026-09-10T00:00:00Z"), "stale"],
    ["no stamp before the deadline is a grace", page(null), "no_stamp"],
  ];
  let bad = 0;
  for (const [what, html, want] of cases) {
    const got = liveBuildState(html, { now }).state;
    const ok = got === want;
    console.log(`${ok ? "ok  " : "FAIL"} ${what} (${got})`);
    if (!ok) bad += 1;
  }
  const overdue = liveBuildState(page(null), { now: Date.parse("2026-12-02T00:00:00Z") }).state;
  console.log(`${overdue === "no_stamp_overdue" ? "ok  " : "FAIL"} no stamp after the deadline is a failure (${overdue})`);
  if (overdue !== "no_stamp_overdue") bad += 1;
  const nodes = jsonLdNodes('<script type="application/ld+json">{"@type":"Organization"}</script><script type="application/ld+json">{oops}</script>');
  const parsed = nodes.filter((n) => !n.__unparsable).length === 1 && nodes.some((n) => n.__unparsable);
  console.log(`${parsed ? "ok  " : "FAIL"} a broken JSON-LD block is caught, a good one is read`);
  if (!parsed) bad += 1;
  const stampFree = buildAgeDays("<html><head></head></html>");
  console.log(`${stampFree === null ? "ok  " : "FAIL"} a page with no stamp has no age (${stampFree})`);
  if (stampFree !== null) bad += 1;
  if (bad) { console.error(`live-check --self-test: ${bad} case(s) failed`); process.exit(1); }
  console.log("live-check --self-test: every case behaved");
}

await main();
