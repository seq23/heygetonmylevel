// Guard: the built site ships what crawlers and indexers need without JS.
// - exactly one IndexNow key file at the root, body = its own key
// - the Search Console file token for the portfolio service account
// - the icon and manifest files a browser and the Search Readiness check ask for
// - per prerendered route: a 30-65 character unique title, exactly one 120-160
//   character meta description, the full Open Graph / Twitter set, and the JSON-LD
//   (Organization with sameAs, WebPage, BreadcrumbList, WebSite, a priced Offer)
//   that Search Readiness items b1, b2, b6, c1, c2 and c3 require.
//
// These were all written by hand before 3 Nov 2026 and five band pages had drifted to
// 67-80 character titles and 164-183 character descriptions. The generators now
// assemble them; this fails the build if any route leaves the band again.
//
// Usage: node scripts/check-seo-surfaces.mjs [dir]   (default: dist)
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIR = process.argv[2] ?? "dist";
const fail = (m) => { console.error(`SEO_SURFACE_MISSING ${m}`); process.exitCode = 1; };

const SITE = "https://heygetonmylevel.com";
const TITLE_MIN = 30, TITLE_MAX = 65;
const DESC_MIN = 120, DESC_MAX = 160;

const keys = readdirSync(DIR).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (keys.length !== 1) fail(`expected 1 IndexNow key file in ${DIR}, found ${keys.length}`);
else if (readFileSync(join(DIR, keys[0]), "utf8").trim() !== keys[0].slice(0, -4)) fail(`${keys[0]} body is not its key`);

const tok = "google706548b58060eed8.html";
try {
  if (readFileSync(join(DIR, tok), "utf8").trim() !== `google-site-verification: ${tok}`) fail(`${tok} body wrong`);
} catch { fail(`${tok} absent`); }

