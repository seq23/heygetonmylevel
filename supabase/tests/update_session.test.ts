// Replays every migration on a real Postgres (PGlite, in-process) with Supabase's
// roles and default grants, then calls update_session as the browser does (role anon).
// Audit row heygetonmylevel #2: a held session id must not be able to write any
// value the app never writes, revive an old session, or reach the function as PUBLIC.
import { PGlite } from "npm:@electric-sql/pglite@0.2.17";
import { assert, assertEquals, assertRejects } from "https://deno.land/std@0.224.0/assert/mod.ts";

const DIR = new URL("../migrations/", import.meta.url);
// Only creates the pg_cron/pg_net extensions, which PGlite does not ship; nothing in
// any later migration uses them.
const SKIP = new Set(["20260410034342_0ec15784-6023-41be-84c3-655d0dd26317.sql"]);
const NEW = "20261127120000_update_session_narrowed.sql";
const files = [...Deno.readDirSync(DIR)].map((e) => e.name).filter((f) => f.endsWith(".sql")).sort();

const SUPABASE_ROLES = `
  CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
  CREATE ROLE stranger NOLOGIN;
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role, stranger;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;`;

async function db(upTo = files.length) {
  const pg = new PGlite();
  await pg.exec(SUPABASE_ROLES);
  for (const f of files.slice(0, upTo)) if (!SKIP.has(f)) await pg.exec(Deno.readTextFileSync(new URL(f, DIR)));
  return pg;
}

// The browser's own calls: insert its session, then update it through the RPC, as anon.
async function asAnon<T>(pg: PGlite, fn: () => Promise<T>): Promise<T> {
  await pg.exec("SET ROLE anon");
  try { return await fn(); } finally { await pg.exec("RESET ROLE"); }
}
const row = async (pg: PGlite, id: string) =>
  (await pg.query<{ lvl: number | null; taken: boolean | null; ended: boolean }>(
    "SELECT selected_reading_level AS lvl, assessment_taken AS taken, end_time IS NOT NULL AS ended FROM sessions WHERE id = $1", [id])).rows[0];
const start = (pg: PGlite, id: string) => asAnon(pg, () => pg.query("INSERT INTO sessions (id) VALUES ($1)", [id]));
const update = (pg: PGlite, id: string, lvl: number | null, taken: boolean | null = null, end = false) =>
  asAnon(pg, () => pg.query("SELECT update_session($1, $2, $3, $4)", [id, lvl, taken, end]));

Deno.test("the new migration is in the replay (the test reads the real files)", () => {
  assert(files.includes(NEW), `${NEW} missing from supabase/migrations`);
  assert(files.length >= 10, `only ${files.length} migrations found`);
});

Deno.test("normal path: the browser picks a level, takes the assessment, moves levels, ends", async () => {
  const pg = await db();
  const id = crypto.randomUUID();
  await start(pg, id);
  await update(pg, id, 1);
  assertEquals((await row(pg, id)).lvl, 1);
  await update(pg, id, 13);
  assertEquals((await row(pg, id)).lvl, 13);
  await update(pg, id, null, true);
  assertEquals(await row(pg, id), { lvl: 13, taken: true, ended: false });
  await update(pg, id, 12);
  assertEquals(await row(pg, id), { lvl: 12, taken: true, ended: false });
  await update(pg, id, null, null, true);
  assertEquals((await row(pg, id)).ended, true);
});

Deno.test("a reading level the app never offers is refused and nothing changes", async () => {
  const pg = await db();
  const id = crypto.randomUUID();
  await start(pg, id);
  await update(pg, id, 5);
  for (const bad of [0, 14, -1, 99999]) {
    const e = await assertRejects(() => update(pg, id, bad));
    assertEquals((e as { code?: string }).code, "22023", `level ${bad}`);
  }
  assertEquals((await row(pg, id)).lvl, 5);
});

Deno.test("a held id cannot turn the assessment flag back off", async () => {
  const pg = await db();
  const id = crypto.randomUUID();
  await start(pg, id);
  await update(pg, id, null, true);
  await update(pg, id, null, false);
  assertEquals((await row(pg, id)).taken, true);
});

Deno.test("an id from a session started over 24 hours ago is dead; 23 hours still works", async () => {
  const pg = await db();
  const fresh = crypto.randomUUID(), stale = crypto.randomUUID();
  await start(pg, fresh);
  await start(pg, stale);
  await pg.query("UPDATE sessions SET start_time = now() - interval '23 hours' WHERE id = $1", [fresh]);
  await pg.query("UPDATE sessions SET start_time = now() - interval '24 hours 1 minute' WHERE id = $1", [stale]);
  for (const id of [fresh, stale]) { await update(pg, id, 7, true); await update(pg, id, null, null, true); }
  assertEquals(await row(pg, fresh), { lvl: 7, taken: true, ended: true });
  assertEquals(await row(pg, stale), { lvl: null, taken: false, ended: false });
});

Deno.test("an ended session cannot be changed or reopened", async () => {
  const pg = await db();
  const id = crypto.randomUUID();
  await start(pg, id);
  await update(pg, id, 3, null, true);
  await update(pg, id, 9, true);
  assertEquals(await row(pg, id), { lvl: 3, taken: false, ended: true });
});

Deno.test("only anon, authenticated and service_role may call it; anon still cannot UPDATE the table", async () => {
  const pg = await db();
  const can = async (r: string) => (await pg.query<{ ok: boolean }>(
    "SELECT has_function_privilege($1, 'public.update_session(uuid,integer,boolean,boolean)', 'EXECUTE') AS ok", [r])).rows[0].ok;
  for (const r of ["anon", "authenticated", "service_role"]) assert(await can(r), `${r} lost EXECUTE`);
  assertEquals(await can("stranger"), false, "PUBLIC still holds EXECUTE");
  const id = crypto.randomUUID();
  await start(pg, id);
  await asAnon(pg, () => pg.query("UPDATE sessions SET selected_reading_level = 99 WHERE id = $1", [id]));
  assertEquals((await row(pg, id)).lvl, null);
});

Deno.test("the migration changes no existing rows", async () => {
  const at = files.indexOf(NEW);
  const pg = await db(at);
  await pg.exec(`INSERT INTO sessions (id, start_time, end_time, selected_reading_level, assessment_taken) VALUES
    ('00000000-0000-4000-8000-000000000001', now() - interval '3 days', NULL, 40, false),
    ('00000000-0000-4000-8000-000000000002', now(), now(), 2, true),
    ('00000000-0000-4000-8000-000000000003', now(), NULL, NULL, NULL)`);
  const snap = async () => JSON.stringify((await pg.query("SELECT * FROM sessions ORDER BY id")).rows);
  const before = await snap();
  for (const f of files.slice(at)) await pg.exec(Deno.readTextFileSync(new URL(f, DIR)));
  assertEquals(await snap(), before);
});
