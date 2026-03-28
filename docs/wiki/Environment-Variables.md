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

Reddit image scraping:

- `REDDIT_ACCESS_TOKEN`
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `REDDIT_USER_AGENT`

Weather defaults:

- `DEFAULT_WEATHER_LATITUDE`
- `DEFAULT_WEATHER_LONGITUDE`
- `DEFAULT_WEATHER_LABEL`

Testing:

- `RUN_LIVE_TESTS`

Discord examples:

- `DISCORD_TOKEN`
- `DISCORD_APPLICATION_ID`
- `DISCORD_GUILD_ID`
- `DISCORD_COMMAND_NAME`
- `DISCORD_PREFIX`
- `DISCORD_ALLOWED_NSFW_CHANNEL_IDS`
- `DISCORD_WEATHER_MODE`
- `DISCORD_WEATHER_INTERVAL_HOURS`
- `DISCORD_WEATHER_LAST_RUN_AT`
- `DISCORD_WEBHOOK_URL`
- `RESULT_WEBHOOK_URL`

The slash-command example uses `DISCORD_TOKEN`, `DISCORD_APPLICATION_ID`, `DISCORD_GUILD_ID`, and optionally `DISCORD_COMMAND_NAME`.

Use `RUN_LIVE_TESTS=1` only when you want `npm run test:live` to hit upstream sources.

If you use the toolkit as a library inside your own app or bot, load environment variables in the host process or pass options directly. The library exports do not auto-read `.env` files on their own.
