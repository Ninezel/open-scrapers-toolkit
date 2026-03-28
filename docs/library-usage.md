# Library Usage

Open Scrapers Toolkit can be used as a CLI, but it is also a reusable TypeScript library for bots, apps, dashboards, and automation workers.

If you want a function-by-function breakdown with return values, option meanings, and “when should I use this?” guidance, read [api-reference.md](api-reference.md) alongside this page.

## Install options

Install from the GitHub repository:

```bash
npm install github:Ninezel/open-scrapers-toolkit
```

Or use a local checkout while developing:

```bash
npm install
npm run build
```

If your app depends on `.env` values, load them in the host process before calling the library, or pass explicit options directly to the helper functions. The CLI auto-loads `.env`; the library surface does not.

## What the package exports

Root package exports include:

- catalogue helpers such as `getScraperCatalog()`
- registry access through the main library surface
- runner helpers such as `runScraperById()`
- health reporting with `runLibraryHealth()`
- generic publisher helpers such as `postJsonWebhook()` and `publishResultSnapshot()`
- Discord publisher helpers such as `publishDiscordWebhookMessages()`
- Discord payload formatting helpers such as `resultToDiscordMessages()`
- Reddit image helper functions such as `fetchRandomSubredditImageRecords()`

Discord-only subpath:

```js
import { resultToDiscordMessages, runScraperToDiscordMessages } from "open-scrapers-toolkit/discord";
```

The root package also re-exports publisher helpers such as `buildHealthAlertResult()`, `postJsonWebhook()`, `publishDiscordWebhookMessages()`, and `publishResultSnapshot()`.

Useful Discord-side helpers now also include:

- `buildDiscordChannelContext()`
- `buildDiscordScheduleProfile()`
- `buildDiscordScraperChoices()`
- `filterDiscordResultForChannel()`
- `nextDiscordScheduledRunAt()`
- `parseDiscordChannelIdList()`
- `selectWeatherCadenceRecords()`
- `shouldRunDiscordSchedule()`

## Typical usage flow

1. Discover a scraper or filter the catalogue.
2. Run one scraper, a category, or a filtered set.
3. Use the normalised `ScrapeResult` object in your own code.
4. Optionally render the result to Discord-style message payloads.

## Discover the Catalogue

```js
import { getScraperCatalog } from "open-scrapers-toolkit";

const academicClimate = getScraperCatalog({
  category: "academic",
  search: "climate",
});
```

Each catalogue entry includes:

- `id`
- `name`
- `category`
- `description`
- `homepage`
- `sourceName`
- `defaults`
- `params`

## Run one scraper

```js
import { runScraperById } from "open-scrapers-toolkit";

const result = await runScraperById("open-meteo-city-forecast", {
  contactEmail: "team@example.com",
  limit: 6,
  params: {
    latitude: "51.5072",
    longitude: "-0.1276",
    label: "London",
    days: "2",
  },
});
```

Useful options:

- `cacheTtlMs`: enable local response caching for GET requests
- `contactEmail`: helpful identifier for polite requests
- `limit`: cap the returned records
- `params`: scraper-specific parameters
- `outputDir`: useful if your own code also wants file output conventions
- `retryCount`: retry count for transient request failures
- `retryDelayMs`: backoff base delay for retry attempts
- `userAgent`: override the default user agent if needed
- `now`: inject a fixed clock during tests

## Run a category or filtered slice

```js
import { runScrapersByCategory, runScrapersFromCatalog } from "open-scrapers-toolkit";

const weatherResults = await runScrapersByCategory("weather", {
  limit: 3,
});

const worldBankResults = await runScrapersFromCatalog({
  category: "reports",
  search: "world-bank",
  limit: 2,
});
```

## Run health checks in code

```js
import { runLibraryHealth } from "open-scrapers-toolkit";

const health = await runLibraryHealth({
  category: "news",
});
```

The returned value is a standard `ScrapeResult`, so you can store it, publish it, or transform it like any other scraper result.

## Publish results

Generic webhook example:

```js
import { postJsonWebhook, runScraperById } from "open-scrapers-toolkit";

const result = await runScraperById("bbc-world-news", {
  limit: 3,
});

await postJsonWebhook("https://example.com/webhook", result);
```

Save a snapshot from code:

```js
import { publishResultSnapshot } from "open-scrapers-toolkit";
```

