# Installation And Quick Start

```bash
npm install
npx tsx src/cli.ts list
npx tsx src/cli.ts run nasa-breaking-news --limit 5
npx tsx src/cli.ts health --format table
```

The CLI auto-loads a repo-root `.env` file through `dotenv`. Copy `.env.example` to `.env` if you want reusable local defaults.

Current catalogue size:

- 84 scrapers total
- 18 news
- 3 weather
- 17 reports
- 46 academic

Install for app or bot usage:

```bash
npm install github:Ninezel/open-scrapers-toolkit
```

Detailed follow-up pages:

- [Environment Variables](Environment-Variables)
- [Library Usage](Library-Usage)
- [API Reference](API-Reference)
- [Discord Bot Integration](Discord-Bot-Integration)
- [Scraper Catalogue](Scraper-Catalog)
- [Roadmap](Roadmap)

Bulk-link example:

```bash
npx tsx src/cli.ts scrape-links examples/url-lists/demo-links.txt --output output/links-digest.json
```

Discord examples:

- `examples/discord-bots/discordjs-message-command.mjs`
- `examples/discord-bots/discordjs-subreddit-image-command.mjs`
- `examples/automation/discord-weather-scheduler.mjs`

Docker:

```bash
docker build -t open-scrapers-toolkit .
docker run --rm open-scrapers-toolkit list
```
