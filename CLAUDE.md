# CLAUDE.md

## Company brain

Read `~/Brains/spry.md` before any work (business facts, priorities, voice, settled decisions). New business facts go to the brain via Boss OS, not into this repo or memory. Repo how-tos stay in `docs/`.

Follow `AGENTS.md`.

## Cost

**Nothing paid runs in this repo's automation.** Every model call a script or workflow here makes
goes through `scripts/llm/free_router.mjs` and `config/llm_routing.json` (`max_cost_usd: 0`, every
id `:free`, no paid fallback); when no free model answers, the run takes a named stop instead of a
paid model. The app's own inference is the one separate lane, recorded in
`config/product_inference.json`. The rule and its enforcement: `docs/cost/zero-paid-llm.md`.
