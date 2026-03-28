# Scraper Catalogue

This page explains what each scraper family is for, which parameters it accepts, and how to choose the right scraper for a job. The toolkit now ships with 188 scrapers.

## Catalogue Totals

- `news`: 18
- `weather`: 3
- `reports`: 43
- `academic`: 124

## How to Inspect the Catalogue Live

Use the CLI when you want the current metadata:

```bash
npx tsx src/cli.ts list
npx tsx src/cli.ts list --category reports --search world-bank
npx tsx src/cli.ts describe website-links-ai-digest
npx tsx src/cli.ts ask "Give me academic records of Vatican Church" --resolve-only
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
- `un-news-*`
  Topic feeds from UN News covering climate change, health, human rights, peace and security, women, migrants and refugees, humanitarian aid, and the SDGs. No extra parameters.
- `who-afro-*`
  WHO AFRO featured news, emergencies, and speeches. No extra parameters.
- `reddit-random-subreddit-image`
  Pulls a random image post from a subreddit. Required parameter: `subreddit`. Optional parameters: `sort`, `timeWindow`, `allowNsfw`, `sampleSize`. Requires Reddit OAuth credentials.
- `nature-*`
  Nature topic feeds live in the academic category, but they behave like fast-moving feed scrapers with no extra parameters.

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
- `world-bank-document-search`
  Prompt-friendly World Bank document search. Parameter: `query`.

## Academic scrapers

- `crossref-ai-papers`
  Searches Crossref for AI papers. Parameter: `query`.
- `crossref-academic-search`
  Broad Crossref academic search for prompt-driven lookups. Parameter: `query`.
- `crossref-climate-papers`
  Searches Crossref for climate papers. Parameter: `query`.
- `crossref-cybersecurity-papers`
  Searches Crossref for cybersecurity papers. Parameter: `query`.
- `crossref-renewable-energy-papers`
  Searches Crossref for renewable-energy papers. Parameter: `query`.
- `europepmc-public-health`
  Searches Europe PMC for public-health research. Parameter: `query`.
- `europepmc-academic-search`
  Broad Europe PMC academic search for health and biomedical lookups. Parameter: `query`.
- `europepmc-oncology`
  Searches Europe PMC for oncology research. Parameter: `query`.
- `europepmc-infectious-disease`
  Searches Europe PMC for infectious-disease research. Parameter: `query`.
- `europepmc-mental-health`
  Searches Europe PMC for mental-health research. Parameter: `query`.
- `arxiv-machine-learning`
  Searches arXiv for machine-learning papers. Parameter: `query`.
- `arxiv-academic-search`
  Broad arXiv academic search for technical and scientific lookups. Parameter: `query`.
- `arxiv-climate-science`
  Searches arXiv for climate-science papers. Parameter: `query`.
- `arxiv-public-health`
  Searches arXiv for public-health papers. Parameter: `query`.
- `nature-*`
  Nature journal topic feeds for climate change, machine learning, genetics, cancer, and ecology. No extra parameters.
- `crossref-*` expansion pack
  Adds biodiversity, disaster risk, digital health, education policy, environmental justice, food security, public policy, sustainable finance, urban planning, water security, AI ethics, climate adaptation, migration studies, peacebuilding, Vatican studies, and more.
- `europepmc-*` expansion pack
  Adds antimicrobial resistance, digital health, environmental health, epidemiology, genomics, health systems, maternal health, nutrition, pediatrics, vaccine research, global health, primary care, virology, occupational health, and more.
- `arxiv-*` expansion pack
  Adds computer vision, cybersecurity, data science, disaster response, medical imaging, natural language processing, quantum computing, remote sensing, renewable energy systems, robotics, large language models, optimisation, geospatial analysis, astrophysics, cryptography, and more.

## Additional World Bank expansion scrapers

- `world-bank-agriculture-documents`
- `world-bank-air-pollution-documents`
- `world-bank-climate-resilience-documents`
- `world-bank-coastal-resilience-documents`
- `world-bank-disaster-risk-documents`
- `world-bank-disaster-recovery-documents`
- `world-bank-digital-development-documents`
- `world-bank-energy-documents`
- `world-bank-financial-inclusion-documents`
- `world-bank-fragility-and-conflict-documents`
- `world-bank-gender-equality-documents`
- `world-bank-governance-documents`
- `world-bank-governance-reform-documents`
- `world-bank-housing-documents`
- `world-bank-labour-markets-documents`
- `world-bank-transport-infrastructure-documents`
- `world-bank-youth-employment-documents`
- `world-bank-social-protection-documents`
- `world-bank-access-to-electricity`
- `world-bank-co2-emissions`
- `world-bank-life-expectancy`
- `world-bank-unemployment`

## Topic-pack note

The larger source families are intentionally grouped into topic-pack modules so we can add many closely related scrapers without turning the repo into 188 fully independent one-off files. Use `describe <scraper-id>` when you want the exact defaults and parameters for one entry.

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
