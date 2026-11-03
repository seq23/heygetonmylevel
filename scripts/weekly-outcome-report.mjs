#!/usr/bin/env node
/**
 * Search Readiness i9: the weekly outcome report for heygetonmylevel.com.
 *
 * "Without a report nobody notices a drop for a month." It reads only what
 * search-console-daily.yml already collected - data/search_intelligence/gsc_truth.json,
 * gsc_query_history.json and index_coverage.json - compares this week with the week before, and
 * says whether the site is green, amber or red, with the reason.
 *
 *   node scripts/weekly-outcome-report.mjs             # markdown report on stdout
 *   node scripts/weekly-outcome-report.mjs --json      # the report object
 *   node scripts/weekly-outcome-report.mjs --self-test # the verdict rules behave
 *
 * REPORT_OUT=<file> also writes the report object there (the workflow uploads it and files the
 * one self-closing issue from its verdict).
 *
 * It invents nothing. The first recorded week says it has no prior week rather than showing a
 * delta against nothing, and a collector that took a named stop makes the report say so instead
 * of reporting its stale numbers as this week's.
 *
 * Rule 0: no measurement file, or zero recorded windows, exits 1. A report cannot pass while
 * having read nothing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "data", "search_intelligence");
const DOMAIN = "heygetonmylevel.com";
/** Under one impression per ten sitemap pages is the grid's own floor for "Google stopped showing it". */
const IMPRESSIONS_PER_PAGE_FLOOR = 0.1;

const read = (name) => JSON.parse(fs.readFileSync(path.join(DATA, name), "utf8"));
const pct = (now, before) => (before > 0 ? ((now - before) / before) * 100 : null);
const sign = (n) => (n > 0 ? `+${n}` : `${n}`);

/** The verdict rules, pure so --self-test can hold them. */
export function verdictOf({ impressions, prevImpressions, clicks, sitemapUrls, indexed, notIndexed, stops }) {
  const reasons = [];
  let verdict = "green";
  const red = (why) => { verdict = "red"; reasons.push(why); };
  const amber = (why) => { if (verdict !== "red") verdict = "amber"; reasons.push(why); };

  for (const s of stops) red(`a collector took a named stop: ${s}`);
  const drop = pct(impressions, prevImpressions);
  if (drop !== null && drop <= -50) red(`impressions fell ${Math.abs(drop).toFixed(0)}% week over week (${prevImpressions} -> ${impressions})`);
  else if (drop !== null && drop <= -20) amber(`impressions fell ${Math.abs(drop).toFixed(0)}% week over week (${prevImpressions} -> ${impressions})`);
  if (sitemapUrls > 0 && impressions / sitemapUrls < IMPRESSIONS_PER_PAGE_FLOOR) {
    red(`${impressions} impressions across ${sitemapUrls} sitemap pages is under one per ten pages (Google is barely showing the site)`);
  }
  if (sitemapUrls > 0 && indexed === 0) red(`no sitemap URL is indexed (${sitemapUrls} submitted)`);
  else if (notIndexed > indexed) amber(`${notIndexed} sitemap URLs are not indexed against ${indexed} that are`);
  if (!reasons.length) reasons.push(`${impressions} impressions, ${clicks} clicks, ${indexed} of ${sitemapUrls} sitemap URLs indexed`);
  return { verdict, reasons };
}

