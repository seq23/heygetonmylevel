#!/usr/bin/env node
/**
 * Search Readiness k1/k3/k4: entity.json is the one statement of who this site is, and the
 * Organization node every crawler reads must say exactly that.
 *
 * index.html carries the published Organization and WebSite nodes (the static head of every
 * prerendered route). Nothing stops the two files drifting apart on their own, so this check
 * fails the build when they do: name, url, logo url, sameAs and parentOrganization @id must
 * match entity.json field for field.
 *
 *   node scripts/check-entity-graph.mjs            # index.html against entity.json
 *   node scripts/check-entity-graph.mjs dist       # ...and every prerendered page in dist
 *   node scripts/check-entity-graph.mjs --self-test # the check fails on a drifted node
 *
 * Rule 0: zero Organization nodes examined exits 1. A spry-labs site with no parentOrganization,
 * an empty sameAs, or a sameAs on our own host each fail here rather than next Monday's audit.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENTITY_FILE = path.join(ROOT, "entity.json");
const SPRY_LABS_HOME = "billionairehighperformancecoach.com/spry-labs";

const bare = (h) => String(h || "").replace(/^www\./, "");
const hostOf = (u) => { try { return bare(new URL(u).hostname); } catch { return ""; } };
const logoUrl = (v) => (typeof v === "string" ? v : v?.url ?? "");

export function nodesIn(html) {
  const out = [];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let json; try { json = JSON.parse(m[1]); } catch { out.push({ __unparsable: m[1].slice(0, 80) }); continue; }
    for (const n of Array.isArray(json) ? json : json["@graph"] ?? [json]) out.push(n);
  }
  return out;
}

const typesOf = (n) => [n?.["@type"]].flat().filter(Boolean).map(String);

/** Every way the published Organization node disagrees with entity.json. Empty means it agrees. */
export function drift(entity, node, where) {
  const e = [];
  const say = (m) => e.push(`${where}: ${m}`);
  if (node["@id"] !== entity["@id"]) say(`@id ${JSON.stringify(node["@id"])} != entity.json ${JSON.stringify(entity["@id"])}`);
  if (node.name !== entity.name) say(`name ${JSON.stringify(node.name)} != ${JSON.stringify(entity.name)}`);
  if (bare(hostOf(node.url)) !== bare(hostOf(entity.url))) say(`url ${JSON.stringify(node.url)} is not on ${hostOf(entity.url)}`);
  if (logoUrl(node.logo) !== logoUrl(entity.logo)) say(`logo ${JSON.stringify(logoUrl(node.logo))} != ${JSON.stringify(logoUrl(entity.logo))}`);
  const want = [...(entity.sameAs ?? [])].sort();
  const got = [...(node.sameAs ?? [])].sort();
  if (JSON.stringify(want) !== JSON.stringify(got)) say(`sameAs ${JSON.stringify(got)} != entity.json ${JSON.stringify(want)}`);
  if (entity.entity_parent === "spry-labs") {
    const id = node.parentOrganization?.["@id"] ?? "";
    if (!id.includes(SPRY_LABS_HOME)) say(`parentOrganization @id ${JSON.stringify(id)} does not point at Spry Labs (${SPRY_LABS_HOME})`);
  }
  return e;
}

/** Every way entity.json itself is not a usable identity. */
export function entityErrors(entity) {
  const e = [];
  if (!entity.name) e.push("entity.json has no name");
  if (!entity["@id"]) e.push("entity.json has no @id");
  if (!logoUrl(entity.logo)) e.push("entity.json has no logo url");
  const own = new Set([...(entity.own_hosts ?? []), hostOf(entity.url)].map(bare).filter(Boolean));
  const sameAs = entity.sameAs;
  if (!Array.isArray(sameAs) || !sameAs.length) e.push("entity.json has no sameAs profile (k3 needs one external profile that resolves)");
  else {
    const external = sameAs.filter((u) => !own.has(hostOf(u)));
    for (const u of sameAs) if (own.has(hostOf(u))) e.push(`sameAs ${u} is on this site's own host; sameAs is for third-party profiles only`);
    if (!external.length) e.push("every sameAs URL is on this site's own host");
  }
  if (!Array.isArray(entity.profiles_pending)) e.push("entity.json has no profiles_pending list");
  if (entity.entity_parent === "spry-labs" && !String(entity.parentOrganization?.["@id"] ?? "").includes(SPRY_LABS_HOME)) {
    e.push(`entity.json entity_parent is spry-labs but parentOrganization does not point at ${SPRY_LABS_HOME}`);
  }
  return e;
}

