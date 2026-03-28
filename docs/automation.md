# Automation And Publishers

Open Scrapers Toolkit now includes reusable publisher helpers and automation-ready examples so you can move from "scrape data" to "send or store results" without writing the same glue code every time.

## What is included

- generic JSON webhook publishing
- Discord webhook publishing for normalised scraper results
- filtered health-alert snapshots
- file publishing through the normal export helpers
- example scripts for nightly health checks and result publishing

## Generic webhook publishing

```js
import { postJsonWebhook, runScraperById } from "open-scrapers-toolkit";

const result = await runScraperById("bbc-world-news", {
  limit: 3,
});

await postJsonWebhook("https://example.com/webhook", result);
```

## Discord webhook publishing

```js
import { publishDiscordWebhookMessages, runScraperById } from "open-scrapers-toolkit";

const result = await runScraperById("nasa-breaking-news", {
  limit: 2,
});

await publishDiscordWebhookMessages(
  "https://discord.com/api/webhooks/...",
  result,
  {
    maxRecords: 2,
    maxEmbedsPerMessage: 2,
  },
);
```

## Health alert publishing from the CLI

Save filtered alerts to a file:

```bash
npx tsx src/cli.ts health --alert-status error,skipped --alert-file output/source-health-alerts.json
```

Send filtered alerts to a generic webhook:

```bash
npx tsx src/cli.ts health --alert-status error --alert-webhook https://example.com/webhook
```

Send filtered alerts to a Discord webhook:

```bash
npx tsx src/cli.ts health --alert-status error --alert-discord-webhook https://discord.com/api/webhooks/...
```

## Example scripts

- `examples/automation/discord-health-alerts.mjs`
- `examples/automation/discord-weather-scheduler.mjs`
- `examples/automation/webhook-result-publisher.mjs`
- `examples/automation/nightly-health-check.mjs`

These examples are meant to be starting points for:

- GitHub Actions jobs
- Windows Task Scheduler jobs
- cron jobs on Linux hosts
- bot-side publishing workers

The weather scheduler example uses:

- `buildDiscordScheduleProfile()`
- `shouldRunDiscordSchedule()`
- `nextDiscordScheduledRunAt()`
- `weatherCadenceHours` in the Discord formatter

Useful example variables for automation workers:

- `DISCORD_WEATHER_MODE`
- `DISCORD_WEATHER_INTERVAL_HOURS`
- `DISCORD_WEATHER_LAST_RUN_AT`
- `DISCORD_WEBHOOK_URL`
- `RESULT_WEBHOOK_URL`

## Cache and retry settings

These are useful for scheduled jobs:

- `SCRAPERS_HTTP_RETRIES`
- `SCRAPERS_HTTP_RETRY_DELAY_MS`
- `SCRAPERS_CACHE_TTL_MS`

Example:

```bash
set SCRAPERS_HTTP_RETRIES=2
set SCRAPERS_HTTP_RETRY_DELAY_MS=1000
set SCRAPERS_CACHE_TTL_MS=600000
```

## Good automation patterns

- Keep limits low for chat-oriented publishing.
- Use caching only when slightly older data is acceptable.
- Treat health alerts as operational signals, not full incident diagnosis.
- Store file snapshots for auditability when you publish results elsewhere.
