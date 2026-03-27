# Architecture

Open Scrapers Toolkit is intentionally small, but it still has a defined internal shape. This page explains how the CLI, shared helpers, factories, and scraper modules fit together so contributors can extend the codebase without guessing.

## High-level layout

```text
src/
|- cli.ts
|- core/
|  |- catalog.ts
|  |- factories.ts
|  |- http.ts
|  |- output.ts
|  |- registry.ts
|  |- rss.ts
|  |- types.ts
|  |- utils.ts
|- scrapers/
|  |- index.ts
|  |- *.ts
test/
|- *.test.ts
```

## Main responsibilities

### `src/cli.ts`

The command-line entry point. It:

- loads environment variables
- parses CLI arguments with `commander`
- looks up scraper definitions from the registry
- builds a `ScraperContext`
- executes one or many scrapers
- prints previews and saves output files

### `src/core/types.ts`

Defines the shared contracts:

- `ScraperDefinition`
- `ScraperContext`
- `ScrapeResult`
- `ScrapedRecord`
- `ScraperParameter`

### `src/core/catalog.ts`

Provides shared catalog behavior for the CLI, including:

- category validation
- catalog filtering
- structured metadata output
- human-readable `describe` formatting

### `src/core/http.ts`

Contains shared fetch behavior, including polite headers and configurable timeout handling for upstream requests.

### `src/core/factories.ts`

Contains reusable scraper builders for:

- RSS
- Crossref
- Europe PMC
- World Bank indicator data
- World Bank documents

### `src/core/registry.ts`

Provides sorted access to the scraper catalog and resolves scrapers by ID.

### `src/scrapers/`

Contains one file per scraper module plus the central `index.ts` export list.

### `test/`

Contains automated tests for:

- catalog filtering
- CLI discovery commands
- timeout configuration
- utility helper behavior

## Execution flow

### Single scraper

1. The CLI resolves one scraper or filters a set of catalog entries.
2. The CLI builds a `ScraperContext`.
3. The scraper fetches the upstream source.
4. The scraper normalizes records into the shared shape.
5. The CLI prints a summary or JSON.
6. The CLI optionally saves the result to disk.

### Batch run

1. The CLI filters the catalog, optionally by category.
2. Each scraper runs in sequence.
3. Each result is saved into the target output directory.
4. A batch summary is collected.
5. `run-summary.json` is written at the end.

## The shared result contract

Every scraper returns the same top-level structure:

```ts
{
  scraperId: string;
  scraperName: string;
  category: "academic" | "news" | "reports" | "weather";
  source: string;
  fetchedAt: string;
  records: ScrapedRecord[];
  meta?: Record<string, unknown>;
}
```

This is the key architectural choice in the project. The sources are different, but the output contract is consistent.

## Why some scrapers remain custom

Dedicated modules exist when:

- the endpoint has a unique shape
- the filtering model differs
- the metadata mapping is highly specific

Examples include:

- `open-meteo-city-forecast`
- `nws-active-alerts`
- `usgs-earthquakes`

## Why TypeScript

TypeScript helps this repository stay maintainable as the catalog grows:

- interfaces document the contract clearly
- refactors are safer
- contributors get faster feedback
- future tests and packaging work are easier to add

## Quality gates

The repository now has stronger maintenance guardrails:

- `npm run check` verifies both source and test TypeScript
- `npm test` exercises the CLI and shared helpers
- GitHub Actions CI runs checks, tests, and builds on push and pull request

## Related pages

- [Adding a Scraper](Adding-a-Scraper.md)
- [CLI Reference](CLI-Reference.md)
- [Contribution and Release Process](Contribution-and-Release-Process.md)
