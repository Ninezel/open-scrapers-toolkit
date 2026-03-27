# Scraper Catalog

This page documents the starter scraper catalog included in the toolkit. The goal is not just to list IDs, but to explain what each module is for, what source it relies on, what parameters it accepts, and what kind of output to expect.

## Category overview

- `news`: public headline and article-style feeds
- `weather`: forecast and alert data
- `reports`: public institutional data, indicators, and situation-style feeds
- `academic`: scholarly discovery endpoints

## News

### `bbc-world-news`

- Name: BBC World News
- Source: BBC News RSS feed
- Purpose: collect current world-news headlines in a normalized format
- Parameters: none
- Best for: simple headline monitoring, feed readers, dashboard prototypes

Example:

```powershell
npx tsx src/cli.ts run bbc-world-news --limit 5 --output output/bbc-world-news.json
```

### `bbc-technology-news`

- Name: BBC Technology News
- Source: BBC News RSS feed
- Purpose: collect technology headlines from the BBC technology stream
- Parameters: none
- Best for: technology watchlists, newsletter inputs, CLI demos

Example:

```powershell
npx tsx src/cli.ts run bbc-technology-news --limit 5 --output output/bbc-technology-news.json
```

### `nasa-breaking-news`

- Name: NASA Breaking News
- Source: NASA public RSS feed
- Purpose: collect official NASA announcements and updates
- Parameters: none
- Best for: space and science feeds, institutional news monitoring

Example:

```powershell
npx tsx src/cli.ts run nasa-breaking-news --limit 5 --output output/nasa-breaking-news.json
```

### `nasa-image-of-the-day`

- Name: NASA Image Of The Day
- Source: NASA public RSS feed
- Purpose: collect daily imagery posts, captions, and links
- Parameters: none
- Best for: media displays, educational viewers, example summary-rich records

Example:

```powershell
npx tsx src/cli.ts run nasa-image-of-the-day --limit 5 --output output/nasa-image-of-the-day.json
```

## Weather

### `nws-active-alerts`

- Name: NWS Active Alerts
- Source: National Weather Service API
- Purpose: collect active U.S. weather alerts
- Parameters:
  - `area`: optional case-insensitive area filter applied locally
  - `event`: optional case-insensitive event filter applied locally
  - `severity`: optional case-insensitive severity filter applied locally
- Best for: hazard awareness, alert dashboards, downstream rule engines

Example:

```powershell
npx tsx src/cli.ts run nws-active-alerts --limit 20 --param area=Texas --param event=Flood --output output/nws-alerts-texas.json
```

### `open-meteo-city-forecast`

- Name: Open-Meteo City Forecast
- Source: Open-Meteo public API
- Purpose: collect hourly forecast records for a chosen location
- Parameters:
  - `latitude`
  - `longitude`
  - `label`
  - `timezone`
  - `days`
- Best for: location-based forecast snapshots, weather widgets, data joins with local dashboards

Example:

```powershell
npx tsx src/cli.ts run open-meteo-city-forecast --limit 24 --param latitude=51.5072 --param longitude=-0.1276 --param label=London --param timezone=Europe/London --param days=3 --output output/london-forecast.json
```

## Reports

### `usgs-earthquakes`

- Name: USGS Earthquakes
- Source: USGS GeoJSON feed
- Purpose: collect recent earthquake events
- Parameters:
  - `minimumMagnitude`: client-side minimum magnitude filter
  - `place`: client-side place substring filter
- Best for: situational monitoring, seismic event watchlists, geographic filtering demos

Example:

```powershell
npx tsx src/cli.ts run usgs-earthquakes --limit 20 --param minimumMagnitude=4.5 --param place=California --output output/usgs-california.json
```

### `world-bank-population`

- Name: World Bank Population Snapshot
- Source: World Bank indicator API
- Purpose: fetch latest population values
- Parameters:
  - `country`: World Bank country or region code