// Static files the Search Readiness site-basics check fetches directly. site.webmanifest
// is written by the prerender plugin from public/manifest.json, so this also proves that
// step ran and produced parseable JSON rather than an empty or HTML file.
for (const f of ["favicon.ico", "apple-touch-icon.png", "og-image.jpg", "manifest.json", "site.webmanifest"]) {
  if (!existsSync(join(DIR, f))) fail(`${f} is not in ${DIR}`);
}
for (const f of ["manifest.json", "site.webmanifest"]) {
  if (!existsSync(join(DIR, f))) continue;
  try {
    const m = JSON.parse(readFileSync(join(DIR, f), "utf8"));
    if (!m.icons?.length) fail(`${f} lists no icons`);
    for (const i of m.icons ?? []) if (!existsSync(join(DIR, i.src.replace(/^\//, "")))) fail(`${f} points at ${i.src}, which is not in ${DIR}`);
  } catch (e) { fail(`${f} is not valid JSON: ${e.message}`); }
}

/** Every route the build prerendered, read from the sitemap it generated. */
const sitemap = existsSync(join(DIR, "sitemap.xml")) ? readFileSync(join(DIR, "sitemap.xml"), "utf8") : "";
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, "") || "/");
// Rule 0: a sitemap that lost its routes must not let this script pass having checked nothing.
if (routes.length < 2) fail(`expected the prerendered routes in ${DIR}/sitemap.xml, found ${routes.length}`);

const fileFor = (route) => (route === "/" ? join(DIR, "index.html") : join(DIR, route.replace(/^\//, ""), "index.html"));
const meta = (html, attr, name) => [...html.matchAll(new RegExp(`<meta[^>]*${attr}="${name}"[^>]*>`, "g"))]
  .map((m) => (m[0].match(/content="([^"]*)"/) ?? [, ""])[1]);
/** Every node in the page's JSON-LD, including nested ones. */
const nodesOf = (html) => {
  const out = [];
  const walk = (v) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (v && typeof v === "object") { if (v["@type"]) out.push(v); Object.values(v).forEach(walk); }
  };
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { walk(JSON.parse(m[1])); } catch (e) { fail(`unparseable JSON-LD: ${e.message}`); }
  }
  return out;
};
const isType = (n, re) => [].concat(n["@type"] ?? []).some((t) => re.test(t));

const titles = new Map();
for (const route of routes) {
  const path = fileFor(route);
  if (!existsSync(path)) { fail(`${route} is in the sitemap but ${path} was not prerendered`); continue; }
  const html = readFileSync(path, "utf8");
  const where = `${route}:`;

  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/) ?? [, ""])[1].trim();
  if (title.length < TITLE_MIN || title.length > TITLE_MAX) fail(`${where} title is ${title.length} characters, not ${TITLE_MIN}-${TITLE_MAX} ("${title}")`);
  if (titles.has(title)) fail(`${where} shares its title with ${titles.get(title)} ("${title}")`);
  else titles.set(title, route);

  const desc = meta(html, "name", "description");
  if (desc.length !== 1) fail(`${where} has ${desc.length} meta descriptions, not 1`);
  else if (desc[0].length < DESC_MIN || desc[0].length > DESC_MAX) fail(`${where} description is ${desc[0].length} characters, not ${DESC_MIN}-${DESC_MAX}`);

  for (const p of ["og:title", "og:description", "og:type", "og:url", "og:site_name", "og:image", "og:image:width", "og:image:height"]) {
    const v = meta(html, "property", p);
    if (v.length !== 1 || !v[0]) fail(`${where} has ${v.length} ${p} tags with a value, not 1`);
  }
  if (!meta(html, "name", "twitter:card").includes("summary_large_image")) fail(`${where} twitter:card is not summary_large_image`);
  const img = meta(html, "property", "og:image")[0] ?? "";
  if (!img.startsWith(`${SITE}/`)) fail(`${where} og:image ${img} is not on the site's own host`);
  else if (!existsSync(join(DIR, img.slice(SITE.length + 1)))) fail(`${where} og:image ${img} is not a file in ${DIR}`);

  const nodes = nodesOf(html);
  const org = nodes.find((n) => isType(n, /Organization|LocalBusiness/));
  if (!org) fail(`${where} JSON-LD has no Organization`);
  else { const miss = ["name", "url", "logo", "sameAs"].filter((k) => !org[k] || (Array.isArray(org[k]) && !org[k].length)); if (miss.length) fail(`${where} Organization lacks ${miss.join(", ")}`); }

  if (!nodes.some((n) => isType(n, /WebPage$|^AboutPage$|^ContactPage$|^FAQPage$|^CollectionPage$|^ItemPage$/))) fail(`${where} JSON-LD has no WebPage`);
  if (route !== "/" && !nodes.some((n) => isType(n, /^BreadcrumbList$/))) fail(`${where} JSON-LD has no BreadcrumbList`);
  if (route === "/") {
    if (!nodes.some((n) => isType(n, /^WebSite$/))) fail(`${where} JSON-LD has no WebSite`);
    const priced = nodes.find((n) => isType(n, /^(SoftwareApplication|WebApplication|MobileApplication|Product|Service|Course|Book)$/)
      && [].concat(n.offers ?? []).some((o) => o && o.price !== undefined));
    if (!priced) fail(`${where} JSON-LD has no SoftwareApplication/Product/Service carrying an Offer with a price`);
  }
}

if (!process.exitCode) console.log(`seo surfaces ok: key ${keys[0]}, ${tok}, ${routes.length} routes with title, description, social tags and schema in band`);

// Exact route equality replaces the historical fixed ten-URL minimum, with a zero guard.
const inventory = JSON.parse(readFileSync(join(DIR, "prerender-routes.json"), "utf8"));
const actualLocations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]).sort();
const expectedLocations = inventory.map(r => `${SITE}${r}`).sort();
if (!inventory.length || new Set(inventory).size !== inventory.length || JSON.stringify(actualLocations) !== JSON.stringify(expectedLocations)) fail("sitemap must match nonempty prerender inventory exactly");