/**
 * The prerendered routes only. Every route the prerenderer writes is an `index.html`; the other
 * .html files in dist are host verification stubs (Search Console) that carry no markup and are
 * not pages a crawler indexes, so holding them to the entity graph would fail on a file that is
 * doing its job.
 */
function pagesUnder(dir) {
  const out = [];
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) out.push(...pagesUnder(p));
    else if (d.name === "index.html") out.push(p);
  }
  return out;
}

function selfTest() {
  const entity = JSON.parse(fs.readFileSync(ENTITY_FILE, "utf8"));
  const good = { "@id": entity["@id"], name: entity.name, url: entity.url, logo: entity.logo, sameAs: entity.sameAs, parentOrganization: entity.parentOrganization };
  const must = [
    ["a matching node drifts in nothing", good, 0],
    ["a renamed node is caught", { ...good, name: "Something Else" }, 1],
    ["a dropped sameAs is caught", { ...good, sameAs: [] }, 1],
    ["a dropped parentOrganization is caught", { ...good, parentOrganization: undefined }, 1],
    ["a different logo is caught", { ...good, logo: "https://heygetonmylevel.com/other.png" }, 1],
  ];
  let bad = 0;
  for (const [what, node, want] of must) {
    const got = drift(entity, node, "self-test").length;
    const ok = want === 0 ? got === 0 : got >= 1;
    console.log(`${ok ? "ok  " : "FAIL"} ${what} (${got} drift${got === 1 ? "" : "s"})`);
    if (!ok) bad += 1;
  }
  const empty = entityErrors({ ...entity, sameAs: [] });
  const onOwn = entityErrors({ ...entity, sameAs: ["https://heygetonmylevel.com/about"] });
  for (const [what, errs] of [["an empty sameAs is refused", empty], ["a sameAs on our own host is refused", onOwn]]) {
    const ok = errs.length >= 1;
    console.log(`${ok ? "ok  " : "FAIL"} ${what}`);
    if (!ok) bad += 1;
  }
  if (bad) { console.error(`check-entity-graph --self-test: ${bad} case(s) failed`); process.exit(1); }
  console.log("check-entity-graph --self-test: every case behaved");
}

function main() {
  if (process.argv.includes("--self-test")) return selfTest();
  const dist = process.argv[2] && !process.argv[2].startsWith("--") ? path.resolve(process.argv[2]) : null;
  const entity = JSON.parse(fs.readFileSync(ENTITY_FILE, "utf8"));
  const errors = entityErrors(entity);
  const files = [path.join(ROOT, "index.html"), ...(dist && fs.existsSync(dist) ? pagesUnder(dist) : [])];
  let examined = 0;
  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const nodes = nodesIn(fs.readFileSync(file, "utf8"));
    for (const n of nodes) if (n.__unparsable) errors.push(`${rel}: a JSON-LD block does not parse (${n.__unparsable}…)`);
    const orgs = nodes.filter((n) => typesOf(n).some((t) => /^(Organization|LocalBusiness|EducationalOrganization)$/.test(t)));
    if (!orgs.length) { errors.push(`${rel}: no Organization node in the JSON-LD`); continue; }
    for (const org of orgs) { examined += 1; errors.push(...drift(entity, org, rel)); }
  }
  if (!examined) { console.error("check-entity-graph examined zero Organization nodes (nothing was read)"); process.exit(1); }
  if (errors.length) {
    for (const e of errors) console.error(`FAIL ${e}`);
    console.error(`check-entity-graph: ${errors.length} problem(s) across ${examined} Organization node(s)`);
    process.exit(1);
  }
  console.log(`check-entity-graph OK: ${examined} Organization node(s) in ${files.length} file(s) match entity.json (${entity.sameAs.length} sameAs, parent ${entity.parentOrganization?.name ?? "none"})`);
}

main();
