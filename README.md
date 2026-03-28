# Open Scrapers Toolkit

Open Scrapers Toolkit is an open-source TypeScript project for collecting structured data from public news feeds, weather services, report APIs, research indexes, and user-supplied website lists. It ships with a reusable scraper framework, a CLI, export tools, health checks, Docker support, and a starter catalog of 28 scrapers that people can run, remix, and extend.

Desktop companion:

- Repository: `https://github.com/Ninezel/open-scrapers-desk`
- `open-scrapers-desk` provides a PyQt desktop UI for running this toolkit and reading the saved outputs.

## Why this project exists

- Give people a clean starter repo for scraping and feed collection.
- Prefer transparent, documented sources over fragile browser automation where possible.
- Make the project easy to fork, edit, and reuse for personal research, dashboards, automation, and learning.
- Grow beyond a handful of scrapers without turning the repo into a tangle of one-off scripts.

## Current feature set

- 28 starter scrapers across `news`, `weather`, `reports`, and `academic`
- rich catalog discovery with `list`, `describe`, category filters, and search
- `run`, `run-all`, and `scrape-links` CLI flows
- CSV and NDJSON exports in addition to JSON
- `health` command for source-health reporting
- optional OpenAI enrichment for file-based website link scraping
- Docker packaging and a scheduled GitHub Actions health workflow
- strict TypeScript checks, automated tests, and optional live-source smoke tests

## Starter catalog

News:

- `bbc-world-news`
- `bbc-technology-news`
- `bbc-business-news`
- `bbc-science-environment-news`
- `nasa-breaking-news`
- `nasa-image-of-the-day`

Weather:

- `nws-active-alerts`
- `open-meteo-city-forecast`
- `open-meteo-air-quality`

Reports:

- `usgs-earthquakes`
- `world-bank-population`
- `world-bank-gdp`
- `world-bank-climate-documents`
- `world-bank-education-documents`
- `world-bank-health-documents`
- `world-bank-water-documents`
- `website-links-ai-digest`

Academic:

- `crossref-ai-papers`
- `crossref-climate-papers`
- `crossref-cybersecurity-papers`
- `crossref-renewable-energy-papers`
- `europepmc-public-health`
- `europepmc-oncology`
- `europepmc-infectious-disease`
- `europepmc-mental-health`
- `arxiv-machine-learning`
- `arxiv-climate-science`
- `arxiv-public-health`

## Stack

- Node.js 20+
- TypeScript
- native `fetch`
- `commander` for the CLI
- `fast-xml-parser` for RSS and Atom feeds
- `cheerio` for webpage extraction in the bulk-link scraper

## Quick start

```bash
npm install
npx tsx src/cli.ts list --category weather --search forecast
npx tsx src/cli.ts describe website-links-ai-digest
npx tsx src/cli.ts run bbc-business-news --limit 5
npx tsx src/cli.ts run-all --category academic --limit 3 --out-dir output/academic
```

## Bulk website list scraping

Put one URL per line in a text file:

```text
https://www.bbc.com/news/world
https://www.nasa.gov/news-release/
https://open-meteo.com/en/docs
```

Run it with:

```bash
npx tsx src/cli.ts scrape-links examples/url-lists/demo-links.txt --limit 3 --output output/links-digest.json
```

Use optional AI enrichment only when `OPENAI_API_KEY` and `OPENAI_MODEL` are configured:

```bash
npx tsx src/cli.ts scrape-links examples/url-lists/demo-links.txt --use-ai auto --output output/links-digest.json --save-format all
```

## CLI commands

List the catalog:

```bash
npm run list
npx tsx src/cli.ts list --format json
npx tsx src/cli.ts list --category reports --search world-bank
```

Inspect one scraper:

```bash
npx tsx src/cli.ts describe open-meteo-air-quality
npx tsx src/cli.ts describe website-links-ai-digest --format json
```

Run one scraper:

```bash
npx tsx src/cli.ts run nasa-breaking-news --limit 10 --output output/nasa-breaking-news.json
npx tsx src/cli.ts run open-meteo-air-quality --limit 6 --output output/air-quality.json --save-format all
```

Run batches:

```bash
npx tsx src/cli.ts run-all --category weather --limit 5 --out-dir output/weather
npx tsx src/cli.ts run-all --search world-bank --out-dir output/reports --save-format csv
```

Check source health:

```bash
npx tsx src/cli.ts health --format table
npx tsx src/cli.ts health --category weather --format json --output output/source-health-report.json
```

Export an existing JSON result:

```bash
npx tsx src/cli.ts export output/bbc-business-news.json --format all --output output/bbc-business-news.json
```

## Output format

Each scraper writes a normalized payload:

- `scraperId`
- `scraperName`
- `category`
- `source`
- `fetchedAt`
- `records`
- `meta`

Each record may include:

- `id`
- `title`
- `url`
- `summary`
- `publishedAt`
- `authors`
- `tags`
- `location`
- `metadata`

## Environment variables

Copy `.env.example` to `.env` if you want to customize defaults:

- `SCRAPERS_USER_AGENT`
- `SCRAPERS_CONTACT_EMAIL`
- `SCRAPERS_OUTPUT_DIR`
- `SCRAPERS_HTTP_TIMEOUT_MS`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_BASE_URL`
- `DEFAULT_WEATHER_LATITUDE`
- `DEFAULT_WEATHER_LONGITUDE`
- `DEFAULT_WEATHER_LABEL`

## Docker

Build and run the compiled CLI in Docker:

```bash
docker build -t open-scrapers-toolkit .
docker run --rm open-scrapers-toolkit list
docker run --rm open-scrapers-toolkit health --format table
```

## Validation

```bash
npm run check
npm test
npm run build
```

Optional live-source smoke tests:

```bash
set RUN_LIVE_TESTS=1
npm run test:live
```

## Documentation

- [Getting started](docs/getting-started.md)
- [Architecture](docs/architecture.md)
- [Scraper catalog](docs/scraper-catalog.md)
- [Adding a scraper](docs/adding-a-scraper.md)
- [Compliance and ethics](docs/compliance.md)
- [Roadmap](docs/roadmap.md)
- [Release workflow](docs/release-workflow.md)

## Open-source standards

- License: MIT
- Code of conduct: Contributor Covenant
- Security policy: see `SECURITY.md`
- Contribution guide: see `CONTRIBUTING.md`
- Governance guide: see `GOVERNANCE.md`

## Notes

- Public source endpoints can change. If a scraper stops working, open an issue with the source, date, error, and any sample response.
- The bulk link scraper is meant for lawful access to public webpages, not bypassing controls or mass harvesting.
- AI enrichment is optional and should be treated as a convenience layer, not a guaranteed ground truth.
