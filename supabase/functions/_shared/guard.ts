// Shared caller check + rate limits for every edge function that spends money
// (Lovable AI gateway, Resend email). Added 3 Nov 2026 after an outside scanner
// found Time-2-Read's paid TTS endpoint callable with no login and no limit; the
// same audit found generate-reading, send-feedback, cost-report and traffic-alert
// here open to anyone (verify_jwt = false, no check in code).
//
// The reading app has no accounts by design (children read without signing up),
// so a caller is either a signed-in Supabase user (JWT verified with the Auth
// server) or the public app (the project anon key), keyed by IP. The anon key is
// public: it is NOT treated as proof of anything. What protects the bill is the
// per-caller hourly/daily limits and the global daily ceiling, enforced in the
// database (rate_limit_hit RPC, service role only) so they hold across isolates.
// This module is pure: no remote imports, all I/O injected, so it runs under
// `deno test` (supabase/functions/_shared/guard.test.ts).

export interface Db {
  rpc(fn: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: { message: string; code?: string } | null }>;
}

export interface GuardDeps {
  env: (name: string) => string | undefined;
  db: Db | null;
  /** Returns the user id for a valid user JWT, else null. */
  getUserId: (jwt: string) => Promise<string | null>;
}

export interface Limits {
  /** Function name: part of every bucket key. */
  name: string;
  perCallerPerHour: number;
  perCallerPerDay: number;
  globalPerDay: number;
}

const ALLOWED_ORIGIN = /^(https:\/\/(www\.)?heygetonmylevel\.com|https:\/\/[a-z0-9-]+\.(lovable\.app|lovableproject\.com)|http:\/\/localhost(:\d+)?)$/;

export function corsFor(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const h: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  if (ALLOWED_ORIGIN.test(origin)) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

export function json(req: Request, status: number, body: unknown, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsFor(req), "Content-Type": "application/json", ...extra } });
}

function safeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

const bearer = (req: Request) => (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();

export function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip") || (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
}

export type Caller = { kind: "user" | "app"; key: string };

/** 401 unless the request carries a verified user JWT or the project's app key. */
export async function identify(req: Request, deps: GuardDeps): Promise<Caller | Response> {
  const anonKey = deps.env("SUPABASE_ANON_KEY") || "";
  if (!anonKey) return json(req, 503, { error: "SUPABASE_ANON_KEY missing in function env", stop: "SUPABASE_ANON_KEY_MISSING" });
  const token = bearer(req);
  const apikey = req.headers.get("apikey") || "";
  if (token && !safeEqual(token, anonKey)) {
    const uid = await deps.getUserId(token).catch(() => null);
    if (!uid) return json(req, 401, { error: "Sign-in expired. Reload the page and try again." });
    return { kind: "user", key: `user:${uid}` };
  }
  if (safeEqual(token, anonKey) || safeEqual(apikey, anonKey)) return { kind: "app", key: `ip:${clientIp(req)}` };
  return json(req, 401, { error: "Unauthorized" });
}

// Per-isolate fallback, used only if the rate_limit_hit RPC is unavailable
// (migration not yet applied). Logged loudly; never silently unlimited.
const memory = new Map<string, number>();

async function hit(deps: GuardDeps, bucket: string, windowSeconds: number): Promise<number> {
  if (deps.db) {
    const { data, error } = await deps.db.rpc("rate_limit_hit", { p_bucket: bucket, p_window_seconds: windowSeconds });
    if (!error && typeof data === "number") return data;
    console.error(`RATE_LIMIT_STORE_UNAVAILABLE: ${error?.code || ""} ${error?.message || "no count returned"}; using per-isolate limits`);
  } else {
    console.error("RATE_LIMIT_STORE_UNAVAILABLE: no service-role client; using per-isolate limits");
  }
  const k = `${bucket}@${Math.floor(Date.now() / 1000 / windowSeconds)}`;
  const n = (memory.get(k) || 0) + 1;
  memory.set(k, n);
  return n;
}

const envInt = (deps: GuardDeps, name: string, dflt: number) => {
  const v = Number(deps.env(name));
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : dflt;
};

/** Returns the caller, or a 401/429/503 Response to send back unchanged. */
export async function guardPaid(req: Request, limits: Limits, deps: GuardDeps): Promise<Caller | Response> {
  const caller = await identify(req, deps);
  if (caller instanceof Response) return caller;
  const up = limits.name.toUpperCase().replace(/-/g, "_");
  const perHour = envInt(deps, `${up}_PER_CALLER_HOUR`, limits.perCallerPerHour);
  const perDay = envInt(deps, `${up}_PER_CALLER_DAY`, limits.perCallerPerDay);
  const global = envInt(deps, `${up}_GLOBAL_DAY`, limits.globalPerDay);
  const tooMany = (msg: string, retry: number) => json(req, 429, { error: msg }, { "Retry-After": String(retry) });

  if ((await hit(deps, `${limits.name}:${caller.key}:h`, 3600)) > perHour) return tooMany("Too many requests. Please wait a little and try again.", 600);
  if ((await hit(deps, `${limits.name}:${caller.key}:d`, 86400)) > perDay) return tooMany("Daily limit reached. Please come back tomorrow.", 3600);
  // A signed-in user is also counted against their IP, so minting accounts does not lift the limit.
  if (caller.kind === "user" && (await hit(deps, `${limits.name}:ip:${clientIp(req)}:d`, 86400)) > perDay) return tooMany("Daily limit reached. Please come back tomorrow.", 3600);
  if ((await hit(deps, `${limits.name}:global:d`, 86400)) > global) {
    console.error(`GLOBAL_DAILY_CEILING_REACHED: ${limits.name} > ${global}`);
    return tooMany("This service is busy today. Please try again tomorrow.", 3600);
  }
  return caller;
}

/** Operator-only functions: the service-role key (cron) or the ADMIN_REPORT_KEY secret. */
export function requireAdmin(req: Request, env: (name: string) => string | undefined): Response | null {
  const service = env("SUPABASE_SERVICE_ROLE_KEY") || "";
  const adminKey = env("ADMIN_REPORT_KEY") || "";
  if (safeEqual(bearer(req), service)) return null;
  if (adminKey && safeEqual(req.headers.get("x-admin-key") || "", adminKey)) return null;
  return json(req, 401, { error: adminKey ? "Unauthorized" : "Unauthorized (ADMIN_REPORT_KEY not set: operator panel disabled)" });
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
