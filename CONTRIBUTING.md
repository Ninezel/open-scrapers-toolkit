# Contributing

Thanks for helping grow Open Scrapers Toolkit.

## Ground rules

- Read [SCRAPING_POLICY.md](SCRAPING_POLICY.md) before proposing or adding a scraper.
- Prefer official APIs, RSS feeds, and openly documented endpoints.
- Keep changes focused. A pull request that adds one scraper plus docs is easier to review than a bundle of unrelated edits.
- Do not commit secrets, API keys, private datasets, or copyrighted source dumps.
- Add or update docs when behavior changes.

## Local setup

```bash
npm install
npm run check
npm run list
```

Try a few real runs before you open a PR:

```bash
npx tsx src/cli.ts run bbc-world-news --limit 3
npx tsx src/cli.ts run open-meteo-city-forecast --limit 3
npx tsx src/cli.ts run crossref-ai-papers --limit 3
```

## Adding a new scraper

1. Create a module in `src/scrapers/`.
2. Export a `ScraperDefinition`.
3. Add the module to `src/scrapers/index.ts`.
4. Document any parameters in the scraper definition.
5. Add the scraper to [docs/scraper-catalog.md](docs/scraper-catalog.md).
6. Add or update usage examples in the docs if the behavior is non-obvious.

## Coding style

- Use TypeScript and keep modules small.
- Prefer shared helpers in `src/core/` over repeating request logic.
- Normalize records so downstream users get predictable JSON.
- Use descriptive scraper IDs such as `source-topic-purpose`.
- Keep default requests polite and bounded.

## Pull request checklist

- `npm run check` passes.
- The scraper works against a live public endpoint.
- Docs were updated.
- The change follows the scraping policy.
- Output is still JSON-serializable and easy to consume.

## Good issues for contributors

- Add new scrapers for public-interest datasets and official feeds.
- Improve docs and examples.
- Add tests around parsing and normalization.
- Improve output exporters such as CSV or JSONL.
- Add scheduling or Docker deployment helpers.
