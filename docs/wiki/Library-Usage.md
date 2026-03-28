# Library Usage

Open Scrapers Toolkit can be used directly in Node applications, bots, and automation workers.

## Install

```bash
npm install github:Ninezel/open-scrapers-toolkit
```

## Main exports

- `getScraperCatalog()`
- `runScraper()`
- `runScraperById()`
- `runScrapersByCategory()`
- `runScrapersFromCatalog()`
- `runLibraryHealth()`
- `postJsonWebhook()`
- `publishResultSnapshot()`
- `buildHealthAlertResult()`
- `resultToDiscordMessages()`

Discord-only helper import:

```js
import { runScraperToDiscordMessages } from "open-scrapers-toolkit/discord";
```

## Common flow

1. Discover a scraper from the catalog.
2. Run it with limits and parameters.
3. Use the normalized result in your own code.
4. Optionally render it to Discord-style payloads.

## Example

```js
import { getScraperCatalog, runScraperById } from "open-scrapers-toolkit";

const catalog = getScraperCatalog({
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
- `params`
- `outputDir`

## Good practices

- keep bot limits low
- pass a contact email where possible
- use cache and retry settings thoughtfully
- respect source-specific limits and policies
- use the CLI for file exports and shell automation
- use the library for in-process bot and app integrations
