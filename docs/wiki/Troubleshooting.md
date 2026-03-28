# Troubleshooting

- `Unknown scraper`: run `npx tsx src/cli.ts list`
- request timeout: increase `SCRAPERS_HTTP_TIMEOUT_MS`
- repeated transient failures: try `SCRAPERS_HTTP_RETRIES` and `SCRAPERS_HTTP_RETRY_DELAY_MS`
- too many repeated GET requests in automation: try `SCRAPERS_CACHE_TTL_MS`
- bulk-link scraper says no URLs: make sure the text file has one `http` or `https` URL per line
- AI enrichment not running: set both `OPENAI_API_KEY` and `OPENAI_MODEL`, or keep `useAi=auto`
- health report shows skipped: that scraper probably needs required parameters that were not supplied
- webhook publishing fails: confirm the webhook expects JSON and that the target URL is correct
- if you keep getting repeated GET traffic in automations, set `SCRAPERS_CACHE_TTL_MS`
