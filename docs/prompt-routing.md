# Prompt Routing

Open Scrapers Toolkit now includes a natural-language prompt router so bot and app authors can accept inputs such as:

- `What is the weather in London`
- `Give me academic records of Vatican Church`
- `Show me BBC science news`
- `Get me a random image from r/wallpapers`

Instead of forcing every developer to hard-code scraper IDs, the router resolves the prompt to the most suitable scraper, fills in useful parameters, and then lets the normal library and Discord formatter layers do the rest.

## Main helpers

- `resolveScraperPrompt(prompt, options?)`
  Resolves a prompt into `{ scraperId, category, intent, confidence, params, reason }`.
- `runScraperPrompt(prompt, options?)`
  Resolves the prompt and immediately runs the chosen scraper.
- `runScraperPromptToDiscordMessages(prompt, options?)`
  Resolves the prompt, runs the scraper, and returns Discord-ready payloads.
- `buildDiscordScraperSlashCommandDefinition(options?)`
  Returns a plain-object slash-command definition ready for Discord API registration.

## What the router currently understands

- weather prompts
  Routes to `open-meteo-city-forecast`, including location lookup through Open-Meteo geocoding when the prompt includes a place.
- air-quality prompts
  Routes to `open-meteo-air-quality`.
- weather-alert prompts
  Routes to `nws-active-alerts`.
- earthquake prompts
  Routes to `usgs-earthquakes`.
- academic prompts
  Routes to:
  - `europepmc-academic-search` for health and biomedical research
  - `arxiv-academic-search` for technical and scientific research
  - `crossref-academic-search` for broad academic lookups
- report and document prompts
  Routes to `world-bank-document-search`.
- subreddit image prompts
  Routes to `reddit-random-subreddit-image`.
- named-source prompts
  Falls back to catalogue matching for prompts like `BBC science news` or `NASA breaking news`.

## Library example

```js
import { runScraperPrompt } from "open-scrapers-toolkit";

const execution = await runScraperPrompt("Give me academic records of Vatican Church", {
  contactEmail: "bot@example.com",
  limit: 5,
});

console.log(execution.resolution.scraperId);
console.log(execution.resolution.params);
console.log(execution.result.records.length);
```

## Discord slash-command example

```js
import {
  buildDiscordChannelContext,
  buildDiscordScraperSlashCommandDefinition,
  parseDiscordChannelIdList,
  runScraperPromptToDiscordMessages,
} from "open-scrapers-toolkit/discord";

const command = buildDiscordScraperSlashCommandDefinition();

const execution = await runScraperPromptToDiscordMessages(
  "What is the weather in London",
  {
    channel: buildDiscordChannelContext(
      {
        id: interaction.channel?.id,
        name:
          interaction.channel &&
          "name" in interaction.channel &&
          typeof interaction.channel.name === "string"
            ? interaction.channel.name
            : undefined,
        nsfw:
          interaction.channel &&
          "nsfw" in interaction.channel &&
          interaction.channel.nsfw === true,
      },
      {
        nsfwEnabledChannelIds: parseDiscordChannelIdList(
          process.env.DISCORD_ALLOWED_NSFW_CHANNEL_IDS,
        ),
      },
    ),
    contactEmail: "bot@example.com",
    includeImages: true,
    limit: 3,
    maxEmbedsPerMessage: 3,
    maxRecords: 3,
    style: "auto",
  },
);
```

## CLI testing

You can test the router without writing a bot:

```bash
npx tsx src/cli.ts ask "What is the weather in London"
npx tsx src/cli.ts ask "Give me academic records of Vatican Church" --resolve-only
```

`--resolve-only` prints just the routing decision, which is useful while you are tuning prompts or writing bot help text.

## Good usage guidance

- Keep prompt commands focused on one request at a time.
- Keep chat-facing limits low.
- Treat the router as a convenience layer, not a perfect intent classifier.
- Use `--resolve-only` or `resolveScraperPrompt()` while developing if you want to inspect what the toolkit would do before you run a live source.
- For highly structured workflows, you can still bypass the router and call `runScraperById()` directly.
