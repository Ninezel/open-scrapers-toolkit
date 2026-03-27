import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildCatalogEntries,
  filterCatalogEntries,
  formatScraperDetails,
  normalizeCategoryFilter,
} from "../src/core/catalog.js";
import { getAllScrapers } from "../src/core/registry.js";
import type { ScraperDefinition } from "../src/core/types.js";

test("filterCatalogEntries applies category and text filters", () => {
  const entries = buildCatalogEntries(getAllScrapers());
  const filtered = filterCatalogEntries(entries, {
    category: "weather",
    search: "forecast",
  });

  assert.deepEqual(filtered.map((entry) => entry.id), ["open-meteo-city-forecast"]);
});

test("normalizeCategoryFilter rejects invalid categories", () => {
  assert.throws(
    () => normalizeCategoryFilter("finance"),
    /Invalid category "finance"/,
  );
});

test("formatScraperDetails prints the most useful metadata", () => {
  const scraper: ScraperDefinition = {
    id: "example-source",
    name: "Example Source",
    category: "reports",
    description: "Example description.",
    homepage: "https://example.com",
    sourceName: "Example API",
    defaults: {
      query: "climate",
    },
    params: [
      {
        key: "query",
        description: "Search override.",
        example: "resilience",
      },
    ],
    async run() {
      throw new Error("Not implemented in tests.");
    },
  };

  const output = formatScraperDetails(buildCatalogEntries([scraper])[0]);

  assert.match(output, /Category: reports/);
  assert.match(output, /Source: Example API/);
  assert.match(output, /Defaults:/);
  assert.match(output, /query=climate/);
  assert.match(output, /Parameters:/);
  assert.match(output, /Search override\. Example: resilience/);
  assert.match(output, /Example run: npx tsx src\/cli\.ts run example-source --limit 5/);
});
