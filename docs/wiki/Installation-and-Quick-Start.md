# Installation and Quick Start

This page is the practical setup guide for running the toolkit locally. It covers the normal development path, the compiled CLI path, the environment variables that shape scraper behavior, and the commands most users need on day one.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- internet access to the public source endpoints
- a terminal such as PowerShell, Windows Terminal, or a Unix shell

## Clone and install

```powershell
git clone https://github.com/Ninezel/open-scrapers-toolkit.git
cd open-scrapers-toolkit
npm install
```

## First commands to run

List the available scrapers:

```powershell
npm run list
npx tsx src/cli.ts list --category reports --search world-bank
```

Run a single scraper:

```powershell
npx tsx src/cli.ts run bbc-world-news --limit 5
```

Save that output to a file:

```powershell
npx tsx src/cli.ts run bbc-world-news --limit 5 --output output/bbc-world-news.json
```

Inspect a scraper's defaults and parameters:

```powershell
npx tsx src/cli.ts describe open-meteo-city-forecast
```

Run all scrapers in one category:

```powershell
npx tsx src/cli.ts run-all --category academic --limit 5 --out-dir output/academic
```

Run the full catalog:

```powershell
npx tsx src/cli.ts run-all --out-dir output
```

## Source mode and compiled mode

The toolkit supports two common ways of running the CLI.

### Source mode

This is the most convenient development path.

```powershell
npx tsx src/cli.ts list
```

Use source mode when:

- you are developing locally
- you want the latest source without rebuilding
- the desktop app is pointed at a live checkout

### Compiled mode

Build once, then run the generated JavaScript:

```powershell
npm run build
node dist/cli.js list
node dist/cli.js run nasa-breaking-news --limit 10
```

Use compiled mode when:

- you want a predictable release artifact
- you are automating runs in a controlled environment
- you do not want `tsx` involved in deployment

## Common command patterns

### Pretty preview on the terminal

```powershell
npx tsx src/cli.ts run crossref-ai-papers --limit 3
```

### Raw JSON to stdout

```powershell
npx tsx src/cli.ts run crossref-ai-papers --limit 3 --format json
```

### Save JSON to a custom file

```powershell
npx tsx src/cli.ts run usgs-earthquakes --limit 5 --output output/usgs-earthquakes.json
```

### Pass scraper-specific parameters

```powershell
npx tsx src/cli.ts run open-meteo-city-forecast --param latitude=51.5072 --param longitude=-0.1276 --param label=London --param timezone=Europe/London
```

```powershell
npx tsx src/cli.ts run usgs-earthquakes --param minimumMagnitude=4.5 --param place=Japan
```

```powershell
npx tsx src/cli.ts run world-bank-gdp --param country=USA
```

## Windows note for `npm run dev`

If you use the repository `dev` script on Windows, pass an extra `--` before the scraper flags:

```powershell
npm run dev -- run bbc-world-news -- --limit 5 --output output/bbc-world-news.json
```

Using `npx tsx src/cli.ts ...` directly is usually the clearest option.

## Output layout

The toolkit writes normalized JSON payloads. There are two common output patterns:

- single-scraper runs save to the exact path passed through `--output`
- batch runs save one file per scraper inside the directory passed through `--out-dir`

`run-all` also creates a `run-summary.json` file with overall status information for the batch.

Typical output structure:

```text
output/
|- bbc-world-news.json
|- open-meteo-city-forecast.json
|- usgs-earthquakes.json
|- run-summary.json
```

## Environment variables

Copy `.env.example` to `.env` if you want to customize the defaults used by the CLI and some scrapers.

Supported variables include:

- `SCRAPERS_USER_AGENT`
- `SCRAPERS_CONTACT_EMAIL`
- `SCRAPERS_OUTPUT_DIR`
- `SCRAPERS_HTTP_TIMEOUT_MS`
- `DEFAULT_WEATHER_LATITUDE`
- `DEFAULT_WEATHER_LONGITUDE`
- `DEFAULT_WEATHER_LABEL`

### Why the user agent matters

Some public data providers expect a clear and identifiable user agent. The toolkit defaults to `OpenScrapers/0.1`, or `OpenScrapers/0.1 (<contact-email>)` when `SCRAPERS_CONTACT_EMAIL` is set.

Using a real contact email is a good practice for polite API use.

`SCRAPERS_HTTP_TIMEOUT_MS` controls the default timeout used for upstream requests. The toolkit falls back to `30000` milliseconds when the variable is missing or invalid.

## Suggested first-day workflow

1. Run `npm run list` and inspect the categories.
2. Pick one scraper from each category.
3. Save outputs into the `output/` directory.
4. Open the JSON and study the normalized record format.
5. Try a parameterized scraper such as weather, USGS, or World Bank.
6. Move on to [CLI Reference](CLI-Reference.md) and [Scraper Catalog](Scraper-Catalog.md) once the basics feel clear.

## Automated checks

Run these before opening a pull request or after making local changes:

```powershell
npm run check
npm test
```

## Using the toolkit with Open Scrapers Desk

The desktop app expects this repository root to contain:

- `package.json`
- `src/cli.ts`
- optionally `dist/cli.js`

Recommended preparation before pointing the desktop app at the toolkit:

```powershell
npm install
npm run build
```

The desktop app can still prefer source mode through `npx tsx src/cli.ts`, but having a fresh `dist/` build makes troubleshooting easier.
