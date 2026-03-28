# Scraper Catalog

This page summarizes the current starter catalog and the kinds of inputs each scraper accepts.

## News

- `bbc-world-news`: BBC world headlines, no extra parameters
- `bbc-technology-news`: BBC technology headlines, no extra parameters
- `bbc-business-news`: BBC business headlines, no extra parameters
- `bbc-science-environment-news`: BBC science and environment headlines, no extra parameters
- `nasa-breaking-news`: NASA announcements, no extra parameters
- `nasa-image-of-the-day`: NASA image posts, no extra parameters

## Weather

- `nws-active-alerts`: National Weather Service alerts, parameters `area`, `event`, `severity`
- `open-meteo-city-forecast`: hourly forecast records, parameters `latitude`, `longitude`, `label`, `timezone`, `days`
- `open-meteo-air-quality`: hourly air-quality and UV records, parameters `latitude`, `longitude`, `label`, `timezone`

## Reports

- `usgs-earthquakes`: earthquake events, parameters `minimumMagnitude`, `place`
- `world-bank-population`: latest population indicator, parameter `country`
- `world-bank-gdp`: latest GDP indicator, parameter `country`
- `world-bank-climate-documents`: World Bank climate reports, parameter `query`
- `world-bank-education-documents`: World Bank education reports, parameter `query`
- `world-bank-health-documents`: World Bank health reports, parameter `query`
- `world-bank-water-documents`: World Bank water reports, parameter `query`
- `website-links-ai-digest`: user-supplied website link file, required parameter `file`, optional `useAi`, `model`, `maxChars`, `sourceLabel`

## Academic

- `crossref-ai-papers`: parameter `query`
- `crossref-climate-papers`: parameter `query`
- `crossref-cybersecurity-papers`: parameter `query`
- `crossref-renewable-energy-papers`: parameter `query`
- `europepmc-public-health`: parameter `query`
- `europepmc-oncology`: parameter `query`
- `europepmc-infectious-disease`: parameter `query`
- `europepmc-mental-health`: parameter `query`
- `arxiv-machine-learning`: parameter `query`
- `arxiv-climate-science`: parameter `query`
- `arxiv-public-health`: parameter `query`

## Naming pattern

Scraper IDs follow a simple convention:

`source-topic-purpose`

Examples:

- `bbc-business-news`
- `world-bank-water-documents`
- `open-meteo-air-quality`
- `website-links-ai-digest`
