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
  runScraperById,
  resultToDiscordMessages,
} from "open-scrapers-toolkit";
```

Discord-only subpath:

```js
import { runScraperToDiscordMessages } from "open-scrapers-toolkit/discord";
```

## Most common bot workflow

For most Discord bots, the normal flow is:

1. Use `getScraperCatalog()` or a fixed scraper ID to decide what to run.
2. Call `runScraperById()` with `contactEmail`, `limit`, and any scraper `params`.
3. If the result is going into Discord, call `resultToDiscordMessages()`.
4. Reply with each returned message payload in your Discord library.

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

Best for:

- setup flows
- autocomplete
- bot help commands
- admin dashboards

Input:

```ts
getScraperCatalog({
  category?: string;
  search?: string;
})
```

Returns:

- an array of catalogue entries with `id`, `name`, `category`, `description`, `homepage`, `sourceName`, `defaults`, and `params`

Example:

```js
const weatherCatalogue = getScraperCatalog({
  category: "weather",
});
```

### `createScraperContext(scraper, options?)`

Purpose:

- build the internal normalised context passed into scraper modules

Best for:

- advanced integrations
- tests
- custom workflows where you already have a scraper definition object

Most app developers should use `runScraperById()` instead.

### `runScraper(scraper, options?)`

Purpose:

- run a scraper definition directly

Best for:

- advanced usage when you already obtained a `ScraperDefinition`

Returns:

- one normalised `ScrapeResult`

### `runScraperById(scraperId, options?)`

Purpose:

- run one scraper by its ID

Best for:

- most app and bot workflows
- command-based bots
- API routes that expose one specific scraper

Input:

```ts
runScraperById(scraperId: string, options?: LibraryContextOptions)
```

Returns:

- one `ScrapeResult`

Throws:

- if the scraper ID does not exist
- if required params are missing
- if the upstream source request fails

Example:

```js
const result = await runScraperById("reddit-random-subreddit-image", {
  contactEmail: "bot@example.com",
  limit: 1,
  params: {
    subreddit: "wallpapers",
    allowNsfw: "false",
  },
});
```

### `runScrapersByCategory(category, options?)`

Purpose:

- run every scraper in one category

Best for:

- scheduled data pulls
- maintenance jobs
- reporting dashboards

Returns:

- an array of `ScrapeResult` objects, one per scraper

### `runScrapersFromCatalog(options?)`

Purpose:

- run a filtered slice of the catalogue using `category` and `search`

Best for:

- “run all World Bank scrapers”
- “run all weather scrapers”
- admin-side grouped data pulls

Returns:

- an array of `ScrapeResult` objects

### `runLibraryHealth(options?)`

Purpose:

- run the built-in health workflow from code

Best for:

- internal monitoring
- Discord or webhook health alerts
- scheduled reliability checks

Returns:

- a `ScrapeResult` where each record describes a scraper health outcome

## Publisher helpers

### `postJsonWebhook(url, payload, headers?)`

Purpose:

- send any JSON payload to a webhook endpoint

Best for:

- generic integrations
- custom dashboards
- app-owned webhook receivers

Returns:

- `PublishResponse` with `status` and `target`

### `publishResultSnapshot(result, targetPath, format?)`

Purpose:

- save a normalised result to disk as JSON, CSV, NDJSON, or all supported formats

Best for:

- audit trails
- local snapshots
- app workflows that want CLI-style exports

Returns:

- an array of written file paths

### `buildHealthAlertResult(healthResult, statuses?)`

Purpose:

- turn a full health report into a smaller alert-only report

Best for:

- Discord health alert posts
- error-only notifications
- “only tell me if something broke” automation

Example:

```js
const health = await runLibraryHealth();
const alerts = buildHealthAlertResult(health, "error,skipped");
```

## Reddit image helper

### `fetchRandomSubredditImageRecords(context, options)`

Purpose:

- fetch image posts from a subreddit through Reddit's OAuth API
- normalise them into standard scraper records
- apply the NSFW rule before returning them

Best for:

- image commands
- meme or wallpaper bots
- NSFW/SFW channel-aware subreddit posting

Important requirements:

- you must configure `REDDIT_ACCESS_TOKEN` or both `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`
- you should set a good `REDDIT_USER_AGENT`

Important options:

- `subreddit`
  Required subreddit name such as `wallpapers` or `EarthPorn`.
- `allowNsfw`
  Whether NSFW posts may be included.
- `sort`
  `hot`, `new`, `rising`, or `top`.
- `timeWindow`
  Useful with `top`, such as `day`, `week`, or `month`.
- `sampleSize`
  How many posts to sample before random selection.

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

Best for:

- environment variables like `DISCORD_ALLOWED_NSFW_CHANNEL_IDS`

Example:

```js
const ids = parseDiscordChannelIdList("123,456,123");
```

Returns:

- `["123", "456"]`

### `buildDiscordChannelContext(channel, options?)`

Purpose:

- build the `DiscordChannelContext` used by the NSFW filter logic

Important behaviour:

- a channel only gets `allowNsfw=true` when the channel is actually NSFW and your policy allows it
- this prevents “bot config says yes” from overriding a non-NSFW channel

Best for:

- real Discord message handlers
- channel-safe subreddit image commands
- channel-safe media bots

Example:

```js
const channel = buildDiscordChannelContext(
  {
    id: message.channel.id,
    name: message.channel.name,
    nsfw: message.channel.nsfw === true,
  },
  {
    nsfwEnabledChannelIds: parseDiscordChannelIdList(
      process.env.DISCORD_ALLOWED_NSFW_CHANNEL_IDS,
    ),
  },
);
```

### `inferDiscordRecordContentRating(record)`

Purpose:

- tell whether a normalised record should be treated as `sfw` or `nsfw`

Best for:

- moderation logic
- debug logging
- custom safety policies

### `validateDiscordRecordForChannel(record, channel?)`

Purpose:

- return a structured allow/block decision for one record in one channel

Returns:

- `DiscordSafetyDecision` with `allowed`, `channelRating`, `contentRating`, and optional `reason`

Use this when:

- you want to inspect the decision before sending
- you want your own logging or moderation output

### `assertDiscordRecordAllowedForChannel(record, channel?)`

Purpose:

- enforce the same rule as `validateDiscordRecordForChannel()` but throw on failure

Use this when:

- your workflow should stop immediately on unsafe content

### `filterDiscordResultForChannel(result, channel?)`

Purpose:

- split a full result into allowed and blocked records

Returns:

- `DiscordFilterResult` with `allowedRecords` and `blockedRecords`

Use this when:

- you want to log blocked records
- you want to show moderation metrics
- you want custom handling instead of the built-in formatter behaviour

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

- `DiscordScheduleProfile` with:
  - `label`
  - `mode`
  - `schedule`
  - `weatherCadenceHours`

Use this when:

- you want one config object for both scheduler logic and weather-card formatting

Example:

```js
const profile = buildDiscordScheduleProfile("every-3-hours");
```

### `nextDiscordScheduledRunAt(options?, from?)`

Purpose:

- calculate the next time a recurring bot post should run

Best for:

- logs
- dashboards
- scheduling previews

### `shouldRunDiscordSchedule(lastRunAt, options?, now?)`

Purpose:

- decide if a recurring bot task should run now

Best for:

- cron jobs
- interval workers
- Discord weather loops

### `selectWeatherCadenceRecords(result, options?)`

Purpose:

- pick a smaller forecast subset for Discord weather posting

Important behaviour:

- starts from the active forecast window when possible
- supports hourly or every-N-hours style spacing

Best for:

- hourly weather commands
- every-3-hours weather digests
- reduced-noise weather embeds

## Discord rendering helpers

### `buildDiscordScraperChoices(options?)`

Purpose:

- build catalogue-backed bot choices shaped for Discord selectors

Best for:

- slash command autocomplete
- help commands
- bot config panels

Returns:

- an array of `{ name, value }`

### `recordToDiscordEmbed(result, record, options?)`

Purpose:

- format one record as one Discord embed

Best for:

- advanced bots that want to control message-level assembly themselves

### `resultToDiscordMessages(result, options?)`

Purpose:

- convert one normalised result into one or more Discord message payloads

Built-in behaviour:

- filters blocked NSFW records
- optionally throws on unsafe records
- chunks embeds by `maxEmbedsPerMessage`
- applies weather-card formatting in weather mode
- uses cadence filtering for weather results

Best for:

- most Discord bots
- commands that just want ready-to-send payloads

Returns:

- `DiscordMessagePayload[]`

Example:

```js
const messages = resultToDiscordMessages(result, {
  channel,
  includeImages: true,
  maxRecords: 3,
  maxEmbedsPerMessage: 3,
  style: "auto",
});
```

### `runScraperToDiscordMessages(scraperId, options?)`

Purpose:

- combine `runScraperById()` and `resultToDiscordMessages()` into one call

Best for:

- simple Discord bots
- direct command-to-output flows

Returns:

- `DiscordMessagePayload[]`

### `publishDiscordWebhookMessages(webhookUrl, result, options?)`

Purpose:

- publish Discord-formatted messages to a Discord-compatible webhook

Best for:

- alerting
- webhook-only publishing flows
- botless Discord posting

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

## Recommended starting points

Read these next:

- [Library Usage](library-usage.md)
- [Discord Bot Integration](discord-bots.md)
- [Automation And Publishers](automation.md)
- [Environment Variables](environment-variables.md)
