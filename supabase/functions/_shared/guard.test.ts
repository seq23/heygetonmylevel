// Behaviour guard for the paid-endpoint fix (3 Nov 2026): no caller -> 401, over
// the limit -> 429 before any paid call, real callers (app key or signed-in user)
// -> 200 with the paid call mocked. Run: deno test supabase/functions/_shared/
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { makeHandler, LIMITS } from "../generate-reading/handler.ts";
import { makeHandler as makeFeedback } from "../send-feedback/handler.ts";
import { requireAdmin } from "./guard.ts";

const ANON = "anon-key-123";
const USER_JWT = "user-jwt-abc";

function setup(env: Record<string, string> = {}) {
  const counts = new Map<string, number>();
  let paidCalls = 0;
  const sent: { html: string; to: string[] }[] = [];
  const base = {
    env: (k: string) => ({ SUPABASE_ANON_KEY: ANON, LOVABLE_API_KEY: "x", OWNER_ALERT_EMAIL: "owner@example.test", ...env })[k],
    db: {
      rpc: (fn: string, a: Record<string, unknown>) => {
        if (fn !== "rate_limit_hit") return Promise.resolve({ data: null, error: { message: "unknown" } });
        const n = (counts.get(a.p_bucket as string) || 0) + 1;
        counts.set(a.p_bucket as string, n);
        return Promise.resolve({ data: n, error: null });
      },
    },
    getUserId: (jwt: string) => Promise.resolve(jwt === USER_JWT ? "u1" : null),
  };
  const reading = makeHandler({
    ...base,
    fetch: (() => { paidCalls++; return Promise.resolve(new Response(JSON.stringify({ choices: [{ message: { content: '{"response":"ok"}' } }] }))); }) as typeof fetch,
    rpcQuiet: () => {},
    insertCachedPassage: () => Promise.resolve({ error: null }),
  });
  const feedback = makeFeedback({ ...base, sendEmail: (m) => { sent.push(m); return Promise.resolve({}); } });
  return { reading, feedback, paid: () => paidCalls, sent };
}

const req = (headers: Record<string, string>, body: unknown = { type: "tutor", userQuestion: "hi", passageText: "A cat." }) =>
  new Request("https://x/functions/v1/generate-reading", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4", ...headers }, body: JSON.stringify(body) });

Deno.test("no auth -> 401 and no paid call", async () => {
  const s = setup();
  assertEquals((await s.reading(req({}))).status, 401);
  assertEquals((await s.reading(req({ authorization: "Bearer forged" }))).status, 401);
  assertEquals((await s.feedback(req({}, { message: "x" }))).status, 401);
  assertEquals(s.paid(), 0);
  assertEquals(s.sent.length, 0);
});

Deno.test("valid user and the public app pass, with the paid call mocked", async () => {
  const s = setup();
  const r = await s.reading(req({ authorization: `Bearer ${USER_JWT}` }));
  assertEquals(r.status, 200);
  assertEquals((await r.json()).response, "ok");
  assertEquals((await s.reading(req({ authorization: `Bearer ${ANON}`, apikey: ANON }))).status, 200);
  assertEquals(s.paid(), 2);
});

Deno.test("over the per-caller hourly limit -> 429 before the paid call", async () => {
  const s = setup();
  for (let i = 0; i < LIMITS.perCallerPerHour; i++) assertEquals((await s.reading(req({ apikey: ANON }))).status, 200);
  const over = await s.reading(req({ apikey: ANON }));
  assertEquals(over.status, 429);
  assertEquals(s.paid(), LIMITS.perCallerPerHour);
  // a different IP is a different caller
  assertEquals((await s.reading(req({ apikey: ANON, "x-forwarded-for": "5.6.7.8" }))).status, 200);
});

Deno.test("global daily ceiling -> 429 for everyone", async () => {
  const s = setup({ GENERATE_READING_GLOBAL_DAY: "3" });
  for (let i = 0; i < 3; i++) assertEquals((await s.reading(req({ apikey: ANON, "x-forwarded-for": `9.9.9.${i}` }))).status, 200);
  assertEquals((await s.reading(req({ apikey: ANON, "x-forwarded-for": "8.8.8.8" }))).status, 429);
});

Deno.test("feedback escapes markup and is rate limited", async () => {
  const s = setup();
  assertEquals((await s.feedback(req({ apikey: ANON }, { type: "bug", message: "<img src=x onerror=alert(1)>" }))).status, 200);
  assertEquals(s.sent[0].html.includes("<img"), false);
  assertEquals(s.sent[0].to, ["owner@example.test"]);
  for (let i = 0; i < 4; i++) await s.feedback(req({ apikey: ANON }, { message: "m" }));
  assertEquals((await s.feedback(req({ apikey: ANON }, { message: "m" }))).status, 429);
});

Deno.test("operator functions refuse the public app key", () => {
  const env = (k: string) => ({ SUPABASE_SERVICE_ROLE_KEY: "svc", ADMIN_REPORT_KEY: "adm" })[k];
  const mk = (h: Record<string, string>) => new Request("https://x", { method: "POST", headers: h });
  assertEquals(requireAdmin(mk({ authorization: `Bearer ${ANON}`, apikey: ANON }), env)?.status, 401);
  assertEquals(requireAdmin(mk({}), env)?.status, 401);
  assertEquals(requireAdmin(mk({ authorization: "Bearer svc" }), env), null);
  assertEquals(requireAdmin(mk({ "x-admin-key": "adm" }), env), null);
});
