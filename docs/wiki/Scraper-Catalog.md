# Scraper Catalogue

Current totals:

- 188 scrapers overall
- 18 news
- 3 weather
- 43 reports
- 124 academic

Use the CLI to inspect the catalogue live:

```bash
npx tsx src/cli.ts list
npx tsx src/cli.ts describe website-links-ai-digest
npx tsx src/cli.ts ask "Give me academic records of Vatican Church" --resolve-only
```

## News

- BBC world, technology, business, science/environment
- NASA breaking news and image of the day
- UN News topic feeds
- WHO AFRO featured news, emergencies, and speeches
- Reddit random subreddit image posts with required subreddit input and OAuth credentials

## Weather

- NWS active alerts with `area`, `event`, and `severity`
- Open-Meteo city forecast with location parameters
- Open-Meteo air quality with location parameters

## Reports

- USGS earthquakes with `minimumMagnitude` and `place`
- World Bank population and GDP indicators
- World Bank climate, education, health, and water document searches
- World Bank document-search and a much larger World Bank document expansion pack
- `website-links-ai-digest` for one-URL-per-line text files

## Academic

- Crossref AI, climate, cybersecurity, renewable energy
- Crossref academic search and large Crossref topic packs
- Europe PMC public health, oncology, infectious disease, mental health
- Europe PMC academic search and large Europe PMC topic packs
- arXiv machine learning, climate science, public health
- arXiv academic search and large arXiv topic packs
- Nature topic feeds for climate change, machine learning, genetics, cancer, and ecology

## Best fit guide

- use news scrapers for headline bots and update feeds
- use weather scrapers for location-aware dashboards or alerts
- use report scrapers for official documents and indicators
- use academic scrapers for paper discovery and reading queues
- use `website-links-ai-digest` when you already curate your own list of public webpages
