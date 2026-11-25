// Guards for the CodeQL fixes of 25 Nov 2026 (alerts #1-#6). Each test fails if its fix is undone.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { stripTags } from "./learn-build.mjs";
import { ownerStep } from "./search_intelligence/lib/gsc_client.mjs";

test("stripTags leaves no tag behind, even nested or split ones", () => {
  for (const nasty of ["<<b>b>Read <i>more</i>", "<scr<script>ipt>alert(1)</script>", "<img src=x onerror=1"]) {
    assert.ok(!/[<>]/.test(stripTags(nasty)), `${nasty} -> ${stripTags(nasty)}`);
  }
  assert.equal(stripTags("Read <i>more</i>"), "Read more");
  assert.equal(stripTags("a < b"), "a  b");
  assert.equal(stripTags("plain"), "plain");
});

test("the Search Console owner step never prints the service-account email (public logs)", () => {
  const msg = ownerStep({ email: "robot@example-project.iam.gserviceaccount.com" });
  assert.ok(!msg.includes("gserviceaccount"), msg);
  assert.match(msg, /GSC_SERVICE_ACCOUNT_JSON/);
});

test("every workflow declares a least-privilege permissions block", () => {
  const dir = ".github/workflows";
  const files = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));
  assert.ok(files.length > 0, "examined 0 workflows");
  const missing = files.filter((f) => !/^permissions:/m.test(readFileSync(join(dir, f), "utf8")) &&
    !/^\s{4}permissions:/m.test(readFileSync(join(dir, f), "utf8")));
  assert.deepEqual(missing, []);
});
