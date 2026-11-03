# Zero paid LLM calls (owner policy, 11 October 2026)

Owner policy, verbatim: **"nothing should be paid … cut the probes and make them free."**

**Nothing paid runs in this repository's automation.** Every script and workflow here is
deterministic or goes through the free router. There is no paid fallback anywhere in it.

## The two lanes, and which rule governs which

| Lane | What it is | Rule |
|---|---|---|
| **Automation** — `scripts/`, `.github/workflows/` | The Search Console collectors, the prerender and SEO checks, the IndexNow submitter, the entity backlink watch, the post-deploy live check, the weekly outcome report | `config/llm_routing.json`: `max_cost_usd: 0`, `paid_fallback: false`, every model id `:free`. The only door is `scripts/llm/free_router.mjs`. |
| **Product inference** — `supabase/functions/generate-reading` | The app generating a passage, questions, an assessment or tutor reply for a reader who asked for one | `config/product_inference.json`. Funded by the Lovable project's own credit, gated by `guardPaid()`. Out of scope for `max_cost_usd`, never an automation fallback. |

As of 3 November 2026 the automation lane calls **no model at all**
(`automation_lane.state: no_model_calls_today`). The router exists so that the first script that
needs one has a $0 door to walk through instead of naming its own model — which is how a paid
call gets in: not by decision, but by a script that was allowed to choose.

## How it is enforced

- **`config/llm_routing.json`** — the only models any lane may call: an ordered list of `:free`
  models priced $0/$0 with ≥32k context, a dated `pricing_snapshot`, `max_cost_usd: 0`,
  `paid_fallback: false`. Roster refreshed 3 November 2026 against the live OpenRouter list
  (no key needed); `nvidia/nemotron-3-super-120b-a12b:free` was dropped because the list no
  longer carries it.
- **`scripts/llm/free_router.mjs`** — the one HTTP client. It refuses to load unless
  `max_cost_usd` is exactly 0 and every listed model is priced $0/$0, tries the models in order,
  and when none answers returns a **named stop** with nothing generated rather than reaching for a
  model that costs money. A non-zero cost reported by the provider throws `PaidCostError` and
  fails the run — a policy breach must be loud, not logged.
  - `node scripts/llm/free_router.mjs --check` re-reads live pricing for every configured model.
  - `node scripts/llm/free_router.mjs --check --ping` also makes one free model answer.
- **`scripts/check-llm-routing.mjs`** — the test that reads this doc. It runs in `check.yml` and
  fails the build when: the routing config is not a $0-only policy; this file is missing or stops
  saying *nothing paid*; `CLAUDE.md` stops saying *nothing paid*; or a provider endpoint is called
  from code that is in neither the free router nor `config/product_inference.json`. It exits 1
  having scanned zero files, so it cannot pass while reading nothing.

## The open question on the product lane (3 November 2026)

The Lovable AI gateway serves Google Gemini models. The Gemini API Additional Terms
(`ai.google.dev/gemini-api/terms`) say the API is not for services directed to, or likely to be
accessed by, individuals under 18 — and dailystory removed that gateway from Time-2-Read's
children's text chain on 26 October 2026 for that clause. This app is a reading product for ages
5–85+, so the clause reads across. It is **recorded, not changed**:
`config/product_inference.json` carries it as `open_question_2026_11_03`, and it was raised with
the owner on 3 November 2026. Which provider a children's product may call is her ruling and the
risk brain's rule, not a repair pass's call.
