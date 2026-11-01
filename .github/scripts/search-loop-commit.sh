#!/usr/bin/env bash
# Commit helper for the search loop (commit_command). Pages publish only when
# learn.heygetonmylevel.com is live on Cloudflare Pages; until then the run is a proof
# run on main: pages are built and gated but not committed, and only the find ledger
# (targets + discovery receipt) is kept so time-2-read.com's loop can see our claims.
set -euo pipefail
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
branch="${GITHUB_REF_NAME:-main}"
summary="${GITHUB_STEP_SUMMARY:-/dev/stderr}"
if [ "$(bash .github/scripts/learn-host-live.sh)" = "true" ]; then
  git add -A questions data/search-loop learn-static
  msg="${COMMIT_MESSAGE:-search loop: daily pages, checks and ledger}"
else
  line="NAMED STOP [LEARN_HOST_NOT_LIVE] learn.heygetonmylevel.com does not serve the static section yet (DNS CNAME learn -> heygetonmylevel-learn.pages.dev missing at the registrar); pages were built and gated but not published (proof mode). The find ledger is kept."
  echo "$line" >&2; echo "$line" >> "$summary"
  for f in data/search-loop/targets.json data/search-loop/discovery-receipt.json; do [ -f "$f" ] && git add "$f"; done
  msg="search loop (proof mode): find ledger only"
fi
if git diff --cached --quiet; then echo "search-loop: nothing to commit"; exit 0; fi
git commit -q -m "$msg"
for i in 1 2 3 4 5; do
  git push origin "HEAD:${branch}" && exit 0
  git stash -u -q || true
  git pull --rebase origin "$branch" || { echo "NAMED STOP [PUSH_CONFLICT] rebase failed; the next run redoes today's work" >&2; exit 9; }
done
echo "NAMED STOP [PUSH_FAILED] five push attempts failed" >&2; exit 9
