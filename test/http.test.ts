import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_HTTP_RETRY_COUNT,
  DEFAULT_HTTP_RETRY_DELAY_MS,
  DEFAULT_HTTP_TIMEOUT_MS,
  resolveHttpRetryCount,
  resolveHttpRetryDelayMs,
  resolveHttpTimeoutMs,
} from "../src/core/http.js";

test("resolveHttpTimeoutMs falls back for invalid values", () => {
  assert.equal(resolveHttpTimeoutMs(undefined), DEFAULT_HTTP_TIMEOUT_MS);
  assert.equal(resolveHttpTimeoutMs(""), DEFAULT_HTTP_TIMEOUT_MS);
  assert.equal(resolveHttpTimeoutMs("-5"), DEFAULT_HTTP_TIMEOUT_MS);
  assert.equal(resolveHttpTimeoutMs("abc"), DEFAULT_HTTP_TIMEOUT_MS);
});

test("resolveHttpTimeoutMs accepts positive integers", () => {
  assert.equal(resolveHttpTimeoutMs("45000"), 45_000);
});

test("resolveHttpRetryCount falls back for invalid values", () => {
  assert.equal(resolveHttpRetryCount(undefined), DEFAULT_HTTP_RETRY_COUNT);
  assert.equal(resolveHttpRetryCount("-1"), DEFAULT_HTTP_RETRY_COUNT);
  assert.equal(resolveHttpRetryCount("abc"), DEFAULT_HTTP_RETRY_COUNT);
});

test("resolveHttpRetryDelayMs falls back for invalid values", () => {
  assert.equal(resolveHttpRetryDelayMs(undefined), DEFAULT_HTTP_RETRY_DELAY_MS);
  assert.equal(resolveHttpRetryDelayMs("0"), DEFAULT_HTTP_RETRY_DELAY_MS);
  assert.equal(resolveHttpRetryDelayMs("abc"), DEFAULT_HTTP_RETRY_DELAY_MS);
});
