#!/usr/bin/env node
// The only door a model call may go through in this repo's own automation.
//
// Owner policy, 11 Oct 2026: "nothing should be paid". This router reads
// config/llm_routing.json, refuses to load unless policy.max_cost_usd is exactly
// 0 and every listed model is priced $0 prompt and $0 completion, tries those
// models in order, and NEVER falls back to a paid model. When no free model
// answers it returns a named stop (nothing generated) instead of reaching for
// one that costs money. A non-zero cost reported by the provider throws: that is
// a policy breach and must fail the run loudly, not be logged and forgotten.
//
// Scope: scripts and workflows in this repository. The HeyGetOnMyLevel app's own
// inference in supabase/functions/generate-reading is a separate lane, funded by the Lovable project credit
// and recorded in config/product_inference.json; it does not come through here.
//
// CLI:
//   node scripts/llm/free_router.mjs --check          live pricing still $0 for every configured model
//   node scripts/llm/free_router.mjs --check --ping   ...and one free model answers a one-line prompt
// Every CLI run prints exactly one `LLM_ROUTER_RECEIPT {...}` line.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const CONFIG_PATH = path.join(ROOT, 'config', 'llm_routing.json');
export const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const MIN_CONTEXT = 32000;

export class PaidCostError extends Error {
  constructor(message, detail) { super(message); this.code = 'PAID_COST_REPORTED'; this.detail = detail; }
}

export function readConfig(file = CONFIG_PATH) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// Every reason the routing config is not a $0-only policy. Empty means it is.
export function policyErrors(c) {
  const e = [];
  if (!c || typeof c !== 'object') return ['config/llm_routing.json is missing or not an object'];
  if (c.policy?.max_cost_usd !== 0) e.push(`policy.max_cost_usd must be exactly 0 (found ${JSON.stringify(c.policy?.max_cost_usd)})`);
  if (c.policy?.paid_fallback !== false) e.push('policy.paid_fallback must be false');
  if (c.policy?.read_by !== 'scripts/llm/free_router.mjs') e.push('policy.read_by must name this router');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(c.pricing_snapshot?.date || ''))) e.push('pricing_snapshot.date must be YYYY-MM-DD');
  const models = Array.isArray(c.models) ? c.models : [];
  if (models.length < 3 || models.length > 4) e.push(`models must be an ordered fallback list of 3-4 (found ${models.length})`);
  const seen = new Set();
  for (const m of models) {
    const id = m?.id;
    if (!id) { e.push('a model entry has no id'); continue; }
    if (!/:free$/.test(id)) e.push(`${id}: every model id must end in :free`);
    if (seen.has(id)) e.push(`${id}: listed twice`);
    seen.add(id);
    const p = m.pricing || {};
    if (!('prompt' in p) || !('completion' in p)) e.push(`${id}: pricing.prompt and pricing.completion are required`);
    for (const [k, v] of Object.entries(p)) if (String(v) !== '0') e.push(`${id}: pricing.${k} is ${JSON.stringify(v)}, not "0"`);
    if (!(Number(m.context_length) >= MIN_CONTEXT)) e.push(`${id}: context_length ${m.context_length} is under 32k`);
  }
  return e;
}

export function loadPolicy(config = readConfig()) {
  const errors = policyErrors(config);
  if (errors.length) {
    const err = new Error(`llm routing policy refused: ${errors.join('; ')}`);
    err.code = 'POLICY_REFUSED';
    throw err;
  }
  return { models: config.models.map((m) => m.id), config };
}

// A cost the provider reports back. Anything above 0 is a breach, not a rounding error.
export function assertFreeUsage(modelId, usage) {
  const cost = Number(usage?.cost ?? 0);
  if (cost > 0) throw new PaidCostError(`${modelId} reported usage.cost ${cost}; policy max_cost_usd is 0`, { modelId, usage });
  return cost;
}

/**
 * Ask the configured free models in order. Returns
 * `{ ok: true, model, text, usage }`, or `{ ok: false, named_stop, attempts }`
 * when every free model refused. Never reaches for a paid model.
 */
