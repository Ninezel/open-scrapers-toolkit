# Discord Bot Integration

Open Scrapers Toolkit can be used directly inside Discord bots and other Node applications.

## Install

```bash
npm install github:Ninezel/open-scrapers-toolkit
```

## Main library exports

- catalog helpers
- registry helpers
- programmatic scraper runners
- Discord message/embed formatters

## Typical flow

1. Run a scraper by ID with `runScraperById()`
2. Format the normalized payload with `resultToDiscordMessages()`
3. Send the resulting payloads through your Discord library

## Example

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

Convenience helper:

```js
import { runScraperToDiscordMessages } from "open-scrapers-toolkit/discord";
```

Starter file:

- `examples/discord-bots/discordjs-message-command.mjs`

Keep bot limits polite and pass a contact email where possible.
