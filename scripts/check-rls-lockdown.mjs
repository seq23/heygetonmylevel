#!/usr/bin/env node
// Guard for the 16 Oct 2026 Lovable finding "Some access rules let everyone through".
// 1. Static: no migration after the lockdown re-opens read/change/delete on the
//    locked tables, and no browser code reads, updates or deletes them directly.
// 2. Live (--live): with the public anon key the site ships, every locked table
//    must show zero rows. Hard-fails if it checked nothing.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const LOCKED = ["sessions", "passages", "questions", "responses", "daily_usage_stats", "daily_country_stats"];
const LOCKDOWN = "20261016120000_lock_down_public_tables.sql";
const fail = (m) => { console.error(`RLS guard: ${m}`); process.exitCode = 1; };
let checks = 0;

const migDir = "supabase/migrations";
const migs = readdirSync(migDir).filter((f) => f.endsWith(".sql")).sort();
const at = migs.indexOf(LOCKDOWN);
if (at < 0) fail(`lockdown migration ${LOCKDOWN} missing`);
const lockdown = at >= 0 ? readFileSync(join(migDir, LOCKDOWN), "utf8") : "";
for (const name of ["Allow all session operations", "Allow all passage operations", "Allow all question operations", "Allow all response operations"]) {
  checks++; if (!lockdown.includes(`DROP POLICY IF EXISTS "${name}"`)) fail(`lockdown does not drop "${name}"`);
}
for (const f of [LOCKDOWN, ...migs.slice(at + 1)]) {
  const sql = readFileSync(join(migDir, f), "utf8");
  for (const m of sql.matchAll(/CREATE\s+POLICY\s+"[^"]+"\s+ON\s+public\.(\w+)([\s\S]*?);/gi)) {
    if (!LOCKED.includes(m[1])) continue;
    checks++;
    const body = m[2];
    if (!/FOR\s+INSERT/i.test(body)) fail(`${f}: policy on ${m[1]} is not INSERT-only`);
    if (/WITH\s+CHECK\s*\(\s*true\s*\)/i.test(body)) fail(`${f}: policy on ${m[1]} checks nothing`);
  }
  if (/DISABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(sql)) fail(`${f}: disables RLS`);
}

const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(d, e.name)) : /\.(t|j)sx?$/.test(e.name) ? [join(d, e.name)] : []);
for (const file of walk("src")) {
  const code = readFileSync(file, "utf8");
  for (const m of code.matchAll(/\.from\(\s*["'](\w+)["']\s*\)([\s\S]{0,800}?)(?:;|\n\s*\n)/g)) {
    if (!LOCKED.includes(m[1])) continue;
    checks++;
    if (/\.(select|update|delete|upsert)\(/.test(m[2])) fail(`${file}: browser reads or changes ${m[1]} directly (RLS is insert-only)`);
  }
}

if (process.argv.includes("--live")) {
  const env = existsSync(".env") ? Object.fromEntries(readFileSync(".env", "utf8").split("\n").map((l) => l.match(/^(\w+)="?([^"]*)"?$/)).filter(Boolean).map((m) => [m[1], m[2]])) : {};
  const url = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) fail("--live needs VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY");
  else for (const t of LOCKED) {
    const r = await fetch(`${url}/rest/v1/${t}?select=*&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" } });
    checks++;
    const range = r.headers.get("content-range") || "";
    const total = Number(range.split("/")[1] || 0);
    if (r.ok && total > 0) fail(`live: anon key can read ${total} rows of ${t}`);
    else console.log(`live ${t}: ${r.status} ${range || "-"}`);
  }
}

if (checks === 0) fail("checked nothing");
console.log(`RLS guard: ${checks} checks, ${process.exitCode ? "FAILED" : "ok"}`);
