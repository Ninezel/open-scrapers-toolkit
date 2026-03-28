# Discord Bot Integration

Open Scrapers Toolkit can now be used as a regular TypeScript library inside Discord bots and other Node applications.

## Install

From GitHub:

```bash
npm install github:Ninezel/open-scrapers-toolkit
```

The repository now ships a `prepare` script and declaration output so Git installs build the library automatically.

## What the library exposes

Root package exports:

- scraper catalog helpers
- scraper registry helpers
- programmatic runner functions from `src/library.ts`
- Discord message/embed formatters from `src/integrations/discord.ts`

Discord-specific subpath export:

```js
import { resultToDiscordMessages, runScraperToDiscordMessages } from "open-scrapers-toolkit/discord";
```

## Typical Discord bot flow

1. Receive a bot command such as `!scrape bbc-world-news`
2. Call `runScraperById()` with a contact email, limit, and any scraper parameters
3. Convert the normalized result into Discord payloads with `resultToDiscordMessages()`
4. Send the payloads with `message.reply()`, `interaction.followUp()`, or the equivalent call in your Discord library

## Basic example

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

## Parameters and safety

- Keep `limit` low for chat-oriented commands.
- Pass `contactEmail` when you can so public data providers have a useful identifier.
- Only expose scrapers that make sense for your bot audience.
- Respect source-specific policies, rate limits, and fair-use expectations.
- Treat optional AI enrichment as a convenience step, not a source of truth.

## Example starter

See:

- `examples/discord-bots/discordjs-message-command.mjs`