function build() {
  for (const f of ["gsc_truth.json", "gsc_query_history.json", "index_coverage.json"]) {
    if (!fs.existsSync(path.join(DATA, f))) {
      console.error(`weekly-outcome-report: data/search_intelligence/${f} is missing; search-console-daily.yml has not written it yet`);
      process.exit(1);
    }
  }
  const truth = read("gsc_truth.json");
  const history = read("gsc_query_history.json");
  const coverage = read("index_coverage.json");
  const windows = history.windows ?? [];
  if (!windows.length) {
    console.error("weekly-outcome-report: gsc_query_history.json records zero windows (nothing to compare)");
    process.exit(1);
  }
  const week = windows[windows.length - 1];
  const prev = windows.length > 1 ? windows[windows.length - 2] : null;
  const stops = [truth, coverage].filter((f) => f.state !== "OK").map((f) => `${f.truth_source}: ${f.named_stop ?? f.state}`);
  const by = coverage.summary?.by_coverage_state ?? {};
  const indexed = by["Submitted and indexed"] ?? 0;
  const notIndexed = Object.entries(by).filter(([k]) => k !== "Submitted and indexed").reduce((n, [, v]) => n + v, 0);
  const sitemapUrls = coverage.sitemap_url_count ?? 0;

  const { verdict, reasons } = verdictOf({
    impressions: week.totals?.impressions ?? 0,
    prevImpressions: prev?.totals?.impressions ?? null,
    clicks: week.totals?.clicks ?? 0,
    sitemapUrls, indexed, notIndexed, stops,
  });

  const topQueries = Object.entries(week.queries ?? {})
    .sort((a, b) => b[1].impressions - a[1].impressions).slice(0, 10)
    .map(([q, m]) => ({ query: q, ...m, prev_impressions: prev?.queries?.[q]?.impressions ?? null }));

  return {
    schema_version: "1.0",
    domain: DOMAIN,
    generated_at: new Date().toISOString(),
    read_from: ["data/search_intelligence/gsc_truth.json", "data/search_intelligence/gsc_query_history.json", "data/search_intelligence/index_coverage.json"],
    week: { start_date: week.start_date, end_date: week.end_date, collected_at: week.collected_at, totals: week.totals },
    previous_week: prev ? { start_date: prev.start_date, end_date: prev.end_date, totals: prev.totals } : null,
    week_over_week: prev
      ? Object.fromEntries(["clicks", "impressions", "position"].map((k) => [k, { now: week.totals?.[k] ?? 0, before: prev.totals?.[k] ?? 0, change_pct: pct(week.totals?.[k] ?? 0, prev.totals?.[k] ?? 0) }]))
      : { note: "first recorded window: there is no prior week to compare with" },
    coverage: { sitemap_url_count: sitemapUrls, indexed, not_indexed: notIndexed, by_coverage_state: by, collected_at: coverage.collected_at },
    top_queries: topQueries,
    verdict,
    reasons,
    summary: `${verdict.toUpperCase()}: ${week.totals?.impressions ?? 0} impressions and ${week.totals?.clicks ?? 0} clicks in ${week.start_date}..${week.end_date}, ${indexed} of ${sitemapUrls} sitemap URLs indexed.`,
  };
}

function markdown(r) {
  const w = r.week_over_week;
  const row = (k) => (w?.[k] ? `| ${k} | ${w[k].before} | ${w[k].now} | ${w[k].change_pct === null ? "—" : `${sign(w[k].change_pct.toFixed(0))}%`} |` : null);
  return [
    `## Weekly outcome — ${r.domain}`,
    ``,
    `**${r.summary}**`,
    ``,
    ...r.reasons.map((x) => `- ${x}`),
    ``,
    r.previous_week ? [`| measure | ${r.previous_week.end_date} | ${r.week.end_date} | change |`, `|---|---|---|---|`, row("impressions"), row("clicks"), row("position")].filter(Boolean).join("\n") : `_First recorded window (${r.week.start_date}..${r.week.end_date}): no prior week to compare with._`,
    ``,
    `Index coverage, ${r.coverage.collected_at?.slice(0, 10)}: ` + Object.entries(r.coverage.by_coverage_state).map(([k, v]) => `${v} ${k.toLowerCase()}`).join(", ") + `.`,
    ``,
    r.top_queries.length ? [`| query | impressions | was | position |`, `|---|---|---|---|`, ...r.top_queries.map((q) => `| ${q.query} | ${q.impressions} | ${q.prev_impressions ?? "—"} | ${Math.round(q.position)} |`)].join("\n") : `_Search Console attributed no queries this window._`,
    ``,
    `Read from ${r.read_from.join(", ")}.`,
  ].join("\n");
}

function selfTest() {
  const base = { impressions: 100, prevImpressions: 100, clicks: 5, sitemapUrls: 50, indexed: 40, notIndexed: 10, stops: [] };
  const cases = [
    ["a steady week is green", base, "green"],
    ["a 60% fall is red", { ...base, impressions: 40 }, "red"],
    ["a 25% fall is amber", { ...base, impressions: 75 }, "amber"],
    ["under one impression per ten pages is red", { ...base, impressions: 4, prevImpressions: 4 }, "red"],
    ["nothing indexed is red", { ...base, indexed: 0, notIndexed: 50 }, "red"],
    ["more not-indexed than indexed is amber", { ...base, indexed: 10, notIndexed: 40 }, "amber"],
    ["a collector's named stop is red", { ...base, stops: ["NO_CREDENTIAL"] }, "red"],
    ["a first week with no prior week is green", { ...base, prevImpressions: null }, "green"],
  ];
  let bad = 0;
  for (const [what, input, want] of cases) {
    const { verdict, reasons } = verdictOf(input);
    const ok = verdict === want && reasons.length > 0;
    console.log(`${ok ? "ok  " : "FAIL"} ${what} (${verdict}: ${reasons[0]})`);
    if (!ok) bad += 1;
  }
  if (bad) { console.error(`weekly-outcome-report --self-test: ${bad} case(s) failed`); process.exit(1); }
  console.log("weekly-outcome-report --self-test: every verdict rule behaved");
}

if (process.argv.includes("--self-test")) selfTest();
else {
  const r = build();
  if (process.env.REPORT_OUT) fs.writeFileSync(process.env.REPORT_OUT, `${JSON.stringify(r, null, 2)}\n`);
  console.log(process.argv.includes("--json") ? JSON.stringify(r, null, 2) : markdown(r));
}
