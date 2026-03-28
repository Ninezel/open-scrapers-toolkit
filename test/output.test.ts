import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import { saveResultFiles } from "../src/core/output.js";
import type { ScrapeResult } from "../src/core/types.js";

const sampleResult: ScrapeResult = {
  scraperId: "sample-scraper",
  scraperName: "Sample Scraper",
  category: "reports",
  source: "Sample Source",
  fetchedAt: "2026-03-28T10:00:00.000Z",
  records: [
    {
      id: "record-1",
      source: "Sample Source",
      title: "Sample row",
      url: "https://example.com/item",
      summary: "Example summary",
      publishedAt: "2026-03-27T09:00:00.000Z",
      authors: ["Alex Example"],
      tags: ["demo", "sample"],
      location: "London",
      metadata: {
        score: 42,
      },
    },
  ],
};

test("saveResultFiles writes json, csv, and ndjson exports", async () => {
  const directory = await mkdtemp(join(tmpdir(), "open-scrapers-output-"));
  const saved = await saveResultFiles(sampleResult, join(directory, "sample.json"), "all");

  assert.equal(saved.length, 3);

  const csv = await readFile(join(directory, "sample.csv"), "utf8");
  const json = await readFile(join(directory, "sample.json"), "utf8");
  const ndjson = await readFile(join(directory, "sample.ndjson"), "utf8");

  assert.match(csv, /scraperId,scraperName,category/);
  assert.match(csv, /Sample Scraper/);
  assert.match(json, /"scraperId": "sample-scraper"/);
  assert.match(ndjson, /"record-1"/);
});
