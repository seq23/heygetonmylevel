// Submit every sitemap URL to IndexNow ($0, api.indexnow.org fans out to Bing,
// Yandex, Seznam, Naver). The key is public by design: it is the file
// public/<key>.txt served at the site root. Exits non-zero on any non-2xx.
import { readdirSync, readFileSync } from "node:fs";

const HOST = process.argv[2];
if (!HOST) { console.error("usage: indexnow-submit.mjs <host>"); process.exit(2); }
const keyFiles = readdirSync("public").filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (keyFiles.length !== 1) { console.error(`INDEXNOW_KEY_FILE expected exactly 1 public/<key>.txt, found ${keyFiles.length}`); process.exit(1); }
const key = keyFiles[0].slice(0, -4);

const sitemap = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]).filter((u) => new URL(u).host === HOST);
if (urlList.length === 0) { console.error(`INDEXNOW_NO_URLS https://${HOST}/sitemap.xml listed nothing`); process.exit(1); }

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList }),
});
console.log(`indexnow ${HOST} http=${res.status} urls=${urlList.length}`);
if (!res.ok) { console.error(await res.text()); process.exit(1); }
