# API Reference

This page is the detailed function guide for developers using Open Scrapers Toolkit inside bots, apps, web servers, schedulers, or automation workers.

Use this page when you want to know:

- which function to call first
- what options to pass
- what each function returns
- when to use one helper instead of another
- how the Discord helpers fit into a bot workflow

## Install and import

Install from GitHub:

```bash
npm install github:Ninezel/open-scrapers-toolkit
```

Typical root import:

```js
import {
  getScraperCatalog,
  resolveScraperPrompt,
  runScraperById,
  runScraperPrompt,
  resultToDiscordMessages,
} from "open-scrapers-toolkit";
```

Discord-only subpath:

```js
import {
  buildDiscordScraperSlashCommandDefinition,
  runScraperPromptToDiscordMessages,
  runScraperToDiscordMessages,
} from "open-scrapers-toolkit/discord";
```

## Most common bot workflow

For most Discord bots, the normal flow is:

1. Use `getScraperCatalog()` or a fixed scraper ID to decide what to run.
2. Call `runScraperById()` with `contactEmail`, `limit`, and any scraper `params`.
3. If the result is going into Discord, call `resultToDiscordMessages()`.
4. Reply with each returned message payload in your Discord library.

For a natural-language `/scraper` flow, use `runScraperPromptToDiscordMessages()` instead of steps 1 and 2.

Example:

```js
import {
  buildDiscordChannelContext,
  parseDiscordChannelIdList,
  resultToDiscordMessages,
  runScraperById,
} from "open-scrapers-toolkit";

const result = await runScraperById("bbc-world-news", {
  contactEmail: "bot@example.com",
  limit: 3,
});

const allowedNsfwChannelIds = parseDiscordChannelIdList(
  process.env.DISCORD_ALLOWED_NSFW_CHANNEL_IDS,
);

const messages = resultToDiscordMessages(result, {
  channel: buildDiscordChannelContext(
    {
      id: message.channel?.id,
      name: "name" in message.channel ? message.channel.name : undefined,
      nsfw: message.channel?.nsfw === true,
    },
    {
      nsfwEnabledChannelIds: allowedNsfwChannelIds,
    },
  ),
  includeImages: true,
  maxRecords: 3,
  style: "auto",
});
```

## Shared option types

### `LibraryContextOptions`

Used by the main runner helpers.

Fields:

- `cacheTtlMs`
  Enables local GET caching for supported requests.
- `contactEmail`
  Recommended for polite public-source access and default user-agent generation.
- `limit`
  Maximum number of records to return from one scraper.
- `now`
  Optional fixed clock, mainly useful for tests.
- `outputDir`
  Optional file-output base path used by some helper flows.
- `params`
  Scraper-specific parameters such as `subreddit`, `country`, `query`, `latitude`, or `longitude`.
- `retryCount`
  Retry attempts for transient request failures.
- `retryDelayMs`
  Base delay between retries.
- `userAgent`
  Explicit override for the default user agent.

### `RunManyOptions`

Used by helpers that run more than one scraper.

Extra fields:

- `category`
  Filters the catalogue to a single category such as `news`, `weather`, `reports`, or `academic`.
- `search`
  Filters the catalogue by text before execution.

### `ScraperPromptResolveOptions`

Used by `resolveScraperPrompt()` and `runScraperPrompt()`.

Extra fields:

- `locationResolver`
  Optional override for location lookup during weather and air-quality prompts.

### `DiscordRenderOptions`

Used when converting results into Discord message payloads.

Fields:

- `channel`
  A `DiscordChannelContext` used for NSFW/SFW validation.
- `includeImages`
  When `true`, image URLs are added to embeds when available.
- `includeMetadata`
  When `true`, raw record metadata is shown in embeds. Usually keep this `false` in user-facing bots.
- `maxEmbedsPerMessage`
  Controls embed chunking. Discord commonly allows up to 10 embeds per message.
