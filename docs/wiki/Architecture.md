# Architecture

Important modules:

- `src/cli.ts`
- `src/index.ts`
- `src/library.ts`
- `src/integrations/discord.ts`
- `src/publishers.ts`
- `src/core/cache.ts`
- `src/core/http.ts`
- `src/core/rss.ts`
- `src/core/html.ts`
- `src/core/ai.ts`
- `src/core/factories.ts`
- `src/core/output.ts`
- `src/core/health.ts`
- `src/scrapers/`

The CLI builds a `ScraperContext`, runs one or more scrapers, normalises outputs into a shared result shape, and then prints, saves, or publishes outputs. The same shared modules now also back programmatic Node usage, health alert publishing, and Discord bot integrations.
