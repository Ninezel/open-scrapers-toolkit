import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createScraperContext,
  getScraperCatalog,
  runScraper,
  runScraperById,
} from "../src/index.js";
import type {
  ScrapeResult,
  ScraperContext,
  ScraperDefinition,
} from "../src/core/types.js";

const fakeScraper: ScraperDefinition = {
  id: "fake-library-scraper",
  name: "Fake Library Scraper",
  category: "reports",
  description: "Fake scraper used to validate the library helpers.",
  homepage: "https://example.com/fake",
  sourceName: "Example Source",
  defaults: {
    region: "global",
  },
  params: [
    {
      key: "region",
      description: "Region filter.",
      example: "global",
    },
  ],
  run: async (context: ScraperContext): Promise<ScrapeResult> => ({
    scraperId: "fake-library-scraper",
    scraperName: "Fake Library Scraper",
    category: "reports",
    source: context.params.region,
    fetchedAt: context.now.toISOString(),
    records: [
      {
        id: "fake-1",
        source: "Example Source",
        title: "Fake result",
      },
    ],
  }),
};

test("createScraperContext merges defaults, params, and contact email into the user agent", () => {
  const context = createScraperContext(fakeScraper, {
    contactEmail: "hello@example.com",
    limit: 3,
    now: new Date("2026-03-28T11:45:00.000Z"),
    outputDir: "custom-output",
    params: {
      region: "europe",
      format: "summary",
    },
  });

  assert.equal(context.limit, 3);
  assert.equal(context.outputDir, "custom-output");
  assert.equal(context.params.region, "europe");
  assert.equal(context.params.format, "summary");
  assert.match(context.userAgent, /hello@example.com/);
});

test("runScraper executes a scraper with the generated library context", async () => {
  const result = await runScraper(fakeScraper, {
    now: new Date("2026-03-28T12:00:00.000Z"),
    params: {
      region: "africa",
    },
  });

  assert.equal(result.scraperId, "fake-library-scraper");
  assert.equal(result.records.length, 1);
  assert.equal(result.source, "africa");
  assert.equal(result.fetchedAt, "2026-03-28T12:00:00.000Z");
});

test("getScraperCatalog can be filtered for bot-friendly discovery", () => {
  const catalog = getScraperCatalog({
    category: "news",
    search: "bbc science",
  });

  assert.equal(catalog.length, 1);
  assert.equal(catalog[0]?.id, "bbc-science-environment-news");
});

test("getScraperCatalog now exposes the expanded 180-plus scraper catalogue", () => {
  const catalog = getScraperCatalog();

  assert.ok(catalog.length >= 188);
});

test("runScraperById rejects unknown scraper ids", async () => {
  await assert.rejects(
    () => runScraperById("does-not-exist"),
    /Unknown scraper "does-not-exist"\./,
  );
});
