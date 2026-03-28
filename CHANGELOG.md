# Changelog

All notable changes to Open Scrapers Toolkit are documented in this file.

## Unreleased

- No unreleased changes recorded yet.

## 2026-03-28 14:50:15 +00:00

### Prompt Routing And Catalogue Expansion Workflow

- Expanded the toolkit around a natural-language Discord and app workflow, added another 104 scrapers, and refreshed the docs and wiki so the larger API surface stays understandable.

### Added

- Added prompt-routing helpers in `src/prompt-router.ts`, including `resolveScraperPrompt()` and `runScraperPrompt()`.
- Added Open-Meteo geocoding support in `src/core/geocoding.ts` for prompt-driven weather and air-quality requests.
- Added `buildDiscordScraperSlashCommandDefinition()` and `runScraperPromptToDiscordMessages()` to the Discord integration layer.
- Added `ask` to the CLI for prompt-driven runs and routing previews.
- Added four prompt-friendly search scrapers: `crossref-academic-search`, `europepmc-academic-search`, `arxiv-academic-search`, and `world-bank-document-search`.
- Added 100 additional topic scrapers across new arXiv, Crossref, Europe PMC, and World Bank expansion packs, growing the catalogue from 84 to 188 scrapers.
- Added `docs/prompt-routing.md` and the matching wiki page `docs/wiki/Prompt-Routing.md`.
- Added `examples/discord-bots/discordjs-scraper-slash-command.mjs`.
- Added `test/prompt-router.test.ts`.

### Changed

- Updated the main `discord.js` message-command example so it can handle either direct scraper IDs or natural-language prompt requests.
- Updated `.env.example` and the environment docs with slash-command example variables.
- Updated README, getting-started, library usage, API reference, Discord bot docs, scraper catalogue docs, roadmap docs, and the corresponding wiki pages for the new prompt-routing and 188-scraper workflow.

## 2026-03-28 12:04:28 +00:00

### Library Reference Documentation Workflow

- Added a full function-by-function reference for app and bot developers, improved editor-facing JSDoc coverage, and linked the new reference page throughout the docs and wiki.

### Added

- Added [docs/api-reference.md](docs/api-reference.md) as the detailed library and Discord helper reference.
- Added [docs/wiki/API-Reference.md](docs/wiki/API-Reference.md) as the matching GitHub wiki page.

### Changed

- Added JSDoc comments to the main library runner helpers, publisher helpers, Reddit image helper, and Discord helper exports so TypeScript users see clearer editor tooltips.
- Updated README, getting started, library usage, Discord bot docs, wiki home, wiki sidebar, and related wiki pages to point developers to the new API reference.

## 2026-03-28 11:58:36 +00:00

### Discord Safety And Scheduling Refinement

- Tightened the Discord bot workflow with channel-policy helpers, delivery-mode profiles, cleaner example configuration, and a full documentation pass for the new Reddit image and weather-card features.

### Added

- Added `buildDiscordChannelContext()` and `parseDiscordChannelIdList()` so bot authors can gate NSFW output by both real channel flags and explicit allow-lists.
- Added `buildDiscordScheduleProfile()` so hourly, every-3-hours, custom-interval, and on-demand flows can share the same scheduling setup.

### Changed

- Updated the Discord examples to use reusable channel-policy helpers instead of ad hoc NSFW checks.
- Updated the weather scheduler example to use delivery-mode profiles for hourly, every-3-hours, or custom cadence configuration.
- Updated `.env.example`, environment docs, library docs, automation docs, README, and wiki pages to document the new Discord helper flow and example variables.
- Corrected the generic webhook example to use `SCRAPERS_CONTACT_EMAIL`.

## 2026-03-28 11:44:50 +00:00

### Discord Bot Workflow Expansion

- Expanded the Discord-side library surface with safer channel validation, richer weather presentation, scheduling helpers, Reddit image support, and updated examples/docs for bot developers.

### Added

- Added `reddit-random-subreddit-image` as a bot-friendly scraper for subreddit image posts.
- Added `src/core/reddit.ts` for Reddit OAuth token handling and random subreddit image selection.
- Added `src/core/weather.ts` for Open-Meteo weather-code interpretation used by Discord weather cards.
- Added Discord helpers for channel-safety validation, cadence selection, schedule timing, and scraper-choice generation.
- Added `examples/discord-bots/discordjs-subreddit-image-command.mjs`.
- Added `examples/automation/discord-weather-scheduler.mjs`.
- Added `test/reddit.test.ts` and expanded `test/discord.test.ts`.

### Changed

- Updated the main `discord.js` example to support scraper parameters, richer embeds, and safe NSFW channel handling.
- Updated `open-meteo-city-forecast` so Discord weather cards can show condition, humidity, sunrise, sunset, and better cadence-based forecast summaries.
- Updated README, docs, wiki pages, and `.env.example` to document Reddit credentials, Discord example variables, and the new bot helper functions.

## 2026-03-28 11:25:15 +00:00

### Environment And Documentation Workflow

- Audited the toolkit environment surface against the actual code, added the missing `RUN_LIVE_TESTS` sample key, and refreshed the repo docs and wiki so `.env` behaviour and environment overrides are documented clearly.

### Added

- Added a dedicated environment-variable reference in `docs/environment-variables.md`.
- Added a matching wiki page in `docs/wiki/Environment-Variables.md`.
- Added `RUN_LIVE_TESTS=0` to `.env.example`.

### Changed

- Clarified that the CLI auto-loads `.env`, while library consumers should load their own environment or pass options directly.
- Refreshed installation, troubleshooting, and environment guidance across the repo docs and wiki source.

