# Roadmap

This repository is intended to become a broad open-source scraper toolkit and library rather than a one-off pile of scripts.

## Completed so far

- grew the starter catalogue to 188 scrapers
- added CSV and NDJSON exports
- added Docker packaging
- added scheduled source-health automation
- added optional AI-assisted bulk website link scraping
- added a reusable TypeScript library surface for apps and Discord bots
- added a Discord formatter layer and starter bot examples
- added natural-language prompt routing for app and bot flows
- added a slash-command definition helper and prompt-driven Discord runner helpers
- added cache, retry, and backoff support
- added publisher helpers for webhooks, Discord webhooks, and result snapshots
- added filtered health-alert publishing
- added contributor templates and richer automation examples
- added Discord channel-safety helpers, weather-card rendering, and scheduling helpers
- added Discord channel-policy resolution and delivery-mode profile helpers for bot authors

## What Landed In The Current Expansion

- 104 additional scrapers, taking the catalogue from 84 to 188
- four new prompt-friendly search scrapers for Crossref, Europe PMC, arXiv, and World Bank
- a natural-language prompt router for weather, research, report, earthquake, subreddit, and named-source requests
- a plain-object `/scraper` slash-command definition helper for Discord bots
- updated Discord examples, CLI prompt testing, docs, and wiki guidance around the new library surface

## Next roadmap priorities after this expansion

## 1. Catalogue Growth

- add another wave of carefully selected public-interest sources beyond the current 188
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
- keep refining prompt routing, slash-command ergonomics, and result post-processing helpers
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
- add more prompt-routing recipes for bots, webhooks, and app-side assistants
- add webhook publishing recipes
- add more examples for cron jobs, GitHub Actions, and self-hosted schedulers
- keep the desktop companion aligned with the toolkit feature set

## Contribution goal

Keep growing the catalogue without turning the repo into custom-script sprawl. Shared helpers, clear documentation, stable normalised outputs, and responsible-source rules are what make that possible.