- `maxRecords`
  Limits how many records are turned into embeds.
- `style`
  Use `"default"`, `"weather-card"`, or `"auto"`. `"auto"` chooses weather-card mode for weather results.
- `throwOnUnsafeContent`
  Throw an error instead of silently filtering blocked NSFW records.
- `titlePrefix`
  Adds a prefix to embed titles in default mode.
- `weatherCadenceHours`
  Used by the weather formatter to choose hourly or multi-hour forecast slices.

## Catalogue and Runner Helpers

### `getScraperCatalog(options?)`

Purpose:

- list the catalogue in code
- build slash-command choices
- filter available scrapers by text or category

Returns:

- an array of catalogue entries with `id`, `name`, `category`, `description`, `homepage`, `sourceName`, `defaults`, and `params`

### `createScraperContext(scraper, options?)`

Purpose:

- build the internal normalised context passed into scraper modules

Most app developers should use `runScraperById()` instead.

### `runScraper(scraper, options?)`

Purpose:

- run a scraper definition directly

Returns:

- one normalised `ScrapeResult`

### `runScraperById(scraperId, options?)`

Purpose:

- run one scraper by its ID

Best for:

- most app and bot workflows
- command-based bots
- API routes that expose one specific scraper

Returns:

- one `ScrapeResult`

### `runScrapersByCategory(category, options?)`

Purpose:

- run every scraper in one category

Returns:

- an array of `ScrapeResult` objects, one per scraper

### `runScrapersFromCatalog(options?)`

Purpose:

- run a filtered slice of the catalogue using `category` and `search`

Returns:

- an array of `ScrapeResult` objects

### `runLibraryHealth(options?)`

Purpose:

- run the built-in health workflow from code

Returns:

- a `ScrapeResult` where each record describes a scraper health outcome

## Prompt-router helpers

### `resolveScraperPrompt(prompt, options?)`

Use this when you want to inspect how a natural-language request would be routed before you run a source.

Returns a `ScraperPromptResolution` with:

- `scraperId`
- `category`
- `intent`
- `confidence`
- `params`
- `queryText`
- `reason`

### `runScraperPrompt(prompt, options?)`

Use this when you want prompt routing plus the normalised scraper result in one call.

Returns:

- `resolution`
- `result`

### `resolveOpenMeteoLocation(context, query)`

Geocodes a place name into Open-Meteo-ready coordinates. Useful for advanced custom weather flows and for understanding how the built-in prompt router resolves places.

## Publisher helpers

### `postJsonWebhook(url, payload, headers?)`

Purpose:

- send any JSON payload to a webhook endpoint

Returns:

- `PublishResponse` with `status` and `target`

### `publishResultSnapshot(result, targetPath, format?)`

Purpose:

- save a normalised result to disk as JSON, CSV, NDJSON, or all supported formats

Returns:

- an array of written file paths

### `buildHealthAlertResult(healthResult, statuses?)`

Purpose:

- turn a full health report into a smaller alert-only report

## Reddit image helper

### `fetchRandomSubredditImageRecords(context, options)`

Purpose:

- fetch image posts from a subreddit through Reddit's OAuth API
- normalise them into standard scraper records
- apply the NSFW rule before returning them

Important requirements:

- you must configure `REDDIT_ACCESS_TOKEN` or both `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`
- you should set a good `REDDIT_USER_AGENT`

Important options:

- `subreddit`
- `allowNsfw`
- `sort`
- `timeWindow`
- `sampleSize`

Returns:

- `RedditImageFetchResult` containing `records`, `endpoint`, `listingSize`, `sort`, `subreddit`, and `timeWindow`

## Discord helper overview

There are three main Discord helper groups:

- safety helpers
- scheduling helpers
- rendering helpers

Use them together like this:

1. Build a safe `channel` context.
2. Run a scraper.
3. Convert the result into Discord messages.
4. Optionally publish the messages to a webhook.

## Discord safety helpers

