# Scraping Policy

Open Scrapers Toolkit exists to help people collect public information responsibly.

## Required rules

- Follow applicable laws, platform terms, and source usage rules.
- Respect robots.txt when scraping websites directly.
- Prefer official APIs, RSS feeds, or bulk data exports whenever they exist.
- Use a clear user agent that identifies your application and contact point.
- Keep request rates reasonable. Add delays, caching, or batching where needed.
- Collect the minimum data needed for the task.
- Avoid personal, sensitive, or regulated data unless the source clearly permits it and the project documents the reason.
- Do not bypass paywalls, logins, CAPTCHAs, anti-bot measures, or technical access controls.
- Preserve source attribution in metadata where possible.
- Stop and review the source if requests begin failing, rate limiting, or returning unexpected legal notices.

## Maintainer review criteria

A new scraper may be rejected if it:

- targets a site with unclear permission status
- relies on fragile browser automation when a public feed exists
- gathers personal data without a strong documented reason
- creates disproportionate traffic for a small site
- ships without documentation, parameters, or usage notes

## Source selection preference

The preferred order is:

1. Official API
2. Official RSS or Atom feed
3. Public machine-readable export
4. HTML scraping as a documented last resort

## Contributor expectations

- Document the upstream source and why it was chosen.
- Keep the parser small and readable.
- Expose parameters when the source supports useful filtering.
- Return normalized records that downstream tools can trust.

This project is for lawful and ethical data collection. If you are unsure about a source, open an issue before implementing it.
