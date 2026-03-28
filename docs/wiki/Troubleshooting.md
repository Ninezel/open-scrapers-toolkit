# Troubleshooting

- `Unknown scraper`: run `npx tsx src/cli.ts list`
- request timeout: increase `SCRAPERS_HTTP_TIMEOUT_MS`
- bulk-link scraper says no URLs: make sure the text file has one `http` or `https` URL per line
- AI enrichment not running: set both `OPENAI_API_KEY` and `OPENAI_MODEL`, or keep `useAi=auto`
- health report shows skipped: that scraper probably needs required parameters that were not supplied
