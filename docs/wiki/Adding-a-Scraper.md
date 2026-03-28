# Adding A Scraper

Use the shared factories whenever possible, add the module to `src/scrapers/index.ts`, document its parameters, and run both automated checks and a live endpoint test.

Templates live in `templates/` for RSS, JSON API, and webpage scraper starters.

Common release checklist:

1. add the scraper or topic-pack entry
2. register it in `src/scrapers/index.ts`
3. update `docs/scraper-catalog.md`
4. run `npm run check`
5. run `npm test`
6. run a live command for the new source

For page scraping:

- prefer feeds or APIs first
- use `src/core/html.ts` for readable extraction
- keep AI optional
