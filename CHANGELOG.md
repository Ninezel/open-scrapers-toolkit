# Changelog

All notable changes to Open Scrapers Toolkit are documented in this file.

## Unreleased

- No unreleased changes recorded yet.

## 2026-03-28 11:16:34 +00:00

### Roadmap Expansion Workflow

- Completed the next major roadmap pass by growing the public-source catalog, deepening app and bot helpers, and refreshing the repo docs, wiki source, and release workflow around a timestamped changelog format.

### Added

- Added 55 new scrapers, growing the starter catalog from 28 to 83 scrapers.
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

- Updated `src/core/http.ts` to support retry and backoff behavior for transient public-source failures.
- Updated the CLI health workflow so maintainers can publish filtered alerts without writing their own glue code.
- Updated the library context surface to accept cache, retry, and delay settings from app and bot code.
- Updated README, docs, wiki pages, and roadmap guidance to reflect the 83-scraper catalog and the new automation/publisher workflow.
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
- Updated README, docs, and wiki content to reflect the larger catalog and new workflows.

## 2026-03-28 10:31:24 +00:00

### Discord Bot Library Workflow

- Extended the toolkit so Discord bots and other Node applications can import scraper runners directly instead of shelling out to the CLI.

### Added

- Added `src/library.ts`, `src/index.ts`, and `src/integrations/discord.ts` as the library-facing integration layer.
- Added Discord bot starter documentation and the `examples/discord-bots/discordjs-message-command.mjs` example.
- Added library and Discord formatter tests.

### Changed

- Updated package exports, type declarations, and Git install behavior so the toolkit can be consumed as a library from GitHub.

## 2026-03-28 10:04:29 +00:00

### Full Expansion Workflow

- Completed a full toolkit expansion pass covering scraper growth, export formats, source-health reporting, bulk website list scraping, optional AI enrichment, Docker packaging, and documentation refreshes.

### Added

- Added 13 new scrapers, growing the starter catalog to 28 modules across news, weather, reports, academic sources, and a new file-based bulk website workflow.
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

- Expanded the CLI to cover bulk-link scraping, health checks, and richer export behavior.
- Improved catalog output so the growing scraper list remains discoverable.
- Updated README, docs, and wiki content to reflect the larger catalog and new workflows.
- Updated package exports, type declarations, and Git install behavior so the toolkit can be consumed as a library from GitHub.
- Expanded the roadmap into concrete next priorities around source growth, library helpers, reliability, and ecosystem support.

### Maintenance

- Added `cheerio` for webpage text extraction.
- Extended desktop integration points in the companion app to support save formats and source-health data.
- Aligned package metadata and default user-agent strings with the current `0.2.0` release line.
