# Adding a Scraper

This project is meant to grow, so adding scrapers should feel routine.

## Before you code

Check these first:

- Is the source official, public, and appropriate?
- Is there an API or RSS feed before HTML scraping?
- Do we need the data often enough to justify a new module?
- Can the source be represented in the normalized record format?

## Fast path for common sources

Use a factory in `src/core/factories.ts` when the source matches an existing pattern.

Good factory candidates:

- RSS or Atom feeds
- search-style research APIs
- indicator-style JSON APIs

## Steps

1. Create `src/scrapers/your-scraper.ts`.
2. Export a `ScraperDefinition`.
3. Add it to `src/scrapers/index.ts`.
4. Document defaults and parameters.
5. Update [scraper-catalog.md](scraper-catalog.md).
6. Run `npm run check`.
7. Run the scraper against the live endpoint.

## Example structure

```ts
const scraper: ScraperDefinition = {
  id: "source-topic",
  name: "Source Topic",
  category: "reports",
  description: "Short explanation",
  homepage: "https://example.com",
  defaults: {
    query: "example"
  },
  params: [
    {
      key: "query",
      description: "Search term override"
    }
  ],
  async run(context) {
    return {
      scraperId: "...",
      scraperName: "...",
      category: "reports",
      source: "Example",
      fetchedAt: context.now.toISOString(),
      records: [],
      meta: {}
    };
  }
};
```

## Good defaults

- keep them bounded
- make them easy to understand
- avoid huge result sets
- prefer one or two meaningful starter filters

## When not to add a scraper

Do not add it if it:

- violates the scraping policy
- requires bypassing access controls
- duplicates an existing scraper with only cosmetic differences
- has no clear user value