- Best for: quick macro indicators, basic country profiles, joined report datasets

Example:

```powershell
npx tsx src/cli.ts run world-bank-population --param country=GBR --output output/world-bank-population-gbr.json
```

### `world-bank-gdp`

- Name: World Bank GDP Snapshot
- Source: World Bank indicator API
- Purpose: fetch latest GDP values
- Parameters:
  - `country`: World Bank country or region code
- Best for: economic profile snapshots, country comparison datasets

Example:

```powershell
npx tsx src/cli.ts run world-bank-gdp --param country=USA --output output/world-bank-gdp-usa.json
```

### `world-bank-climate-documents`

- Name: World Bank Climate Documents
- Source: World Bank document search API
- Purpose: collect climate-related reports and publications
- Parameters:
  - `query`: query term sent to the World Bank document API
- Best for: institutional research discovery, policy-document monitoring

Example:

```powershell
npx tsx src/cli.ts run world-bank-climate-documents --limit 10 --param query=resilience --output output/world-bank-climate-documents.json
```

### `world-bank-education-documents`

- Name: World Bank Education Documents
- Source: World Bank document search API
- Purpose: collect education-related reports and publications
- Parameters:
  - `query`: query term sent to the World Bank document API
- Best for: education policy monitoring, report catalogs, document-reader apps

Example:

```powershell
npx tsx src/cli.ts run world-bank-education-documents --limit 10 --param query=\"school readiness\" --output output/world-bank-education-documents.json
```

## Academic

### `crossref-ai-papers`

- Name: Crossref AI Papers
- Source: Crossref REST API
- Purpose: discover recently indexed AI-focused papers
- Parameters:
  - `query`: Crossref title query override
- Best for: AI literature watchlists, bibliographic exploration, reference harvesting

Example:

```powershell
npx tsx src/cli.ts run crossref-ai-papers --limit 10 --param query=\"large language model\" --output output/crossref-ai-papers.json
```

### `crossref-climate-papers`

- Name: Crossref Climate Papers
- Source: Crossref REST API
- Purpose: discover climate-focused research
- Parameters:
  - `query`: Crossref title query override
- Best for: environmental research monitoring, metadata experiments

Example:

```powershell
npx tsx src/cli.ts run crossref-climate-papers --limit 10 --param query=\"carbon capture\" --output output/crossref-climate-papers.json
```

### `europepmc-public-health`

- Name: Europe PMC Public Health
- Source: Europe PMC REST API
- Purpose: discover public-health publications
- Parameters:
  - `query`: Europe PMC query string
- Best for: public-health literature discovery, health-topic review pipelines

Example:

```powershell
npx tsx src/cli.ts run europepmc-public-health --limit 10 --param query=\"mental health\" --output output/europepmc-public-health.json
```

### `europepmc-oncology`

- Name: Europe PMC Oncology
- Source: Europe PMC REST API
- Purpose: discover oncology-focused publications
- Parameters:
  - `query`: Europe PMC query string
- Best for: cancer-research watchlists, medical literature discovery

Example:

```powershell
npx tsx src/cli.ts run europepmc-oncology --limit 10 --param query=immunotherapy --output output/europepmc-oncology.json
```

## Parameter conventions

Across the catalog, parameters follow a few shared rules:

- parameters are always passed as `--param key=value`
- most parameters are optional and override default values
- filters are usually applied locally unless the upstream API supports them directly
- defaults should keep result sets bounded and understandable

## Normalized output expectations

Even though each source is different, every scraper returns the same top-level result shape:

- `scraperId`
- `scraperName`
- `category`
- `source`
- `fetchedAt`
- `records`
- `meta`

That shared contract is what allows the desktop app and downstream code to read mixed-source output with one parser.

## Related pages

- [CLI Reference](CLI-Reference.md)
- [Adding a Scraper](Adding-a-Scraper.md)
- [Architecture](Architecture.md)
