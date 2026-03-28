# Getting Started

This guide walks through installing the toolkit, exploring the catalog, running scrapers, exporting results, and using the file-based website link workflow.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- internet access to the public source endpoints

## Install

```bash
npm install
```

If you want to embed the toolkit inside a Discord bot or another Node application, you can also install it directly from GitHub:

```bash
npm install github:Ninezel/open-scrapers-toolkit
```

## Inspect the catalog

```bash
npm run list
npx tsx src/cli.ts list --category weather --search forecast
npx tsx src/cli.ts describe website-links-ai-digest
```

## Run a single scraper

```bash
npx tsx src/cli.ts run bbc-world-news --limit 5
npx tsx src/cli.ts run open-meteo-air-quality --limit 6 --output output/air-quality.json --save-format all
```

## Run batches

```bash
npx tsx src/cli.ts run-all --out-dir output
npx tsx src/cli.ts run-all --category academic --limit 3 --out-dir output/academic
npx tsx src/cli.ts run-all --search world-bank --out-dir output/reports --save-format csv
```

## Scrape a text file of links

Create a text file with one public webpage URL per line:

```text
https://www.bbc.com/news/world
https://www.nasa.gov/news-release/
https://open-meteo.com/en/docs
```

Run it:

```bash
npx tsx src/cli.ts scrape-links examples/url-lists/demo-links.txt --limit 3 --output output/links-digest.json
```

Optional AI enrichment:

```bash
npx tsx src/cli.ts scrape-links examples/url-lists/demo-links.txt --use-ai auto --output output/links-digest.json
```

`use-ai auto` only turns on AI when both `OPENAI_API_KEY` and `OPENAI_MODEL` are configured.

## Health checks

```bash
npx tsx src/cli.ts health --format table
npx tsx src/cli.ts health --category weather --format json --output output/source-health-report.json
```

## Export an existing saved result

```bash
npx tsx src/cli.ts export output/bbc-world-news.json --format all --output output/bbc-world-news.json
```

## Parameters

Examples:

```bash
npx tsx src/cli.ts run open-meteo-city-forecast --param latitude=40.7128 --param longitude=-74.0060 --param label=NewYork
npx tsx src/cli.ts run usgs-earthquakes --param minimumMagnitude=5 --param place=Chile
npx tsx src/cli.ts run world-bank-gdp --param country=GBR
npx tsx src/cli.ts run arxiv-machine-learning --param query=\"large language models\"
```

## Build the compiled CLI

```bash
npm run build
node dist/cli.js list
```

## Use it in a Discord bot

```js
import { resultToDiscordMessages, runScraperById } from "open-scrapers-toolkit";

const result = await runScraperById("bbc-world-news", {
  contactEmail: "bot@example.com",
  limit: 3,
});

const messages = resultToDiscordMessages(result, {
  maxRecords: 3,
  maxEmbedsPerMessage: 3,
});
```

For a full starter bot example, see `examples/discord-bots/discordjs-message-command.mjs`.

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
