# Getting Started

This guide walks through installing the toolkit, exploring the catalogue, running scrapers, using the TypeScript library exports, exporting results, publishing health alerts, and working with the file-based website link workflow.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- internet access to the public source endpoints

## Install

```bash
npm install
```

The CLI auto-loads a repo-root `.env` file. If you want reusable local defaults, copy `.env.example` to `.env` before running commands.

If you want to embed the toolkit inside a Discord bot or another Node application, you can also install it directly from GitHub:

```bash
npm install github:Ninezel/open-scrapers-toolkit
```

## Choose your workflow

Use the CLI when you want:

- quick local runs
- saved output files
- batch jobs from the terminal or GitHub Actions
- health reports and export conversions

Use the library when you want:

- Discord bots or chat commands
- a web app or API server that calls scrapers on demand
- your own scheduler, queue, or webhook publisher
- direct access to normalised result objects in code

## Inspect the Catalogue

```bash
npm run list
npx tsx src/cli.ts list --category weather --search forecast
npx tsx src/cli.ts describe website-links-ai-digest
```

The current catalogue includes 84 scrapers:

- 18 news scrapers
- 3 weather scrapers
- 17 report/public-data scrapers
- 46 academic scrapers

## Run a single scraper

```bash
npx tsx src/cli.ts run bbc-world-news --limit 5
npx tsx src/cli.ts run open-meteo-air-quality --limit 6 --output output/air-quality.json --save-format all
npx tsx src/cli.ts run reddit-random-subreddit-image --param subreddit=wallpapers --limit 1
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
npx tsx src/cli.ts health --alert-status error,skipped --alert-file output/source-health-alerts.json
npx tsx src/cli.ts health --alert-status error --alert-webhook https://example.com/webhook
npx tsx src/cli.ts health --alert-status error --alert-discord-webhook https://discord.com/api/webhooks/...
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

## Use the library in code

```js
import { getScraperCatalog, runScraperById } from "open-scrapers-toolkit";

const catalogue = getScraperCatalog({
  category: "news",
  search: "bbc",
});

const result = await runScraperById("bbc-world-news", {
  contactEmail: "bot@example.com",
  limit: 3,
});
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

For subreddit image and scheduled weather examples, see:

- `examples/discord-bots/discordjs-subreddit-image-command.mjs`
- `examples/automation/discord-weather-scheduler.mjs`

If you want channel-level NSFW safety for image commands, set `DISCORD_ALLOWED_NSFW_CHANNEL_IDS` and use `buildDiscordChannelContext()` from the Discord helper exports.

For the full programmatic API guide, see [library-usage.md](library-usage.md).

For a detailed function-by-function breakdown of the exported helpers, see [api-reference.md](api-reference.md).

For automation, webhook, and publisher examples, see [automation.md](automation.md).

## Useful environment toggles

```bash
SCRAPERS_HTTP_TIMEOUT_MS=20000
SCRAPERS_HTTP_RETRIES=1
SCRAPERS_HTTP_RETRY_DELAY_MS=750
SCRAPERS_CACHE_TTL_MS=0
RUN_LIVE_TESTS=0
```

Use `RUN_LIVE_TESTS=1` only when you want the live-source smoke suite to hit real upstream endpoints.

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
