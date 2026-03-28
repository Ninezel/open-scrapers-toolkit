# Scraper Catalog

Use the CLI to inspect the catalog live:

```bash
npx tsx src/cli.ts list
npx tsx src/cli.ts describe website-links-ai-digest
```

## News

- BBC world, technology, business, science/environment
- NASA breaking news and image of the day

## Weather

- NWS active alerts with `area`, `event`, and `severity`
- Open-Meteo city forecast with location parameters
- Open-Meteo air quality with location parameters

## Reports

- USGS earthquakes with `minimumMagnitude` and `place`
- World Bank population and GDP indicators
- World Bank climate, education, health, and water document searches
- `website-links-ai-digest` for one-URL-per-line text files

## Academic

- Crossref AI, climate, cybersecurity, renewable energy
- Europe PMC public health, oncology, infectious disease, mental health
- arXiv machine learning, climate science, public health

## Best fit guide

- use news scrapers for headline bots and update feeds
- use weather scrapers for location-aware dashboards or alerts
- use report scrapers for official documents and indicators
- use academic scrapers for paper discovery and reading queues
- use `website-links-ai-digest` when you already curate your own list of public webpages
