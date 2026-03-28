# Environment Variables

This page lists the environment variables used by Open Scrapers Toolkit and explains where they apply.

## `.env` behavior

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
