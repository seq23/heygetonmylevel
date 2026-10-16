// Guard: the built site ships what crawlers and indexers need without JS.
// - exactly one IndexNow key file at the root, body = its own key
// - the Search Console file token for the portfolio service account
// - Organization + WebSite JSON-LD in the prerendered homepage
// Usage: node scripts/check-seo-surfaces.mjs [dir]   (default: dist)
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = process.argv[2] ?? "dist";
const fail = (m) => { console.error(`SEO_SURFACE_MISSING ${m}`); process.exitCode = 1; };

const keys = readdirSync(DIR).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (keys.length !== 1) fail(`expected 1 IndexNow key file in ${DIR}, found ${keys.length}`);
else if (readFileSync(join(DIR, keys[0]), "utf8").trim() !== keys[0].slice(0, -4)) fail(`${keys[0]} body is not its key`);

const tok = "google706548b58060eed8.html";
try {
  if (readFileSync(join(DIR, tok), "utf8").trim() !== `google-site-verification: ${tok}`) fail(`${tok} body wrong`);
} catch { fail(`${tok} absent`); }

const html = readFileSync(join(DIR, "index.html"), "utf8");
const types = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  .flatMap((m) => { const j = JSON.parse(m[1]); return j["@graph"] ?? [j]; })
  .map((n) => n["@type"]);
for (const t of ["Organization", "WebSite"]) if (!types.includes(t)) fail(`homepage JSON-LD has no ${t} (found: ${types.join(",") || "none"})`);
if (!process.exitCode) console.log(`seo surfaces ok: key ${keys[0]}, ${tok}, JSON-LD ${types.join(",")}`);
