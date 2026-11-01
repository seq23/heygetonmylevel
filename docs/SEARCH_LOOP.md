# Search loop on learn.heygetonmylevel.com

heygetonmylevel is parked as a business but runs the shared search engine (`seq23/search-loop@v1`, spry brain, 1 Nov 2026).

- **Where pages live:** `questions/<slug>/index.html` (engine output) + `learn-static/` (CSS, OG image, robots, `_redirects`, IndexNow key, Search Console token). `scripts/learn-build.mjs` builds them into `learn-dist/` with the hub list and `sitemap.xml`.
- **Deploy:** Cloudflare Pages project `heygetonmylevel-learn` (git-connected, builds on pushes touching `questions/`, `learn-static/`, the build script). Never Lovable Publish; the Lovable app is untouched.
- **Host:** `learn.heygetonmylevel.com` needs a DNS CNAME `learn` -> `heygetonmylevel-learn.pages.dev` at Squarespace Domains (the registrar/DNS host; no API). Until it answers, `.github/scripts/search-loop-commit.sh` keeps main in proof mode (`NAMED STOP [LEARN_HOST_NOT_LIVE]`): pages are built and gated, only the find ledger is committed.
- **Once live:** the next daily run publishes, the `host` job verifies and adds the Search Console property with the service account (`scripts/learn-gsc-property.mjs`), and the engine submits new URLs to IndexNow.
- **One action:** "Start a free week of Time-2-Read" -> https://time-2-read.com/pricing. Shares its audience with time-2-read.com (dailystory's ledger), so the two never target the same search.
- **Throttle:** `gh variable set SEARCH_LOOP_MODE --body slow -R seq23/search-loop` (normal | slow | off).
