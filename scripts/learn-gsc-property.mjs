// Makes sure Search Console has the learn.heygetonmylevel.com property, owned by the
// portfolio service account (GSC_SERVICE_ACCOUNT_JSON), so the search loop can read clicks,
// positions and index status. Idempotent; run only once the host is live (the HTML token
// file google706548b58060eed8.html ships in learn-static/ and proves ownership).
//   node scripts/learn-gsc-property.mjs
// Exit 0: property present (already, or just verified+added). Exit 1: a named problem.
import { createSign } from "node:crypto";

const SITE = "https://learn.heygetonmylevel.com/";
const sa = JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON || "{}");
if (!sa.client_email) { console.log("NAMED STOP [SECRET_MISSING_GSC_SERVICE_ACCOUNT_JSON] property not checked"); process.exit(0); }

async function token(scope) {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ iss: sa.client_email, scope, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 600 })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }) }).then((x) => x.json());
  if (!r.access_token) throw new Error(`token: ${r.error}`);
  return r.access_token;
}

const t = await token("https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/siteverification");
const auth = { authorization: `Bearer ${t}` };
const sites = await fetch("https://www.googleapis.com/webmasters/v3/sites", { headers: auth }).then((r) => r.json());
if ((sites.siteEntry || []).some((s) => s.siteUrl === SITE && s.permissionLevel !== "siteUnverifiedUser")) { console.log(`gsc property present: ${SITE}`); process.exit(0); }
const v = await fetch("https://www.googleapis.com/siteVerification/v1/webResource?verificationMethod=FILE", { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ site: { type: "SITE", identifier: SITE } }) });
if (!v.ok) { console.log(`NAMED STOP [GSC_VERIFY_FAILED] ${SITE} http ${v.status}: ${(await v.text()).slice(0, 200)}`); process.exit(1); }
const a = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}`, { method: "PUT", headers: auth });
if (!a.ok) { console.log(`NAMED STOP [GSC_ADD_FAILED] ${SITE} http ${a.status}`); process.exit(1); }
console.log(`gsc property verified and added: ${SITE}`);
