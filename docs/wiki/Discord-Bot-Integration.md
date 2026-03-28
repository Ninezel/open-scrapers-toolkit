# Discord Bot Integration

Open Scrapers Toolkit can be used directly inside Discord bots and other Node applications.

For a full exported-helper reference, see [API Reference](API-Reference).

## Install

```bash
npm install github:Ninezel/open-scrapers-toolkit
```

## Main library exports

- catalogue helpers
- registry helpers
- programmatic scraper runners
- Discord message/embed formatters
- Discord webhook publishing helpers
- Discord channel-safety, channel-policy, and schedule helpers

## Typical flow

1. Run a scraper by ID with `runScraperById()`
2. Format the normalised payload with `resultToDiscordMessages()`
3. Send the resulting payloads through your Discord library

## Safety and presentation

The Discord helpers now cover:

- NSFW/SFW channel validation
- channel-policy helpers for explicit NSFW channel allow-lists
- image-aware embeds for Reddit and other image-bearing records
- richer weather cards for forecast, air-quality, and alert scrapers
- interval helpers and delivery-mode profiles for hourly or every-3-hours posting workflows

## Example

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
      id: "123456789012345678",
      nsfw: false,
    },
    {
      nsfwEnabledChannelIds: allowedNsfwChannelIds,
    },
  ),
  includeImages: true,
  maxRecords: 3,
  maxEmbedsPerMessage: 3,
  style: "auto",
});
```

Convenience helper:

```js
import { runScraperToDiscordMessages } from "open-scrapers-toolkit/discord";
```

Starter file:

- `examples/discord-bots/discordjs-message-command.mjs`
- `examples/discord-bots/discordjs-subreddit-image-command.mjs`

Reddit image scraper notes:

- use `reddit-random-subreddit-image`
- pass `subreddit=<name>`
- configure Reddit OAuth credentials first
- only allow NSFW posts in validated NSFW channels

Weather posting notes:

- use `style: "auto"` or `style: "weather-card"`
- use `buildDiscordScheduleProfile("hourly")` for hourly updates
- use `buildDiscordScheduleProfile("every-3-hours")` for every-3-hours digests

Related automation examples:

- `examples/automation/discord-health-alerts.mjs`
- `examples/automation/discord-weather-scheduler.mjs`

Keep bot limits polite and pass a contact email where possible.

Related pages:

- [Library Usage](Library-Usage)
- [Scraper Catalogue](Scraper-Catalog)
- [Roadmap](Roadmap)
