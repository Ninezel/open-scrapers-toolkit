# Scraper Catalog

This page describes the starter catalog included in the repository.

## News

### `bbc-world-news`

- Source: BBC News RSS
- Purpose: collect current world headlines
- Parameters: none

### `bbc-technology-news`

- Source: BBC News RSS
- Purpose: collect technology headlines
- Parameters: none

### `nasa-breaking-news`

- Source: NASA RSS
- Purpose: collect official NASA announcements
- Parameters: none

### `nasa-image-of-the-day`

- Source: NASA RSS
- Purpose: collect daily image posts with summaries
- Parameters: none

## Weather

### `nws-active-alerts`

- Source: National Weather Service API
- Purpose: collect active US weather alerts
- Parameters:
  - `area`
  - `event`
  - `severity`

### `open-meteo-city-forecast`

- Source: Open-Meteo API
- Purpose: collect hourly forecast records for a location
- Parameters:
  - `latitude`
  - `longitude`
  - `label`
  - `timezone`
  - `days`

## Reports

### `usgs-earthquakes`

- Source: USGS GeoJSON feed
- Purpose: collect recent earthquake events
- Parameters:
  - `minimumMagnitude`
  - `place`

### `world-bank-population`

- Source: World Bank indicator API
- Purpose: fetch latest population values
- Parameters:
  - `country`

### `world-bank-gdp`

- Source: World Bank indicator API
- Purpose: fetch latest GDP values
- Parameters:
  - `country`

### `world-bank-climate-documents`

- Source: World Bank document search API
- Purpose: collect climate-related reports and publications
- Parameters:
  - `query`

### `world-bank-education-documents`

- Source: World Bank document search API
- Purpose: collect education-related reports and publications
- Parameters:
  - `query`

## Academic

### `crossref-ai-papers`

- Source: Crossref REST API
- Purpose: discover recently indexed AI-focused papers
- Parameters:
  - `query`

### `crossref-climate-papers`

- Source: Crossref REST API
- Purpose: discover recently indexed climate-focused papers
- Parameters:
  - `query`

### `europepmc-public-health`

- Source: Europe PMC REST API
- Purpose: discover public health publications
- Parameters:
  - `query`

### `europepmc-oncology`

- Source: Europe PMC REST API
- Purpose: discover oncology publications
- Parameters:
  - `query`

## Naming pattern

Scraper IDs follow a simple convention:

`source-topic-purpose`

Examples:

- `bbc-world-news`
- `world-bank-climate-documents`
- `open-meteo-city-forecast`
