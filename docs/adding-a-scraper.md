# Adding a Scraper

This project is meant to grow, so adding scrapers should feel routine rather than heroic.

## Before you code

Check these first:

- Is the source official, public, and appropriate?
- Is there an API or RSS feed before HTML scraping?
- Do we need the data often enough to justify a new module?
- Can the source be represented in the normalised record format?

## Fast path for common sources

Use a factory in `src/core/factories.ts` when the source matches an existing pattern.

Good factory candidates:

- RSS or Atom feeds
- arXiv-style feed search
- search-style research APIs
- indicator-style JSON APIs
- document search APIs

Starter templates live in `templates/`:

- `templates/rss-scraper.ts`
- `templates/json-api-scraper.ts`
- `templates/webpage-scraper.ts`

## Steps

1. Create `src/scrapers/your-scraper.ts` or add a new config entry to a topic-pack module when a source family clearly belongs together.
2. Export a `ScraperDefinition`.
3. Add it to `src/scrapers/index.ts`.
4. Document defaults and parameters.
5. Update the scraper catalogue page at `docs/scraper-catalog.md`.
6. Add or update tests.
7. Run `npm run check`, `npm test`, and a live run of the scraper.

## Bulk-link and AI guidance

If you are adding an HTML page scraper:

- prefer a public feed or API before raw page extraction
- use `src/core/html.ts` when you need basic readable-text extraction
- treat AI enrichment as optional metadata, not ground truth
- make the scraper useful even when `OPENAI_API_KEY` is not configured

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
