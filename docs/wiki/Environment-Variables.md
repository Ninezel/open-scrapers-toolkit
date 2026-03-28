# Environment Variables

The toolkit CLI auto-loads a repo-root `.env` file through `dotenv`.

Main runtime variables:

- `SCRAPERS_USER_AGENT`
- `SCRAPERS_CONTACT_EMAIL`
- `SCRAPERS_OUTPUT_DIR`
- `SCRAPERS_HTTP_TIMEOUT_MS`
- `SCRAPERS_HTTP_RETRIES`
- `SCRAPERS_HTTP_RETRY_DELAY_MS`
- `SCRAPERS_CACHE_TTL_MS`

AI variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_BASE_URL`

Weather defaults:

- `DEFAULT_WEATHER_LATITUDE`
- `DEFAULT_WEATHER_LONGITUDE`
- `DEFAULT_WEATHER_LABEL`

Testing:

- `RUN_LIVE_TESTS`

Use `RUN_LIVE_TESTS=1` only when you want `npm run test:live` to hit upstream sources.

If you use the toolkit as a library inside your own app or bot, load environment variables in the host process or pass options directly. The library exports do not auto-read `.env` files on their own.
