# Scraper Catalog

This page explains what each scraper is for, which parameters it accepts, and how to choose the right scraper for a job.

## How to inspect the catalog live

Use the CLI when you want the current metadata:

```bash
npx tsx src/cli.ts list
npx tsx src/cli.ts list --category reports --search world-bank
npx tsx src/cli.ts describe website-links-ai-digest
```

## News scrapers

- `bbc-world-news`
  Pulls BBC world headlines. Good default for general international headlines. No extra parameters.
- `bbc-technology-news`
  Pulls BBC technology headlines. No extra parameters.
- `bbc-business-news`
  Pulls BBC business headlines. No extra parameters.
- `bbc-science-environment-news`
  Pulls BBC science and environment headlines. No extra parameters.
- `nasa-breaking-news`
  Pulls NASA news releases and mission updates. No extra parameters.
- `nasa-image-of-the-day`
  Pulls NASA image posts with summary text. No extra parameters.

## Weather scrapers

- `nws-active-alerts`
  Pulls National Weather Service active alerts. Parameters: `area`, `event`, `severity`.
- `open-meteo-city-forecast`
  Pulls hourly forecast records. Parameters: `latitude`, `longitude`, `label`, `timezone`, `days`.
- `open-meteo-air-quality`
  Pulls air-quality and UV records. Parameters: `latitude`, `longitude`, `label`, `timezone`.

## Report and public-data scrapers

- `usgs-earthquakes`
  Pulls earthquake events. Parameters: `minimumMagnitude`, `place`.
- `world-bank-population`
  Pulls the latest population indicator for a country. Parameter: `country`.
- `world-bank-gdp`
  Pulls the latest GDP indicator for a country. Parameter: `country`.
- `world-bank-climate-documents`
  Pulls World Bank climate documents. Parameter: `query`.
- `world-bank-education-documents`
  Pulls World Bank education documents. Parameter: `query`.
- `world-bank-health-documents`
  Pulls World Bank health documents. Parameter: `query`.
- `world-bank-water-documents`
  Pulls World Bank water documents. Parameter: `query`.
- `website-links-ai-digest`
  Reads a text file of webpage URLs and extracts summaries. Required parameter: `file`. Optional parameters: `useAi`, `model`, `maxChars`, `sourceLabel`.

## Academic scrapers

- `crossref-ai-papers`
  Searches Crossref for AI papers. Parameter: `query`.
- `crossref-climate-papers`
  Searches Crossref for climate papers. Parameter: `query`.
- `crossref-cybersecurity-papers`
  Searches Crossref for cybersecurity papers. Parameter: `query`.
- `crossref-renewable-energy-papers`
  Searches Crossref for renewable-energy papers. Parameter: `query`.
- `europepmc-public-health`
  Searches Europe PMC for public-health research. Parameter: `query`.
- `europepmc-oncology`
  Searches Europe PMC for oncology research. Parameter: `query`.
- `europepmc-infectious-disease`
  Searches Europe PMC for infectious-disease research. Parameter: `query`.
- `europepmc-mental-health`
  Searches Europe PMC for mental-health research. Parameter: `query`.
- `arxiv-machine-learning`
  Searches arXiv for machine-learning papers. Parameter: `query`.
- `arxiv-climate-science`
  Searches arXiv for climate-science papers. Parameter: `query`.
- `arxiv-public-health`
  Searches arXiv for public-health papers. Parameter: `query`.

## Common parameter examples

```bash
npx tsx src/cli.ts run nws-active-alerts --param area=CA --param severity=Severe
npx tsx src/cli.ts run open-meteo-city-forecast --param latitude=40.7128 --param longitude=-74.0060 --param label=NewYork
npx tsx src/cli.ts run world-bank-gdp --param country=GBR
npx tsx src/cli.ts run arxiv-machine-learning --param query=\"large language models\"
npx tsx src/cli.ts run website-links-ai-digest --param file=examples/url-lists/demo-links.txt --param useAi=auto
```

## How to choose a scraper

Use a feed-based news scraper when you want:

- breaking headlines
- fast updates
- minimal parameter setup

Use a weather or hazard scraper when you want:

- location-based forecast or alert data
- structured records for bots or dashboards

Use a report scraper when you want:

- official documents
- indicator snapshots
- public-data summaries

Use an academic scraper when you want:

- paper discovery
- topic-based research feeds
- article metadata for bots, dashboards, or reading queues

Use `website-links-ai-digest` when you already have:

- a curated list of public webpages
- a monitoring list in a text file
- a need for quick summaries across multiple unrelated sources

## Naming pattern

Scraper IDs follow a simple convention:

`source-topic-purpose`

Examples:

- `bbc-business-news`
- `world-bank-water-documents`
- `open-meteo-air-quality`
- `website-links-ai-digest`
