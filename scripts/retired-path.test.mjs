import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';

// Use the same engine revision as the reusable workflow, not a local imitation.
const engine = process.env.SEARCH_LOOP_ENGINE;
if (!engine) throw new Error('SEARCH_LOOP_ENGINE must point to the workflow engine checkout');
const { isProtected } = await import(pathToFileURL(resolve(engine, 'src/config.mjs')));
const { pickRelated } = await import(pathToFileURL(resolve(engine, 'src/build.mjs')));
const cfg = JSON.parse(readFileSync('search-loop.config.json', 'utf8'));
const inventory = JSON.parse(readFileSync('data/page-quality/kept.json', 'utf8'));

test('engine refuses retired output paths and excludes them from editable related pages', () => {
  const retired = Object.keys(inventory.redirects);
  assert.ok(retired.length > 0);
  for (const slug of retired) {
    const rel = `questions/${slug}/index.html`;
    assert.equal(isProtected(cfg, rel), true, `BUILD must refuse ${rel}`);
    const candidate = { rel, route: `/questions/${slug}/`, title: slug, protected: isProtected(cfg, rel) };
    assert.deepEqual(pickRelated(cfg, [candidate], slug, { editable: true }), [], `related-link edits must refuse ${rel}`);
  }
  assert.equal(isProtected(cfg, 'questions/a-new-distinct-topic/index.html'), false);
});
