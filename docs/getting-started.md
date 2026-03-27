# Getting Started

This guide walks through installing the toolkit, running the starter scrapers, and saving output locally.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- Internet access to the public source endpoints

## Install

```bash
npm install
```

## Inspect the catalog

```bash
npm run list
npx tsx src/cli.ts list --category weather --search forecast
```

This prints every scraper ID, category, and description.

Inspect one scraper in detail:

```bash
npx tsx src/cli.ts describe open-meteo-city-forecast
```

## Run a single scraper

Example:

```bash
npx tsx src/cli.ts run bbc-world-news --limit 5
```

Save the result to a file:

```bash
npx tsx src/cli.ts run bbc-world-news --limit 5 --output output/bbc-world-news.json
```

Print raw JSON instead of the short preview:

```bash
npx tsx src/cli.ts run crossref-ai-papers --limit 3 --format json
```

## Run every scraper

```bash
npx tsx src/cli.ts run-all --out-dir output
```

You can also limit runs by category:

```bash
npx tsx src/cli.ts run-all --category weather --limit 5 --out-dir output/weather
```

## Use scraper parameters

Some scrapers accept parameters through `--param key=value`.

Weather example:

```bash
npx tsx src/cli.ts run open-meteo-city-forecast --param latitude=40.7128 --param longitude=-74.0060 --param label=NewYork
```

USGS filtering example:

```bash
npx tsx src/cli.ts run usgs-earthquakes --param minimumMagnitude=5 --param place=Chile
```

World Bank country example:

```bash
npx tsx src/cli.ts run world-bank-gdp --param country=GBR
```

Academic query override example:

```bash
npx tsx src/cli.ts run europepmc-public-health --param query=\"mental health\"
```

If you want to use the `npm run dev` script on Windows, pass an extra `--` before scraper flags:

```bash
npm run dev -- run bbc-world-news -- --limit 5 --output output/bbc-world-news.json
```

## Build the compiled CLI

```bash
npm run build
npm run start -- list
```

## Output files

- Single runs save to the path given by `--output`.
- Batch runs save one JSON file per scraper inside the selected output directory.
- Batch runs also write `run-summary.json` with a status overview.

## Recommended first workflow

1. Run `npm run list`.
2. Pick one scraper from each category.
3. Save outputs to `output/`.
4. Review the record structure.
5. Duplicate an existing scraper when adding a new source.

## Automated checks

```bash
npm run check
npm test
```
