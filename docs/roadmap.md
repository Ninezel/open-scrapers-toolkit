# Roadmap

This repository is intended to become a broad open-source scraper toolkit and library rather than a one-off pile of scripts.

## Completed so far

- grew the starter catalogue to 84 scrapers
- added CSV and NDJSON exports
- added Docker packaging
- added scheduled source-health automation
- added optional AI-assisted bulk website link scraping
- added a reusable TypeScript library surface for apps and Discord bots
- added a Discord formatter layer and starter bot examples
- added cache, retry, and backoff support
- added publisher helpers for webhooks, Discord webhooks, and result snapshots
- added filtered health-alert publishing
- added contributor templates and richer automation examples
- added Discord channel-safety helpers, weather-card rendering, and scheduling helpers
- added Discord channel-policy resolution and delivery-mode profile helpers for bot authors

## What Landed In The Current Expansion

- 55 additional public-interest scrapers
- new UN News, WHO AFRO, Nature, Crossref, Europe PMC, arXiv, and World Bank packs
- cache and retry support for app and bot consumers
- webhook and Discord webhook publishers
- filtered health-alert publishing from the CLI
- refreshed docs, wiki pages, and release workflow guidance with timestamped changelog rules

## Next roadmap priorities after this expansion

## 1. Catalogue Growth

- add another 10 to 15 carefully selected public-interest sources beyond the current 84
- expand official sources in health, environment, disaster response, and policy research
- add more geographic coverage instead of relying on only a few English-language sources

Current target sources:

- WHO news and publication feeds
- UN News topic feeds
- OECD publications and datasets
- humanitarian situation-report sources
- more hazard and climate datasets
- journal table-of-contents feeds

## 2. Library improvements

- stabilise the public API surface for future npm publishing beyond GitHub installs
- add more built-in publisher targets beyond generic and Discord webhooks
- add cache invalidation helpers and richer result post-processing helpers for apps and bots

## 3. Operations and reliability

- extend health checks with alert publishing
- add richer live-source smoke coverage
- improve error classification so users can distinguish source issues from local setup issues
- add more regression fixtures for parsers and normalizers

## 4. Contributor experience

- add more scraper templates and contribution examples
- add source-specific troubleshooting notes
- document testing patterns for feed, API, and webpage scrapers
- keep docs and wiki examples aligned with the shipped CLI and library surface

## 5. Ecosystem support

- deepen the Discord bot examples
- add webhook publishing recipes
- add more examples for cron jobs, GitHub Actions, and self-hosted schedulers
- keep the desktop companion aligned with the toolkit feature set

## Contribution goal

Keep growing the catalogue without turning the repo into custom-script sprawl. Shared helpers, clear documentation, stable normalised outputs, and responsible-source rules are what make that possible.
