# Adding A Scraper

Use the shared factories whenever possible, add the module to `src/scrapers/index.ts`, document its parameters, and run both automated checks and a live endpoint test.

For page scraping:

- prefer feeds or APIs first
- use `src/core/html.ts` for readable extraction
- keep AI optional
