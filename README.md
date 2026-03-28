# Open Scrapers Toolkit

Open Scrapers Toolkit is an open-source TypeScript project for collecting structured data from public news feeds, weather services, report APIs, research indexes, and user-supplied website lists. It ships with a reusable scraper framework, a CLI, export tools, health checks, cache and retry helpers, publisher utilities, Docker support, prompt-routing helpers for apps and bots, and a starter catalogue of 188 scrapers that people can run, remix, and extend.

Desktop companion:

- Repository: `https://github.com/Ninezel/open-scrapers-desk`
- `open-scrapers-desk` provides a PyQt desktop UI for running this toolkit and reading the saved outputs.
- `open-scrapers-desk` now also includes a Python Discord bot bridge for teams building bots around this toolkit.

## Why this project exists

- Give people a clean starter repo for scraping and feed collection.
- Prefer transparent, documented sources over fragile browser automation where possible.
- Make the project easy to fork, edit, and reuse for personal research, dashboards, automation, and learning.
- Make the scrapers reusable inside Discord bots and other application code instead of limiting them to terminal-only workflows.
- Grow beyond a handful of scrapers without turning the repo into a tangle of one-off scripts.

## Current feature set

- 188 starter scrapers across `news`, `weather`, `reports`, and `academic`
- category breakdown: 18 `news`, 3 `weather`, 43 `reports`, 124 `academic`
- rich catalogue discovery with `list`, `describe`, category filters, and search
- `run`, `run-all`, and `scrape-links` CLI flows
- CSV and NDJSON exports in addition to JSON
- `health` command for source-health reporting
- cache, retry, and backoff support for public-source requests
- webhook and snapshot publisher helpers for apps and bots
- filtered health-alert publishing to files, webhooks, and Discord webhooks
- optional OpenAI enrichment for file-based website link scraping
- programmatic TypeScript library exports for app and bot integrations
- Discord-friendly message/embed helpers for `discord.js` and compatible libraries
- Discord helpers for slash-command choices, natural-language `/scraper` routing, channel-policy resolution, NSFW/SFW validation, delivery-mode scheduling, and weather-card formatting
- automation examples for Discord, webhooks, and nightly health checks
- contributor templates for RSS, JSON API, and webpage scraper modules
- Docker packaging and a scheduled GitHub Actions health workflow
- strict TypeScript checks, automated tests, and optional live-source smoke tests

## Starter Catalogue

The catalogue now spans:

- BBC, NASA, UN News, WHO AFRO, and Nature feeds
- Open-Meteo, NWS, and USGS public hazard/weather data
- World Bank indicators and document searches
- arXiv, Crossref, Europe PMC, and topic-focused research feeds
- prompt-friendly academic and report search scrapers
- file-based public webpage digest workflows

This README keeps the overview readable by showing the main families below. For the full live list of 188 scraper IDs, use `npx tsx src/cli.ts list --format json` or see [docs/scraper-catalog.md](docs/scraper-catalog.md).

News:

- `bbc-world-news`
- `bbc-technology-news`
- `bbc-business-news`
- `bbc-science-environment-news`
- `nasa-breaking-news`
- `nasa-image-of-the-day`
- `reddit-random-subreddit-image`

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

Expanded source families:

- `un-news-*` topic feeds
- `who-afro-*` feeds
- `nature-*` topic feeds
- `crossref-*` topic packs
- `europepmc-*` topic packs
- `arxiv-*` topic packs
- expanded `world-bank-*` document and indicator scrapers
- generic search scrapers such as `crossref-academic-search`, `europepmc-academic-search`, `arxiv-academic-search`, and `world-bank-document-search`

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
npx tsx src/cli.ts ask "What is the weather in London"
npx tsx src/cli.ts run-all --category academic --limit 3 --out-dir output/academic
```

## Use it as a library

Install from the GitHub repo:

```bash
npm install github:Ninezel/open-scrapers-toolkit
```

Then import it in your app or bot:

```js
import { resultToDiscordMessages, runScraperById } from "open-scrapers-toolkit";

const result = await runScraperById("bbc-world-news", {
  contactEmail: "bot@example.com",
  limit: 3,
});

const messages = resultToDiscordMessages(result, {
  maxRecords: 3,
});
```

The toolkit also exposes a Discord-only formatter subpath if you want the helper without the rest of the root exports:

```js
import { resultToDiscordMessages } from "open-scrapers-toolkit/discord";
```

Useful bot-side helpers also include `buildDiscordChannelContext()`, `buildDiscordScheduleProfile()`, and `parseDiscordChannelIdList()` for channel safety rules and hourly or every-3-hours delivery modes.

If you want a single `/scraper` question flow, the toolkit now also exposes `resolveScraperPrompt()`, `runScraperPrompt()`, `runScraperPromptToDiscordMessages()`, and `buildDiscordScraperSlashCommandDefinition()`.

If you want a function-by-function guide for app and bot developers, see [docs/api-reference.md](docs/api-reference.md).

Example bot starter:

- `examples/discord-bots/discordjs-message-command.mjs`
- `examples/discord-bots/discordjs-scraper-slash-command.mjs`
- `examples/discord-bots/discordjs-subreddit-image-command.mjs`

Automation and publisher examples:

- `examples/automation/discord-health-alerts.mjs`
- `examples/automation/discord-weather-scheduler.mjs`
- `examples/automation/webhook-result-publisher.mjs`
- `examples/automation/nightly-health-check.mjs`

## Cache, retry, and health alerts

Optional environment variables:

```bash
SCRAPERS_HTTP_RETRIES=1
SCRAPERS_HTTP_RETRY_DELAY_MS=750
SCRAPERS_CACHE_TTL_MS=0
```

Health checks can now publish filtered alerts:

```bash
npx tsx src/cli.ts health --alert-status error,skipped --alert-file output/source-health-alerts.json
npx tsx src/cli.ts health --alert-webhook https://example.com/webhook
npx tsx src/cli.ts health --alert-discord-webhook https://discord.com/api/webhooks/...
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

