# Architecture

The repository is intentionally small so contributors can understand it fast.

## Core pieces

- `src/cli.ts`: command-line entry point
- `src/core/catalog.ts`: shared catalog filtering and metadata formatting
- `src/core/types.ts`: shared TypeScript interfaces
- `src/core/http.ts`: polite HTTP helpers and timeout handling
- `src/core/rss.ts`: RSS and Atom parsing
- `src/core/factories.ts`: reusable scraper factories for common source patterns
- `src/core/output.ts`: JSON saving and preview output
- `src/core/registry.ts`: scraper discovery
- `src/scrapers/`: one file per scraper module
- `test/`: automated tests for core helpers and CLI behavior

## Data flow

1. The CLI selects or filters scrapers from the catalog.
2. The CLI builds a `ScraperContext` with:
   - `limit`
   - merged default parameters
   - output directory
   - user agent
   - current timestamp
3. The scraper fetches a public endpoint.
4. The scraper normalizes source-specific data into shared `records`.
5. The CLI prints a short preview or JSON and optionally saves the result.

## Normalized result shape

Every scraper returns:

```ts
{
  scraperId: string;
  scraperName: string;
  category: "news" | "weather" | "reports" | "academic";
  source: string;
  fetchedAt: string;
  records: ScrapedRecord[];
  meta?: Record<string, unknown>;
}
```

This keeps downstream consumers from needing a different parser for every source.

## Factory usage

The current factories cover these source styles:

- RSS and Atom feeds
- Crossref search
- Europe PMC search
- World Bank indicator API
- World Bank document search API

More complex sources such as Open-Meteo, NWS, and USGS use dedicated modules because their payloads are better handled directly.

## Why TypeScript

- safer refactors as the scraper catalog grows
- easier onboarding for contributors
- clearer contracts for normalized output
- straightforward path to tests, packaging, and deployment automation

## Quality and automation

The repository now includes:

- automated CLI and helper tests under `test/`
- a test-specific TypeScript config for strict checking
- GitHub Actions CI for type checks, tests, and production builds
