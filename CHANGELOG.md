# Changelog

All notable changes to Open Scrapers Toolkit are documented in this file.

## Unreleased

- No unreleased changes recorded yet.

## 2026-03-28

### Full Expansion Workflow

- Completed a full toolkit expansion pass covering scraper growth, export formats, source-health reporting, bulk website list scraping, optional AI enrichment, Docker packaging, and documentation refreshes.

### Discord Bot Library Workflow

- Extended the toolkit so Discord bots and other Node applications can import scraper runners directly instead of shelling out to the CLI.

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

### Changed

- Expanded the CLI to cover bulk-link scraping, health checks, and richer export behavior.
- Improved catalog output so the growing scraper list remains discoverable.
- Updated README, docs, and wiki content to reflect the larger catalog and new workflows.
- Updated package exports, type declarations, and Git install behavior so the toolkit can be consumed as a library from GitHub.

### Maintenance

- Added `cheerio` for webpage text extraction.
- Extended desktop integration points in the companion app to support save formats and source-health data.
- Aligned package metadata and default user-agent strings with the current `0.2.0` release line.
