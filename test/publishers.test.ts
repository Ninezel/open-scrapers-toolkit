import assert from "node:assert/strict";
import { test } from "node:test";

import { buildHealthAlertResult } from "../src/publishers.js";
import type { ScrapeResult } from "../src/core/types.js";

const sampleHealthResult: ScrapeResult = {
  scraperId: "source-health-report",
  scraperName: "Source Health Report",
  category: "reports",
  source: "open-scrapers-toolkit",
  fetchedAt: "2026-03-28T10:44:09.000Z",
  records: [
    {
      id: "ok-1",
      source: "Example Source",
      title: "Example ok record",
      summary: "Looks good.",
      metadata: {
        scraperId: "example-ok",
        status: "ok",
      },
    },
    {
      id: "error-1",
      source: "Example Source",
      title: "Example error record",
      summary: "Something failed.",
      metadata: {
        scraperId: "example-error",
        status: "error",
      },
    },
    {
      id: "skipped-1",
      source: "Example Source",
      title: "Example skipped record",
      summary: "Skipped for missing params.",
      metadata: {
        scraperId: "example-skipped",
        status: "skipped",
      },
    },
  ],
};

test("buildHealthAlertResult filters health records by status", () => {
  const alerts = buildHealthAlertResult(sampleHealthResult, "error,skipped");

  assert.equal(alerts.scraperId, "source-health-alerts");
  assert.equal(alerts.records.length, 2);
  assert.deepEqual(
    alerts.records.map((record) => record.metadata?.status),
    ["error", "skipped"],
  );
});
