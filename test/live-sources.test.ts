import assert from "node:assert/strict";
import { test } from "node:test";

import { getScraperById } from "../src/core/registry.js";

test(
  "selected live scrapers respond when RUN_LIVE_TESTS=1",
  {
    skip: process.env.RUN_LIVE_TESTS !== "1",
  },
  async () => {
    const scraperIds = [
      "bbc-world-news",
      "open-meteo-city-forecast",
      "world-bank-gdp",
    ];

    for (const scraperId of scraperIds) {
      const scraper = getScraperById(scraperId);
      assert.ok(scraper, `Missing scraper ${scraperId}`);

      const result = await scraper.run({
        contactEmail: process.env.SCRAPERS_CONTACT_EMAIL,
        limit: 1,
        now: new Date(),
        outputDir: "output",
        params: {
          ...(scraper.defaults ?? {}),
        },
        userAgent: "OpenScrapersLiveTests/1.0",
      });

      assert.ok(result.records.length >= 1, `${scraperId} returned no records`);
    }
  },
);
