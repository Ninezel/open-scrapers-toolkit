# Automation And Publishers

Open Scrapers Toolkit now includes reusable publishing helpers for bots and automation jobs.

## Included workflows

- generic JSON webhook publishing
- Discord webhook publishing
- Discord weather scheduling with delivery-mode helpers
- health alert filtering
- file snapshots through the normal export helpers
- cache and retry tuning for scheduled runs

## CLI health alerts

```bash
npx tsx src/cli.ts health --alert-status error,skipped --alert-file output/source-health-alerts.json
npx tsx src/cli.ts health --alert-webhook https://example.com/webhook
npx tsx src/cli.ts health --alert-discord-webhook https://discord.com/api/webhooks/...
```

## Example scripts

- `examples/automation/discord-health-alerts.mjs`
- `examples/automation/discord-weather-scheduler.mjs`
- `examples/automation/webhook-result-publisher.mjs`
- `examples/automation/nightly-health-check.mjs`

Useful example variables:

- `DISCORD_WEATHER_MODE`
- `DISCORD_WEATHER_INTERVAL_HOURS`
- `DISCORD_WEATHER_LAST_RUN_AT`
- `DISCORD_WEBHOOK_URL`
- `RESULT_WEBHOOK_URL`