export async function ask(prompt, { apiKey = process.env.OPENROUTER_API_KEY, maxTokens = 700, config } = {}) {
  const { models } = loadPolicy(config ?? readConfig());
  if (!apiKey) return { ok: false, named_stop: 'CREDENTIAL_REFUSED: OPENROUTER_API_KEY is not set; nothing generated.', attempts: [] };
  const attempts = [];
  for (const model of models) {
    let res; let body;
    try {
      res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: 'POST',
        headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        // max_price 0 is the provider-side belt to the config's braces: OpenRouter
        // itself refuses to route this call to anything that would charge.
        body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], max_tokens: maxTokens, usage: { include: true }, provider: { max_price: { prompt: 0, completion: 0 } } }),
        signal: AbortSignal.timeout(120000)
      });
      body = await res.json();
    } catch (err) {
      attempts.push({ model, error: `${err.name}: ${err.message}` });
      continue;
    }
    if (!res.ok) { attempts.push({ model, status: res.status, error: JSON.stringify(body).slice(0, 200) }); continue; }
    const served = body?.model;
    if (served && !models.includes(served) && !/:free$/.test(served)) {
      throw new PaidCostError(`asked ${model}, served by ${served}, which is not on the free list`, { asked: model, served });
    }
    assertFreeUsage(model, body?.usage);
    const text = body?.choices?.[0]?.message?.content ?? '';
    if (!text.trim()) { attempts.push({ model, error: 'empty completion' }); continue; }
    return { ok: true, model, text, usage: body.usage ?? null, attempts };
  }
  return { ok: false, named_stop: `NO_FREE_MODEL_ANSWERED: ${models.length} free model(s) tried, none answered; nothing generated.`, attempts };
}

// ─── CLI: --check (live pricing), --ping (one real free call) ─────────────────

async function livePricing(models) {
  const res = await fetch(`${OPENROUTER_BASE}/models`, { signal: AbortSignal.timeout(60000) });
  if (!res.ok) return { ok: false, why: `openrouter /models answered ${res.status}` };
  const byId = new Map(((await res.json()).data || []).map((m) => [m.id, m]));
  const bad = [];
  for (const id of models) {
    const m = byId.get(id);
    if (!m) { bad.push(`${id}: no longer listed`); continue; }
    const p = m.pricing || {};
    if (String(p.prompt) !== '0' || String(p.completion) !== '0') bad.push(`${id}: now prompt ${p.prompt} / completion ${p.completion}`);
  }
  return bad.length ? { ok: false, why: bad.join('; ') } : { ok: true, checked: models.length };
}

async function main(argv) {
  const receipt = { at: new Date().toISOString(), config: 'config/llm_routing.json' };
  let models;
  try { ({ models } = loadPolicy()); receipt.models = models; receipt.policy = 'OK max_cost_usd=0'; }
  catch (err) { console.log(`LLM_ROUTER_RECEIPT ${JSON.stringify({ ...receipt, state: 'POLICY_REFUSED', why: err.message })}`); return 1; }
  const live = await livePricing(models);
  receipt.live_pricing = live.ok ? `all ${live.checked} still $0` : live.why;
  if (!live.ok) { console.log(`LLM_ROUTER_RECEIPT ${JSON.stringify({ ...receipt, state: 'PRICING_CHANGED' })}`); return 1; }
  if (!argv.includes('--ping')) { console.log(`LLM_ROUTER_RECEIPT ${JSON.stringify({ ...receipt, state: 'OK' })}`); return 0; }
  const r = await ask('Reply with the single word: ready');
  if (!r.ok) { console.log(`LLM_ROUTER_RECEIPT ${JSON.stringify({ ...receipt, state: 'NAMED_STOP', named_stop: r.named_stop })}`); return 0; }
  console.log(`LLM_ROUTER_RECEIPT ${JSON.stringify({ ...receipt, state: 'OK', ping_model: r.model, ping: r.text.trim().slice(0, 40), cost: Number(r.usage?.cost ?? 0) })}`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((c) => process.exit(c), (err) => { console.error(`free-router failed: ${err.stack || err}`); process.exit(1); });
}
