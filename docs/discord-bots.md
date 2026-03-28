# Discord Bot Integration

Open Scrapers Toolkit can now be used as a regular TypeScript library inside Discord bots and other Node applications.

For a function-by-function reference covering every bot-facing helper, see [api-reference.md](api-reference.md).

## Install

From GitHub:

```bash
npm install github:Ninezel/open-scrapers-toolkit
```

The repository now ships a `prepare` script and declaration output so Git installs build the library automatically.

## What the library exposes

Root package exports:

- scraper catalogue helpers
- scraper registry helpers
- programmatic runner functions from `src/library.ts`
- Discord message/embed formatters from `src/integrations/discord.ts`
- Discord scheduling, channel-policy, scraper-choice, and safety helpers from `src/integrations/discord.ts`

Discord-specific subpath export:

```js
import { resultToDiscordMessages, runScraperToDiscordMessages } from "open-scrapers-toolkit/discord";
```

## Typical Discord bot flow

1. Receive a bot command such as `!scrape bbc-world-news`
2. Call `runScraperById()` with a contact email, limit, and any scraper parameters
3. Convert the normalised result into Discord payloads with `resultToDiscordMessages()`
4. Send the payloads with `message.reply()`, `interaction.followUp()`, or the equivalent call in your Discord library

## Basic example

```js
import { resultToDiscordMessages, runScraperById } from "open-scrapers-toolkit";

const result = await runScraperById("bbc-world-news", {
  contactEmail: "bot@example.com",
  limit: 3,
});

const messages = resultToDiscordMessages(result, {
  channel: {
    allowNsfw: false,
    isNsfw: false,
    name: "general",
  },
  includeImages: true,
  maxRecords: 3,
  maxEmbedsPerMessage: 3,
  style: "auto",
});
```

Each message is returned as a plain object shaped like:

```js
{
  content: "...",
  embeds: [
    {
      title: "...",
      description: "...",
      url: "...",
      fields: [...],
      footer: { text: "..." },
      timestamp: "..."
    }
  ]
}
```

That keeps the formatter compatible with `discord.js`, `oceanic.js`, `detritus-client`, and other libraries that accept Discord-style payload objects.

## Convenience helper

If you want one call that both runs the scraper and formats the output:

```js
import { runScraperToDiscordMessages } from "open-scrapers-toolkit/discord";

const messages = await runScraperToDiscordMessages("nasa-breaking-news", {
  contactEmail: "bot@example.com",
  limit: 2,
});
```

If you want to publish a result to a Discord webhook:

```js
import { publishDiscordWebhookMessages, runScraperById } from "open-scrapers-toolkit";

const result = await runScraperById("un-news-health", {
  contactEmail: "bot@example.com",
  limit: 3,
});

await publishDiscordWebhookMessages("https://discord.com/api/webhooks/...", result);
```

## NSFW and channel safety

The Discord helpers are safe by default:

- NSFW-tagged records are filtered out unless you explicitly mark the channel as NSFW and enable `allowNsfw`
- subreddit image posts include `nsfw` metadata so the safety filter can make the right decision
- `filterDiscordResultForChannel()` and `validateDiscordRecordForChannel()` are available if you want to enforce the rule before you send anything

Example:

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
      id: message.channel?.id,
      name: "name" in message.channel ? message.channel.name : undefined,
      nsfw: message.channel?.nsfw === true,
    },
    {
      nsfwEnabledChannelIds: allowedNsfwChannelIds,
    },
  ),
});
```

## Weather card formatting and cadence helpers

Weather scrapers now render more presentable Discord cards when you use `style: "auto"` or `style: "weather-card"`.

Useful helpers:

- `buildDiscordScheduleProfile()`
- `selectWeatherCadenceRecords()`
- `nextDiscordScheduledRunAt()`
- `shouldRunDiscordSchedule()`

This lets bot developers post:

- hourly updates
- every-3-hours digests
- on-demand command responses

Example:

```js
import { buildDiscordScheduleProfile, resultToDiscordMessages } from "open-scrapers-toolkit";

const profile = buildDiscordScheduleProfile("every-3-hours");

const messages = resultToDiscordMessages(weatherResult, {
  style: "auto",
  weatherCadenceHours: profile.weatherCadenceHours,
});
```

## Reddit image scraping

`reddit-random-subreddit-image` is a bot-friendly scraper for pulling a random image post from a subreddit.

Required parameter:

- `subreddit`

Important notes:

- the Reddit image workflow uses Reddit's OAuth-protected data API
- configure `REDDIT_ACCESS_TOKEN` or `REDDIT_CLIENT_ID` plus `REDDIT_CLIENT_SECRET`
- keep NSFW disabled unless your bot is intentionally posting to validated NSFW channels
- `DISCORD_ALLOWED_NSFW_CHANNEL_IDS` is useful for explicitly whitelisting the NSFW channels your bot is allowed to post into

## Parameters and safety

- Keep `limit` low for chat-oriented commands.
- Pass `contactEmail` when you can so public data providers have a useful identifier.
- Only expose scrapers that make sense for your bot audience.
- Respect source-specific policies, rate limits, and fair-use expectations.
- Treat optional AI enrichment as a convenience step, not a source of truth.

## Example starter

See:

- `examples/discord-bots/discordjs-message-command.mjs`
- `examples/discord-bots/discordjs-subreddit-image-command.mjs`
- `examples/automation/discord-weather-scheduler.mjs`
