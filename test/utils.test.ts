import assert from "node:assert/strict";
import { test } from "node:test";

import { cleanText, parseKeyValuePairs } from "../src/core/utils.js";

test("parseKeyValuePairs parses key-value input", () => {
  assert.deepEqual(parseKeyValuePairs(["query=climate", "country=GBR"]), {
    query: "climate",
    country: "GBR",
  });
});

test("parseKeyValuePairs rejects malformed values", () => {
  assert.throws(() => parseKeyValuePairs(["missing-separator"]), /Expected key=value/);
  assert.throws(() => parseKeyValuePairs(["=value"]), /Key cannot be empty/);
});

test("cleanText strips markup and decodes common entities", () => {
  assert.equal(
    cleanText("<p>Hello&nbsp;&amp;&nbsp;goodbye</p>"),
    "Hello & goodbye",
  );
});
