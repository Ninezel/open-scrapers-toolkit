# Changelog

All notable changes to Open Scrapers Toolkit are documented in this file.

## Unreleased

### Added

- Added a new `describe <scraper-id>` CLI command for inspecting scraper defaults, parameters, source names, and example run commands without opening source files.
- Added category and free-text filters to `list`, including `--category` and `--search`, for faster catalog discovery.
- Added a new shared catalog helper layer in `src/core/catalog.ts` to keep catalog formatting, filtering, and validation consistent across CLI features.
- Added automated tests covering catalog filtering, CLI output, HTTP timeout parsing, and utility helpers.
- Added GitHub Actions CI to run type checks, tests, and a production build on pushes and pull requests.
- Added `SCRAPERS_HTTP_TIMEOUT_MS` to configure default upstream request timeouts.

### Changed

- Improved CLI JSON output so catalog data now includes `sourceName`, defaults, and parameter metadata more consistently.
- Improved HTTP error handling with clearer timeout and request-failure messages.
- Enriched scraper metadata for Open-Meteo, NWS, and USGS modules so discovery commands surface better source information.
- Expanded the README, getting-started guide, wiki CLI reference, installation guide, and troubleshooting docs to cover the new commands and validation workflow.

### Maintenance

- Added a test-specific TypeScript config for checking the test suite under the same strict settings as the main source tree.
- Improved contributor guidance so release and troubleshooting docs now mention tests and timeout configuration.
