# Adding a Scraper

This repository is designed to grow. Adding a new scraper should feel like extending a system, not improvising a script. This page explains how to decide whether a source belongs in the toolkit, how to implement it cleanly, and what checks to complete before opening a pull request.

## Before you write code

Ask these questions first:

1. Is the source public and appropriate for open-source tooling?
2. Is there an official API, RSS feed, Atom feed, or public dataset before HTML scraping?
3. Can the result be normalized into the shared output shape?
4. Does this scraper add meaningful user value instead of duplicating an existing module?
5. Does the source comply with the project policy in `SCRAPING_POLICY.md`?

If the answer to any of those questions is unclear, stop and resolve it before implementation.

## Prefer the simplest acceptable source

The preferred order is:

1. official public API
2. official RSS or Atom feed
3. public structured document endpoint
4. stable public JSON endpoint
5. HTML scraping only when the source is clearly allowed, durable enough, and worth the maintenance cost

## File touchpoints for a new scraper

A typical new scraper touches these files:

- `src/scrapers/your-scraper.ts`
- `src/scrapers/index.ts`
- `docs/scraper-catalog.md`
- `docs/wiki/Scraper-Catalog.md`

You may also need updates in:

- `README.md`
- `docs/wiki/Home.md`
- `docs/roadmap.md`

## Decide whether to use a factory

Look in `src/core/factories.ts` before writing a fully custom module.

Use a factory when the source matches an existing family:

- RSS or Atom feed
- Crossref query
- Europe PMC query
- World Bank indicator API
- World Bank document API

Write a dedicated scraper module when:

- the payload needs custom mapping logic
- the source has unusual filtering or pagination
- the metadata mapping is highly specific
- the source is not a good fit for the existing helper families

## Minimal scraper shape

Every scraper exports a `ScraperDefinition`.

```ts
const scraper: ScraperDefinition = {
  id: "source-topic-purpose",
  name: "Source Topic Purpose",
  category: "reports",
  description: "Short explanation of the scraper.",
  homepage: "https://example.com",
  defaults: {
    query: "example",
  },
  params: [
    {
      key: "query",
      description: "Search term override.",
      example: "climate adaptation",
    },
  ],
  async run(context) {
    return {
      scraperId: "source-topic-purpose",
      scraperName: "Source Topic Purpose",
      category: "reports",
      source: "Example Source",
      fetchedAt: context.now.toISOString(),
      records: [],
      meta: {},
    };
  },
};
```

## Naming rules

Scraper IDs should be descriptive and stable.

Preferred pattern:

`source-topic-purpose`

Good examples:

- `bbc-world-news`
- `open-meteo-city-forecast`
- `world-bank-climate-documents`

## Parameter design guidance

Good parameters are:

- easy to explain
- bounded in scope
- optional when possible
- consistent with the upstream source vocabulary

Good defaults should:

- avoid huge result sets
- be meaningful enough for first-time users
- produce records people can inspect quickly

## Record normalization guidance

Try to populate these fields when they make sense:

- `id`
- `source`
- `title`
- `url`
- `summary`
- `publishedAt`
- `authors`
- `tags`
- `location`
- `metadata`

Guidelines:

- `id` should be stable for the record source
- `title` should be human-readable without additional parsing
- `summary` should be cleaned of obvious markup noise when practical
- `metadata` should carry source-specific details that do not fit the shared top-level fields

## Implementation checklist

1. Create the scraper file in `src/scrapers/`.
2. Export the scraper definition.
3. Add it to `src/scrapers/index.ts`.
4. Keep the default result size reasonable.
5. Document parameters, examples, and source purpose.
6. Run local validation.
7. Run the scraper against the live endpoint.
8. Save an example result and inspect the JSON shape manually.

## Local validation checklist

```powershell
npm run check
npx tsx src/cli.ts list --format json
npx tsx src/cli.ts run <your-scraper-id> --limit 5 --format json
```

If the scraper saves files cleanly, also verify:

```powershell
npx tsx src/cli.ts run <your-scraper-id> --limit 5 --output output/<your-scraper-id>.json
```

## When not to add a scraper

Do not add it if it:

- bypasses paywalls or access controls
- requires authentication in a way that makes public reuse difficult
- depends on brittle DOM scraping when a better source exists
- harvests personal data without a strong, documented, lawful basis
- duplicates an existing scraper with only cosmetic changes

## Related pages

- [Architecture](Architecture.md)
- [Scraper Catalog](Scraper-Catalog.md)
- [Policies and Responsible Use](Policies-and-Responsible-Use.md)