Publish Discord-style messages to a webhook:

```js
import { publishDiscordWebhookMessages, runScraperById } from "open-scrapers-toolkit";

const result = await runScraperById("un-news-health", {
  contactEmail: "bot@example.com",
  limit: 2,
});

await publishDiscordWebhookMessages(
  "https://discord.com/api/webhooks/...",
  result,
  {
    maxRecords: 2,
  },
);
```

Health alert filtering:

```js
import { buildHealthAlertResult, runLibraryHealth } from "open-scrapers-toolkit";

const health = await runLibraryHealth({
  limit: 1,
});

const alerts = buildHealthAlertResult(health, "error,skipped");
```

## Normalised Result Shape

Every scraper returns:

```ts
{
  scraperId: string;
  scraperName: string;
  category: "news" | "weather" | "reports" | "academic";
  source: string;
  fetchedAt: string;
  records: ScrapedRecord[];
  meta?: Record<string, unknown>;
}
```

Each `record` may include:

- `id`
- `source`
- `title`
- `url`
- `summary`
- `publishedAt`
- `authors`
- `tags`
- `location`
- `metadata`

## Discord bot usage

If you want to format a result into Discord-style payloads:

```js
import { resultToDiscordMessages, runScraperById } from "open-scrapers-toolkit";

const result = await runScraperById("nasa-breaking-news", {
  contactEmail: "bot@example.com",
  limit: 2,
});

const messages = resultToDiscordMessages(result, {
  maxRecords: 2,
  maxEmbedsPerMessage: 2,
  includeMetadata: false,
});
```

One-call helper:

```js
import { runScraperToDiscordMessages } from "open-scrapers-toolkit/discord";
```

Use this when you want a direct scrape-to-message flow inside `discord.js` or a compatible library.

Channel-safety example:

```js
import {
  buildDiscordChannelContext,
  parseDiscordChannelIdList,
  resultToDiscordMessages,
  runScraperById,
} from "open-scrapers-toolkit";

const result = await runScraperById("reddit-random-subreddit-image", {
  contactEmail: "bot@example.com",
  limit: 1,
  params: {
    subreddit: "wallpapers",
  },
});

const allowedNsfwChannelIds = parseDiscordChannelIdList(
  process.env.DISCORD_ALLOWED_NSFW_CHANNEL_IDS,
);

const messages = resultToDiscordMessages(result, {
  channel: buildDiscordChannelContext(
    {
      id: "123456789012345678",
      name: "general",
      nsfw: false,
    },
    {
      nsfwEnabledChannelIds: allowedNsfwChannelIds,
    },
  ),
  includeImages: true,
});
```

Weather cadence example:

```js
import {
  buildDiscordScheduleProfile,
  nextDiscordScheduledRunAt,
  resultToDiscordMessages,
  runScraperById,
  shouldRunDiscordSchedule,
} from "open-scrapers-toolkit";

const profile = buildDiscordScheduleProfile("every-3-hours");

if (shouldRunDiscordSchedule(process.env.DISCORD_WEATHER_LAST_RUN_AT, profile.schedule)) {
  const weatherResult = await runScraperById("open-meteo-city-forecast", {
    contactEmail: "bot@example.com",
    limit: 4,
  });

  const messages = resultToDiscordMessages(weatherResult, {
    style: "auto",
    weatherCadenceHours: profile.weatherCadenceHours,
  });

  console.log(nextDiscordScheduledRunAt(profile.schedule).toISOString(), messages.length);
}
```

## Export and file-saving choices

The library functions are intentionally centered on in-process results. Use the CLI when you want:

- JSON, CSV, or NDJSON files written for you
- one-off maintenance jobs
- shell-friendly health reporting
- bulk-link ingestion from a text file path

## When to use the CLI instead

Prefer the CLI when you want:

- saved JSON, CSV, or NDJSON output
- shell automation
- GitHub Actions jobs
- ad hoc debugging
- bulk link ingestion from files

Prefer the library when you want:

- in-process app usage
- bot commands
- API endpoints
- schedulers or queues you already own

## Good usage practices

- Keep per-command limits low in bots.
- Pass a contact email when you can.
- Use caching carefully when your use case values lower source traffic over the freshest possible response.
- Respect source-specific policies and rate limits.
- Treat AI enrichment as optional convenience, not source truth.
- Avoid exposing every scraper to every user if your bot serves multiple audiences.
