# Prompt Routing

Open Scrapers Toolkit now includes a natural-language prompt router for bot and app authors.

Example prompts:

- `What is the weather in London`
- `Give me academic records of Vatican Church`
- `Show me BBC science news`
- `Get me a random image from r/wallpapers`

Main helpers:

- `resolveScraperPrompt()`
- `runScraperPrompt()`
- `runScraperPromptToDiscordMessages()`
- `buildDiscordScraperSlashCommandDefinition()`

Current routing support:

- weather and air quality
- weather alerts
- earthquakes
- academic search
- report/document search
- subreddit image requests
- named-source catalogue matching

CLI test examples:

```bash
npx tsx src/cli.ts ask "What is the weather in London"
npx tsx src/cli.ts ask "Give me academic records of Vatican Church" --resolve-only
```

Library example:

```js
import { runScraperPrompt } from "open-scrapers-toolkit";

const execution = await runScraperPrompt("Give me academic records of Vatican Church", {
  contactEmail: "bot@example.com",
  limit: 5,
});
```

Discord example:

```js
import {
  buildDiscordScraperSlashCommandDefinition,
  runScraperPromptToDiscordMessages,
} from "open-scrapers-toolkit/discord";

const command = buildDiscordScraperSlashCommandDefinition();
const execution = await runScraperPromptToDiscordMessages(
  "What is the weather in London",
  {
    contactEmail: "bot@example.com",
    includeImages: true,
    limit: 3,
    maxRecords: 3,
    style: "auto",
  },
);
```

Use prompt routing when you want a friendly `/scraper` command. Use direct scraper IDs when your workflow already knows exactly which source to call.
