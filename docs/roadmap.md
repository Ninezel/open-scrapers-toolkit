# Roadmap

This repository is intended to become a broad open-source scraper toolkit and library rather than a one-off pile of scripts.

## Completed so far

- grew the starter catalog to 28 scrapers
- added CSV and NDJSON exports
- added Docker packaging
- added scheduled source-health automation
- added optional AI-assisted bulk website link scraping
- added a reusable TypeScript library surface for apps and Discord bots
- added a Discord formatter layer and starter bot examples

## Next roadmap priorities

## 1. Catalog growth

- add another 10 to 15 public-interest sources
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

- add cache helpers so apps and bots can avoid unnecessary repeat requests
- add retry and backoff options for temporary source failures
- add publisher helpers for Discord, webhooks, and file snapshots
- stabilize the public API surface for future npm publishing beyond GitHub installs

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

Keep growing the catalog without turning the repo into custom-script sprawl. Shared helpers, clear documentation, stable normalized outputs, and responsible-source rules are what make that possible.
