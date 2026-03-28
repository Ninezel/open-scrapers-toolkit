# Library Usage

Open Scrapers Toolkit can be used directly in Node applications, bots, and automation workers.

If your app depends on `.env` values, load them in the host process first. The CLI auto-loads `.env`, but the library exports do not.

For a function-by-function breakdown of the exported helpers, read [API Reference](API-Reference) alongside this page.

## Install

```bash
npm install github:Ninezel/open-scrapers-toolkit
```

## Main exports

- `getScraperCatalog()`
- `runScraper()`
- `runScraperById()`
- `resolveScraperPrompt()`
- `runScraperPrompt()`
- `runScrapersByCategory()`
- `runScrapersFromCatalog()`
- `runLibraryHealth()`
- `postJsonWebhook()`
- `publishResultSnapshot()`
- `buildHealthAlertResult()`
- `publishDiscordWebhookMessages()`
- `resultToDiscordMessages()`
- `buildDiscordChannelContext()`
- `buildDiscordScraperSlashCommandDefinition()`
- `buildDiscordScheduleProfile()`
- `buildDiscordScraperChoices()`
- `nextDiscordScheduledRunAt()`
- `parseDiscordChannelIdList()`
- `runScraperPromptToDiscordMessages()`
- `shouldRunDiscordSchedule()`
- `selectWeatherCadenceRecords()`
- `fetchRandomSubredditImageRecords()`

Discord-only helper import:

```js
import { runScraperToDiscordMessages } from "open-scrapers-toolkit/discord";
```

## Common flow

1. Discover a scraper from the catalogue.
2. Run it with limits and parameters.
3. Use the normalised result in your own code.
4. Optionally render it to Discord-style payloads.

Discord-focused helpers now cover:

- channel-safety filtering for NSFW-tagged records
- channel-policy helpers for whitelisting specific NSFW Discord channels
- prompt routing for natural-language bot questions
- weather-card formatting with hourly or 3-hour cadence selection
- schedule helpers for bots that post on an interval
- random subreddit image fetching for bots with Reddit OAuth credentials

## Example

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

Useful library options:

- `cacheTtlMs`
- `retryCount`
- `retryDelayMs`
- `contactEmail`
- `limit`

Prompt-routing example:

```js
import { runScraperPrompt } from "open-scrapers-toolkit";

const execution = await runScraperPrompt("Give me academic records of Vatican Church", {
  contactEmail: "bot@example.com",
  limit: 3,
});
```
- `params`
- `outputDir`

Example Discord-safe render:

```js
import {
  buildDiscordChannelContext,
  parseDiscordChannelIdList,
  resultToDiscordMessages,
} from "open-scrapers-toolkit";

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
  style: "auto",
});
```

## Good practices

- keep bot limits low
- pass a contact email where possible
- use cache and retry settings thoughtfully
- respect source-specific limits and policies
- use the CLI for file exports and shell automation
- use the library for in-process bot and app integrations