### `parseDiscordChannelIdList(value)`

Purpose:

- parse a comma-separated channel ID string into a clean unique list

### `buildDiscordChannelContext(channel, options?)`

Purpose:

- build the `DiscordChannelContext` used by the NSFW filter logic

Important behaviour:

- a channel only gets `allowNsfw=true` when the channel is actually NSFW and your policy allows it

### `inferDiscordRecordContentRating(record)`

Purpose:

- tell whether a normalised record should be treated as `sfw` or `nsfw`

### `validateDiscordRecordForChannel(record, channel?)`

Purpose:

- return a structured allow/block decision for one record in one channel

Returns:

- `DiscordSafetyDecision`

### `assertDiscordRecordAllowedForChannel(record, channel?)`

Purpose:

- enforce the same rule as `validateDiscordRecordForChannel()` but throw on failure

### `filterDiscordResultForChannel(result, channel?)`

Purpose:

- split a full result into allowed and blocked records

Returns:

- `DiscordFilterResult`

## Discord scheduling helpers

### `buildDiscordScheduleProfile(mode, options?)`

Purpose:

- create a reusable schedule preset for bots

Supported modes:

- `on-demand`
- `hourly`
- `every-3-hours`
- `custom`

Returns:

- `DiscordScheduleProfile`

### `nextDiscordScheduledRunAt(options?, from?)`

Purpose:

- calculate the next time a recurring bot post should run

### `shouldRunDiscordSchedule(lastRunAt, options?, now?)`

Purpose:

- decide if a recurring bot task should run now

### `selectWeatherCadenceRecords(result, options?)`

Purpose:

- pick a smaller forecast subset for Discord weather posting

## Discord rendering helpers

### `buildDiscordScraperChoices(options?)`

Purpose:

- build catalogue-backed bot choices shaped for Discord selectors

Returns:

- an array of `{ name, value }`

### `buildDiscordScraperSlashCommandDefinition(options?)`

Builds a plain-object Discord slash-command definition for `/scraper`.

### `runScraperPromptToDiscordMessages(prompt, options?)`

Runs the natural-language prompt router, executes the chosen scraper, and returns:

- `resolution`
- `result`
- `messages`

### `recordToDiscordEmbed(result, record, options?)`

Purpose:

- format one record as one Discord embed

### `resultToDiscordMessages(result, options?)`

Purpose:

- convert one normalised result into one or more Discord message payloads

Built-in behaviour:

- filters blocked NSFW records
- optionally throws on unsafe records
- chunks embeds by `maxEmbedsPerMessage`
- applies weather-card formatting in weather mode
- uses cadence filtering for weather results

Returns:

- `DiscordMessagePayload[]`

### `runScraperToDiscordMessages(scraperId, options?)`

Purpose:

- combine `runScraperById()` and `resultToDiscordMessages()` into one call

Returns:

- `DiscordMessagePayload[]`

### `publishDiscordWebhookMessages(webhookUrl, result, options?)`

Purpose:

- publish Discord-formatted messages to a Discord-compatible webhook

Returns:

- an array of `PublishResponse` objects, one per sent message

## Which helper should I use?

Use:

- `runScraperById()` when you know exactly which scraper to run
- `getScraperCatalog()` when users need to discover or choose scrapers
- `resultToDiscordMessages()` when you already have a result and want Discord output
- `runScraperToDiscordMessages()` when you want a one-call bot flow
- `buildDiscordChannelContext()` when your bot needs safe NSFW handling
- `buildDiscordScheduleProfile()` when your bot posts on a schedule
- `publishDiscordWebhookMessages()` when you are posting to Discord webhooks instead of a logged-in bot client
- `buildHealthAlertResult()` when you only want health failures and skips

## Recommended next pages

- [Library Usage](Library-Usage)
- [Discord Bot Integration](Discord-Bot-Integration)
- [Automation And Publishers](Automation-And-Publishers)
- [Environment Variables](Environment-Variables)
