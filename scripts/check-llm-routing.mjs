#!/usr/bin/env node
/**
 * Search Readiness i3 and i10: the zero-paid rule, enforced where it works.
 *
 * "A rule no code reads is a wish." This is the test that reads it:
 *   1. config/llm_routing.json is a $0-only policy (the free router's own policyErrors()).
 *   2. docs/cost/zero-paid-llm.md exists and still says "nothing paid".
 *   3. CLAUDE.md still says "nothing paid", so the next agent in the repo meets the rule first.
 *   4. No provider endpoint is called from code that is neither the free router nor a lane
 *      recorded in config/product_inference.json. A new paid call site cannot appear unrecorded.
 *
 *   node scripts/check-llm-routing.mjs
 *   node scripts/check-llm-routing.mjs --self-test
 *
 * Rule 0: it exits 1 having scanned zero files, so it cannot pass while reading nothing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readConfig, policyErrors, CONFIG_PATH } from "./llm/free_router.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOC = "docs/cost/zero-paid-llm.md";
const PRODUCT = "config/product_inference.json";
const ROUTER = "scripts/llm/free_router.mjs";
const SCAN_ROOTS = ["scripts", "src", "supabase", ".github/workflows"];
const CODE = /\.(m?[jt]sx?|py|ya?ml|md)$/;
/** Files allowed to name a provider endpoint: the router, the two manifests, this check, the doc. */
const ALLOWED = new Set([ROUTER, CONFIG_PATH.replace(`${ROOT}/`, ""), PRODUCT, "scripts/check-llm-routing.mjs", DOC]);

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

function filesUnder(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const d of fs.readdirSync(abs, { withFileTypes: true })) {
    const next = path.join(rel, d.name);
    if (d.name === "node_modules" || d.name === "dist" || d.name.startsWith(".")) continue;
    if (d.isDirectory()) out.push(...filesUnder(next));
    else if (CODE.test(d.name)) out.push(next);
  }
  return out;
}

/** Every provider endpoint named in a file that is not allowed to name one, with its lane if recorded. */
export function unrecordedEndpoints(files, markers, recorded, readFile = read) {
  const out = [];
  for (const rel of files) {
    if (ALLOWED.has(rel)) continue;
    const text = readFile(rel);
    for (const marker of markers) {
      if (!new RegExp(marker).test(text)) continue;
      const bare = marker.replace(/\\/g, "").replace(/\/api$/, "").replace(/\/\*.*$/, "");
      if (recorded.some((e) => e.includes(bare) || bare.includes(e))) continue;
      out.push(`${rel} calls ${bare}, which is in neither ${ROUTER} nor ${PRODUCT}`);
    }
  }
  return out;
}

function selfTest() {
  const markers = ["api\\.openai\\.com", "ai\\.gateway\\.lovable\\.dev"];
  const recorded = ["ai.gateway.lovable.dev"];
  const cases = [
    ["a recorded endpoint in an unlisted file passes", { "src/x.ts": "fetch('https://ai.gateway.lovable.dev/v1')" }, 0],
    ["an unrecorded endpoint is caught", { "src/x.ts": "fetch('https://api.openai.com/v1')" }, 1],
    ["a file with no endpoint passes", { "src/x.ts": "const a = 1" }, 0],
    ["the router itself is not scanned", { [ROUTER]: "fetch('https://api.openai.com/v1')" }, 0],
  ];
  let bad = 0;
  for (const [what, tree, want] of cases) {
    const got = unrecordedEndpoints(Object.keys(tree), markers, recorded, (f) => tree[f]).length;
    const ok = want === 0 ? got === 0 : got >= 1;
    console.log(`${ok ? "ok  " : "FAIL"} ${what} (${got} finding${got === 1 ? "" : "s"})`);
    if (!ok) bad += 1;
  }
  const broken = policyErrors({ ...readConfig(), policy: { ...readConfig().policy, max_cost_usd: 0.01 } });
  const paid = policyErrors({ ...readConfig(), models: [{ id: "anthropic/claude-opus-4", pricing: { prompt: "15", completion: "75" }, context_length: 200000 }] });
  for (const [what, errs] of [["a non-zero max_cost_usd is refused", broken], ["a paid model id is refused", paid]]) {
    const ok = errs.length >= 1;
    console.log(`${ok ? "ok  " : "FAIL"} ${what}`);
    if (!ok) bad += 1;
  }
  if (bad) { console.error(`check-llm-routing --self-test: ${bad} case(s) failed`); process.exit(1); }
  console.log("check-llm-routing --self-test: every case behaved");
}

function main() {
  if (process.argv.includes("--self-test")) return selfTest();
  const errors = [];
  const config = readConfig();
  errors.push(...policyErrors(config).map((e) => `config/llm_routing.json: ${e}`));

  if (!exists(DOC)) errors.push(`${DOC} is missing (the rule has nowhere to live)`);
  else if (!/nothing paid/i.test(read(DOC))) errors.push(`${DOC} no longer says "nothing paid"`);
  if (!/nothing paid/i.test(read("CLAUDE.md"))) errors.push('CLAUDE.md no longer says "nothing paid"');
  if (!exists(PRODUCT)) errors.push(`${PRODUCT} is missing (the product lane must stay recorded)`);

  const markers = config.provider_endpoint_markers ?? [];
  if (!markers.length) errors.push("config/llm_routing.json lists no provider_endpoint_markers, so nothing can be scanned for");
  const recorded = (JSON.parse(read(PRODUCT)).paid_lanes ?? []).flatMap((l) => l.provider_endpoints ?? []);
  const files = SCAN_ROOTS.flatMap(filesUnder);
  if (!files.length || !markers.length) {
    console.error(`check-llm-routing scanned nothing (${files.length} files, ${markers.length} markers)`);
    process.exit(1);
  }
  errors.push(...unrecordedEndpoints(files, markers, recorded));

  if (errors.length) {
    for (const e of errors) console.error(`FAIL ${e}`);
    console.error(`check-llm-routing: ${errors.length} problem(s)`);
    process.exit(1);
  }
  console.log(`check-llm-routing OK: ${config.models.length} :free models, max_cost_usd 0, ${files.length} files scanned for ${markers.length} provider endpoints, ${recorded.length} recorded product endpoint(s)`);
}

main();
