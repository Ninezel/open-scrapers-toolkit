import assert from "node:assert/strict";
import { test } from "node:test";

import {
  cleanText,
  parseBoolean,
  parseKeyValuePairs,
  parseLineList,
  truncateText,
  uniqueStrings,
} from "../src/core/utils.js";

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

test("parseBoolean handles common truthy and falsy strings", () => {
  assert.equal(parseBoolean("true"), true);
  assert.equal(parseBoolean("no", true), false);
  assert.equal(parseBoolean("unknown", true), true);
});

test("truncateText shortens long strings cleanly", () => {
  assert.equal(truncateText("short text", 40), "short text");
  assert.match(truncateText("This sentence should be shortened.", 12) ?? "", /…$/);
});

test("parseLineList reads non-empty lines and skips comments", () => {
  assert.deepEqual(parseLineList("https://example.com\n# comment\n\nhttps://openai.com"), [
    "https://example.com",
    "https://openai.com",
  ]);
});

test("uniqueStrings de-duplicates and trims entries", () => {
  assert.deepEqual(uniqueStrings([" climate ", "climate", undefined, "reports"]), [
    "climate",
    "reports",
  ]);
});
