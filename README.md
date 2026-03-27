# Open Scrapers Toolkit

Open Scrapers Toolkit is an open-source TypeScript project for collecting structured data from public news feeds, weather services, reports APIs, and academic research indexes. It ships with a reusable scraper framework, a CLI, and a starter catalog of 15 scrapers that people can run, remix, and extend.

This repository is designed for long-term growth. The first version focuses on sources that are either public APIs or public RSS feeds so contributors can learn the structure quickly and add new scrapers safely.

Desktop companion:

- `open-scrapers-desk` provides a PyQt desktop UI for running this toolkit and reading the saved JSON outputs.

## Why this project exists

- Give people a clean starter repo for scraping and feed collection.
- Prefer transparent, documented sources over fragile browser automation where possible.
- Make the project easy to fork, edit, and reuse for personal research, dashboards, automation, and learning.
- Establish repo rules early so the project can scale beyond the initial 10+ scrapers.

## Starter scraper catalog

Current starter modules:

- `bbc-world-news`
- `bbc-technology-news`
- `nasa-breaking-news`
- `nasa-image-of-the-day`
- `nws-active-alerts`
- `open-meteo-city-forecast`
- `usgs-earthquakes`
- `world-bank-population`
- `world-bank-gdp`
- `world-bank-climate-documents`
- `world-bank-education-documents`
- `crossref-ai-papers`
- `crossref-climate-papers`
- `europepmc-public-health`
- `europepmc-oncology`

## Stack

- Node.js 20+
- TypeScript
- Native `fetch`
- `commander` for the CLI
- `fast-xml-parser` for RSS and XML feeds

## Quick start

```bash
npm install
npm run list
npx tsx src/cli.ts run bbc-world-news --limit 5
npx tsx src/cli.ts run open-meteo-city-forecast --limit 6 --param latitude=51.5072 --param longitude=-0.1276 --param label=London
npx tsx src/cli.ts run-all --out-dir output
```

Build the compiled CLI:

```bash
npm run build
npm run start -- list
```

## CLI commands

List all scrapers:

```bash
npm run list
```

Machine-readable catalog output:

```bash
npx tsx src/cli.ts list --format json
```

Run one scraper:

```bash
npx tsx src/cli.ts run nasa-breaking-news --limit 10 --output output/nasa-breaking-news.json
```

Run one scraper and print raw JSON:

```bash
npx tsx src/cli.ts run crossref-ai-papers --limit 3 --format json
```

Run every scraper in a single category:

```bash
npx tsx src/cli.ts run-all --category academic --limit 5 --out-dir output/academic
```

Pass extra parameters to a scraper:

```bash
npx tsx src/cli.ts run open-meteo-city-forecast --param latitude=40.7128 --param longitude=-74.0060 --param label=NewYork
npx tsx src/cli.ts run usgs-earthquakes --param minimumMagnitude=4.5 --param place=Japan
npx tsx src/cli.ts run world-bank-population --param country=GBR
```

If you prefer `npm run dev`, add one extra `--` before scraper flags:

```bash
npm run dev -- run bbc-world-news -- --limit 5 --output output/bbc-world-news.json
```

## Output format

Each scraper writes a normalized JSON payload:

- `scraperId`: internal scraper identifier
- `scraperName`: human-readable scraper name
- `category`: `news`, `weather`, `reports`, or `academic`
- `source`: upstream source name
- `fetchedAt`: ISO timestamp for this run
- `records`: normalized items
- `meta`: source-specific request or run metadata

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
- `DEFAULT_WEATHER_LATITUDE`
- `DEFAULT_WEATHER_LONGITUDE`
- `DEFAULT_WEATHER_LABEL`

## Project layout

```text
.
|- docs/
|- examples/
|- src/
|  |- core/
|  |- scrapers/
|- .github/
|- CONTRIBUTING.md
|- CODE_OF_CONDUCT.md
|- GOVERNANCE.md
|- LICENSE
|- README.md
|- SCRAPING_POLICY.md
|- SECURITY.md
```

## Repository rules

This repo is intentionally open, but not careless. Contributors should:

- Prefer official APIs, public datasets, and RSS feeds before building brittle page scrapers.
- Respect robots.txt, source terms, rate limits, and geographic or legal restrictions.
- Never add scrapers that bypass paywalls, authentication, CAPTCHAs, or technical access controls.
- Avoid collecting personal data unless the source explicitly allows it and the need is documented.
- Add documentation and a sample run command whenever a new scraper is added.
- Keep scraper outputs structured and predictable so others can build on them.

## Documentation

- [Getting started](docs/getting-started.md)
- [Architecture](docs/architecture.md)
- [Scraper catalog](docs/scraper-catalog.md)
- [Adding a scraper](docs/adding-a-scraper.md)
- [Compliance and ethics](docs/compliance.md)
- [Roadmap](docs/roadmap.md)

## Open-source standards

- License: MIT
- Code of conduct: Contributor Covenant
- Security policy: see `SECURITY.md`
- Contribution guide: see `CONTRIBUTING.md`
- Governance guide: see `GOVERNANCE.md`

## Notes

- Public source endpoints can change. If a scraper stops working, open an issue with the source, date, error, and any sample response.
- This toolkit is for lawful and responsible use. It is not legal advice.