List the catalogue:

```bash
npm run list
npx tsx src/cli.ts list --format json
npx tsx src/cli.ts list --category reports --search world-bank
```

Inspect one scraper:

```bash
npx tsx src/cli.ts describe open-meteo-air-quality
npx tsx src/cli.ts describe reddit-random-subreddit-image
npx tsx src/cli.ts describe website-links-ai-digest --format json
npx tsx src/cli.ts ask "Give me academic records of Vatican Church" --resolve-only
```

Run one scraper:

```bash
npx tsx src/cli.ts run nasa-breaking-news --limit 10 --output output/nasa-breaking-news.json
npx tsx src/cli.ts run open-meteo-air-quality --limit 6 --output output/air-quality.json --save-format all
npx tsx src/cli.ts run reddit-random-subreddit-image --param subreddit=wallpapers --limit 1 --output output/reddit-image.json
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

Each scraper writes a normalised payload:

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

The CLI auto-loads `.env` from the repo root through `dotenv`. Copy `.env.example` to `.env` if you want to customise defaults for CLI usage:

- `SCRAPERS_USER_AGENT`
- `SCRAPERS_CONTACT_EMAIL`
- `SCRAPERS_OUTPUT_DIR`
- `SCRAPERS_HTTP_TIMEOUT_MS`
- `SCRAPERS_HTTP_RETRIES`
- `SCRAPERS_HTTP_RETRY_DELAY_MS`
- `SCRAPERS_CACHE_TTL_MS`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_BASE_URL`
- `REDDIT_ACCESS_TOKEN`
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `REDDIT_USER_AGENT`
- `DEFAULT_WEATHER_LATITUDE`
- `DEFAULT_WEATHER_LONGITUDE`
- `DEFAULT_WEATHER_LABEL`
- `RUN_LIVE_TESTS`
- `DISCORD_TOKEN`
- `DISCORD_APPLICATION_ID`
- `DISCORD_GUILD_ID`
- `DISCORD_COMMAND_NAME`
- `DISCORD_PREFIX`
- `DISCORD_ALLOWED_NSFW_CHANNEL_IDS`
- `DISCORD_WEATHER_MODE`
- `DISCORD_WEATHER_INTERVAL_HOURS`
- `DISCORD_WEATHER_LAST_RUN_AT`
- `DISCORD_WEBHOOK_URL`
- `RESULT_WEBHOOK_URL`

If you are using the toolkit as a library inside your own app or bot, load environment variables in your host process or pass explicit options in code. The library helpers do not auto-read `.env` files on their own.

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
- [Environment variables](docs/environment-variables.md)
- [Architecture](docs/architecture.md)
- [Library usage](docs/library-usage.md)
- [API reference](docs/api-reference.md)
- [Prompt routing](docs/prompt-routing.md)
- [Automation and publishers](docs/automation.md)
- [Discord bot integration](docs/discord-bots.md)
- [Scraper catalogue](docs/scraper-catalog.md)
- [Adding a scraper](docs/adding-a-scraper.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Compliance and ethics](docs/compliance.md)
- [Roadmap](docs/roadmap.md)
- [Release workflow](docs/release-workflow.md)

## Next roadmap focus

Current next-step priorities for the toolkit are:

- keep growing the public-interest catalogue beyond 188 with more humanitarian, hazard, OECD, and policy-research coverage
- refine the prompt router, slash-command workflow, and bot-side publisher helpers
- keep improving live-source monitoring, source-specific troubleshooting, and parser regression coverage
- expand contributor fixtures, templates, and source-family examples so large catalogue growth stays maintainable

The full planning notes live in [docs/roadmap.md](docs/roadmap.md).

## Open-source standards

- Licence: MIT
- Code of conduct: Contributor Covenant
- Security policy: see `SECURITY.md`
- Contribution guide: see `CONTRIBUTING.md`
- Governance guide: see `GOVERNANCE.md`

## Notes

- Public source endpoints can change. If a scraper stops working, open an issue with the source, date, error, and any sample response.
- The bulk link scraper is meant for lawful access to public webpages, not bypassing controls or mass harvesting.
- AI enrichment is optional and should be treated as a convenience layer, not a guaranteed ground truth.
- When you use the toolkit in a bot, keep scraper limits polite, identify your contact email where possible, and respect each source's terms and robots guidance.