## 2026-03-28 11:16:34 +00:00

### Roadmap Expansion Workflow

- Completed the next major roadmap pass by growing the public-source catalogue, deepening app and bot helpers, and refreshing the repo docs, wiki source, and release workflow around a timestamped changelog format.

### Added

- Added 55 new scrapers, growing the starter catalogue from 28 to 83 scrapers.
- Added 8 UN News topic feeds for climate change, health, human rights, peace and security, women, migrants and refugees, humanitarian aid, and the SDGs.
- Added 3 WHO AFRO feeds for featured news, emergencies, and speeches.
- Added 5 Nature topic feeds for climate change, machine learning, genetics, cancer, and ecology.
- Added 10 new Crossref topic scrapers for biodiversity, disaster risk, digital health, education policy, environmental justice, food security, public policy, sustainable finance, urban planning, and water security.
- Added 10 new Europe PMC topic scrapers for antimicrobial resistance, digital health, environmental health, epidemiology, genomics, health systems, maternal health, nutrition, pediatrics, and vaccine research.
- Added 10 new arXiv topic scrapers for computer vision, cybersecurity, data science, disaster response, medical imaging, natural language processing, quantum computing, remote sensing, renewable energy systems, and robotics.
- Added 9 World Bank expansion scrapers covering agriculture, disaster risk, energy, governance, social protection, access to electricity, CO2 emissions, life expectancy, and unemployment.
- Added `src/core/cache.ts` for opt-in GET response caching.
- Added webhook and snapshot publishing helpers in `src/publishers.ts`.
- Added filtered health-alert publishing targets for saved files, generic webhooks, and Discord webhooks.
- Added automation examples in `examples/automation/` for Discord health alerts, generic webhook publishing, and nightly health checks.
- Added contributor templates in `templates/` for RSS, JSON API, and webpage scrapers.
- Added `test/publishers.test.ts` for publisher and health-alert coverage.

### Changed

- Updated `src/core/http.ts` to support retry and backoff behaviour for transient public-source failures.
- Updated the CLI health workflow so maintainers can publish filtered alerts without writing their own glue code.
- Updated the library context surface to accept cache, retry, and delay settings from app and bot code.
- Updated README, docs, wiki pages, and roadmap guidance to reflect the 83-scraper catalogue and the new automation/publisher workflow.
- Updated changelog guidance so same-day releases are separated by date-and-time headings instead of a shared daily block.

### Maintenance

- Bumped the package version and user-agent defaults to the `0.3.0` release line.
- Expanded live-source smoke coverage to include new UN News and WHO AFRO feeds.

## 2026-03-28 10:39:41 +00:00

### Documentation And Roadmap Workflow

- Expanded the docs and wiki so library usage, scraper usage, and the next roadmap priorities are easier to understand and maintain.

### Added

- Added detailed library usage documentation and richer scraper-usage guidance.

### Changed

- Expanded the roadmap into concrete next priorities around source growth, library helpers, reliability, and ecosystem support.
- Updated README, docs, and wiki content to reflect the larger catalogue and new workflows.

## 2026-03-28 10:31:24 +00:00

### Discord Bot Library Workflow

- Extended the toolkit so Discord bots and other Node applications can import scraper runners directly instead of shelling out to the CLI.

### Added

- Added `src/library.ts`, `src/index.ts`, and `src/integrations/discord.ts` as the library-facing integration layer.
- Added Discord bot starter documentation and the `examples/discord-bots/discordjs-message-command.mjs` example.
- Added library and Discord formatter tests.

### Changed

- Updated package exports, type declarations, and Git install behaviour so the toolkit can be consumed as a library from GitHub.

## 2026-03-28 10:04:29 +00:00

### Full Expansion Workflow

- Completed a full toolkit expansion pass covering scraper growth, export formats, source-health reporting, bulk website list scraping, optional AI enrichment, Docker packaging, and documentation refreshes.

### Added

- Added 13 new scrapers, growing the starter catalogue to 28 modules across news, weather, reports, academic sources, and a new file-based bulk website workflow.
- Added `scrape-links` for line-by-line webpage lists.
- Added `website-links-ai-digest` with optional OpenAI enrichment for summary and tag generation.
- Added CSV and NDJSON export support for saved results.
- Added `health` for live source-health reporting.
- Added `export` for converting an existing JSON result into CSV, NDJSON, or all formats.
- Added `src/core/html.ts` and `src/core/ai.ts` to support webpage extraction and optional AI enrichment.
- Added Docker packaging and a scheduled `source-health.yml` GitHub Actions workflow.
- Added export tests, bulk-link tests, and optional live-source smoke tests.
- Added new sample link input under `examples/url-lists/demo-links.txt`.
- Added `src/library.ts`, `src/index.ts`, and `src/integrations/discord.ts` as the library-facing integration layer.
- Added Discord bot starter documentation and the `examples/discord-bots/discordjs-message-command.mjs` example.
- Added library and Discord formatter tests.
- Added detailed library usage documentation and richer scraper-usage guidance.

### Changed

- Expanded the CLI to cover bulk-link scraping, health checks, and richer export behaviour.
- Improved catalogue output so the growing scraper list remains discoverable.
- Updated README, docs, and wiki content to reflect the larger catalogue and new workflows.
- Updated package exports, type declarations, and Git install behaviour so the toolkit can be consumed as a library from GitHub.
- Expanded the roadmap into concrete next priorities around source growth, library helpers, reliability, and ecosystem support.

### Maintenance

- Added `cheerio` for webpage text extraction.
- Extended desktop integration points in the companion app to support save formats and source-health data.
- Aligned package metadata and default user-agent strings with the current `0.2.0` release line.
