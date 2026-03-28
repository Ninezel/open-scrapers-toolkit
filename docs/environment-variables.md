# Environment Variables

This page lists the environment variables used by Open Scrapers Toolkit and explains where they apply.

## `.env` behaviour

The CLI loads a repo-root `.env` file automatically through `dotenv`.

Typical setup:

1. copy `.env.example` to `.env`
2. edit the values you want
3. run `npx tsx src/cli.ts ...` or `node dist/cli.js ...`

Library consumers should either:

- load environment variables in their own host app
- or pass explicit options to the library functions

The library surface does not auto-load `.env` by itself.

## CLI and runtime variables

- `SCRAPERS_USER_AGENT`
  Sets the default user agent used by CLI-driven requests.
- `SCRAPERS_CONTACT_EMAIL`
  Adds a contact address for polite source access and default user-agent generation.
- `SCRAPERS_OUTPUT_DIR`
  Sets the default output directory when a command does not provide one.
- `SCRAPERS_HTTP_TIMEOUT_MS`
  Sets the default HTTP timeout in milliseconds.
- `SCRAPERS_HTTP_RETRIES`
  Sets the retry count for transient request failures.
- `SCRAPERS_HTTP_RETRY_DELAY_MS`
  Sets the base retry delay in milliseconds.
- `SCRAPERS_CACHE_TTL_MS`
  Enables optional GET-response caching for CLI and library workflows that use the shared context.

## AI enrichment variables

- `OPENAI_API_KEY`
  Required for AI-assisted link-summary enrichment.
- `OPENAI_MODEL`
  Required alongside `OPENAI_API_KEY` for AI enrichment.
- `OPENAI_BASE_URL`
  Optional override for the OpenAI-compatible base URL. Defaults to `https://api.openai.com/v1`.

## Reddit image scraping

- `REDDIT_ACCESS_TOKEN`
  Optional direct bearer token for Reddit's OAuth-protected data API.
- `REDDIT_CLIENT_ID`
  Client ID used when the toolkit resolves a Reddit app-only access token.
- `REDDIT_CLIENT_SECRET`
  Client secret used when the toolkit resolves a Reddit app-only access token.
- `REDDIT_USER_AGENT`
  Recommended custom user agent for Reddit API requests.

The `reddit-random-subreddit-image` scraper and Reddit image helper functions require a Reddit OAuth token or client credentials.

## Weather defaults

- `DEFAULT_WEATHER_LATITUDE`
  Default latitude used by the Open-Meteo weather and air-quality scrapers.
- `DEFAULT_WEATHER_LONGITUDE`
  Default longitude used by the Open-Meteo weather and air-quality scrapers.
- `DEFAULT_WEATHER_LABEL`
  Friendly label stored in weather records when defaults are used.

## Testing

- `RUN_LIVE_TESTS`
  When set to `1`, enables `npm run test:live` against real upstream sources. Keep this unset or `0` for normal local work.

## Discord bot examples

- `DISCORD_TOKEN`
  Bot token used by the `discord.js` examples.
- `DISCORD_APPLICATION_ID`
  Application ID used by the slash-command registration example.
- `DISCORD_GUILD_ID`
  Guild ID used by the slash-command registration example.
- `DISCORD_COMMAND_NAME`
  Optional slash-command name override. Defaults to `scraper`.
- `DISCORD_PREFIX`
  Prefix used by the starter command examples.
- `DISCORD_ALLOWED_NSFW_CHANNEL_IDS`
  Comma-separated list of Discord channel IDs that your bot is allowed to treat as NSFW-enabled when combined with the real channel NSFW flag.
- `DISCORD_WEATHER_MODE`
  Delivery mode used by the weather examples. Supported example values are `hourly`, `every-3-hours`, and `custom`.
- `DISCORD_WEATHER_INTERVAL_HOURS`
  Optional cadence used by the scheduled weather example. This is mainly useful when `DISCORD_WEATHER_MODE=custom`.
- `DISCORD_WEATHER_LAST_RUN_AT`
  Optional ISO timestamp used by the weather scheduler example to decide whether another run is due.
- `DISCORD_WEBHOOK_URL`
  Example Discord webhook target used by the Discord publishing examples.
- `RESULT_WEBHOOK_URL`
  Example generic webhook target used by the generic JSON publishing example.

The new slash-command example in `examples/discord-bots/discordjs-scraper-slash-command.mjs` uses `DISCORD_TOKEN`, `DISCORD_APPLICATION_ID`, `DISCORD_GUILD_ID`, and optionally `DISCORD_COMMAND_NAME`.
