import assert from "node:assert/strict";
import { test } from "node:test";

import { DEFAULT_HTTP_TIMEOUT_MS, resolveHttpTimeoutMs } from "../src/core/http.js";

test("resolveHttpTimeoutMs falls back for invalid values", () => {
  assert.equal(resolveHttpTimeoutMs(undefined), DEFAULT_HTTP_TIMEOUT_MS);
  assert.equal(resolveHttpTimeoutMs(""), DEFAULT_HTTP_TIMEOUT_MS);
  assert.equal(resolveHttpTimeoutMs("-5"), DEFAULT_HTTP_TIMEOUT_MS);
  assert.equal(resolveHttpTimeoutMs("abc"), DEFAULT_HTTP_TIMEOUT_MS);
});

test("resolveHttpTimeoutMs accepts positive integers", () => {
  assert.equal(resolveHttpTimeoutMs("45000"), 45_000);
});
