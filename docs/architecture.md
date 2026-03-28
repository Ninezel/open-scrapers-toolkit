# Architecture

The repository is intentionally modular so we can keep adding scrapers without duplicating every transport, parser, and output step.

## Core pieces

- `src/cli.ts`: command-line entry point and orchestration
- `src/core/catalog.ts`: shared catalogue filtering and metadata formatting
- `src/core/cache.ts`: optional response caching for library and CLI workflows
- `src/core/types.ts`: shared TypeScript interfaces
- `src/core/http.ts`: polite HTTP helpers with timeout, retry, and backoff handling
- `src/core/reddit.ts`: Reddit OAuth token handling and random subreddit image selection
- `src/core/rss.ts`: RSS and Atom parsing
- `src/core/weather.ts`: Open-Meteo weather-code interpretation used by the Discord weather cards
- `src/core/html.ts`: readable webpage extraction for the bulk-link scraper
- `src/core/ai.ts`: optional OpenAI enrichment helper
- `src/core/factories.ts`: reusable scraper factories for feed and API patterns
- `src/core/output.ts`: JSON, CSV, and NDJSON export helpers
- `src/core/health.ts`: source-health report generation
- `src/core/registry.ts`: scraper discovery
- `src/library.ts`: programmatic runner functions for app and bot integrations
- `src/integrations/discord.ts`: Discord-friendly embed and message payload helpers
- `src/publishers.ts`: generic webhook publishing, snapshots, and filtered health-alert helpers
- `src/index.ts`: package entry point for library consumers
- `src/scrapers/`: scraper modules and topic-pack collections
- `test/`: automated tests for CLI behaviour, library exports, Discord formatting, outputs, helpers, and link ingestion

## Data flow

1. The CLI selects or filters scrapers from the catalogue.
2. The CLI builds a `ScraperContext` with a limit, output directory, parameters, user agent, and timestamp.
3. The scraper fetches a public endpoint or a user-supplied webpage.
4. Source-specific logic normalises data into shared `records`.
5. The CLI or library layer prints a preview, saves exports, builds a health report, or publishes the result elsewhere.

## Normalised Result Shape

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

## Factory usage

Current factory coverage:

- RSS and Atom feeds
- arXiv feed search
- Crossref works search
- Europe PMC search
- World Bank indicator API
- World Bank document search API

Large catalogue expansions can bundle related definitions into topic-pack modules so dozens of very similar scrapers do not duplicate the same plumbing.

Sources such as Open-Meteo, NWS, USGS, and the bulk-link scraper use dedicated modules because their payloads or extraction logic are more specialised.

## Quality and automation

- strict TypeScript checking for source and tests
- unit tests for CLI filters, exports, utilities, and file-based link scraping
- optional live smoke tests for public sources
- GitHub Actions CI for type checks, tests, and builds
- scheduled source-health workflow for live endpoint monitoring
- Docker packaging for running the compiled CLI in containers
- automation examples for Discord, webhooks, and health alert publishing
