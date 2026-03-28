# Troubleshooting

## `npm run check` fails after adding a scraper

Check:

- the scraper file is included in `src/scrapers/index.ts`
- parameter examples are strings
- the scraper returns a normalized `ScrapeResult`

## `npm test` passes but a live scraper still fails

That usually means:

- the upstream source changed
- the source is temporarily unavailable
- a required parameter is missing
- the remote endpoint is rate limiting or blocking your request

## HTTP requests time out

Try:

- increasing `SCRAPERS_HTTP_TIMEOUT_MS`
- enabling a small retry count with `SCRAPERS_HTTP_RETRIES`
- using a contact email in your user agent so public providers can identify your traffic

## You want fewer duplicate network calls in bots

Use:

- `SCRAPERS_CACHE_TTL_MS`
- library-level `cacheTtlMs` when calling the toolkit in code

## A webhook publish fails

Check:

- the webhook URL is correct
- the receiving service accepts JSON payloads
- the result size is reasonable for the target service

For Discord webhooks, prefer the Discord formatter helpers instead of posting raw result JSON.

## Health alerts say `skipped`

That usually means the scraper requires parameters that the generic health run did not supply. This is expected for some parameterized sources.

Use:

- a narrower health slice for sources with sensible defaults
- `describe <scraper-id>` to confirm required parameters
- targeted live runs when testing a parameterized scraper

## A new source should probably use a template

Templates live in:

- `templates/rss-scraper.ts`
- `templates/json-api-scraper.ts`
- `templates/webpage-scraper.ts`
