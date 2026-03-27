# CLI Reference

This page documents the command-line interface exposed by `src/cli.ts` and `dist/cli.js`. The CLI is the stable operational layer of the toolkit. It is how contributors test scrapers, how automation jobs save JSON outputs, and how the desktop companion app discovers the scraper catalog.

## Command overview

The CLI currently exposes three top-level commands:

- `list`
- `run`
- `run-all`

The CLI name is `open-scrapers`, but most local development examples use `npx tsx src/cli.ts ...`.

## `list`

Use `list` to inspect the available scraper catalog.

### Table output

```powershell
npx tsx src/cli.ts list
```

This prints a concise table with:

- scraper ID
- category
- name
- description

### JSON output

```powershell
npx tsx src/cli.ts list --format json
```

This prints machine-readable metadata for every scraper, including parameter definitions. The desktop app uses this mode to populate its catalog view.

## `run`

Use `run` to execute one scraper by ID.

### Basic syntax

```powershell
npx tsx src/cli.ts run <scraper-id>
```

### Supported options

- `-l, --limit <number>`
- `--out-dir <directory>`
- `--output <file>`
- `--format <pretty|json>`
- `-p, --param <key=value>`

### Example: preview only

```powershell
npx tsx src/cli.ts run nasa-breaking-news --limit 5
```

### Example: write JSON to disk

```powershell
npx tsx src/cli.ts run nasa-breaking-news --limit 5 --output output/nasa-breaking-news.json
```

### Example: emit raw JSON on stdout

```powershell
npx tsx src/cli.ts run europepmc-public-health --limit 3 --format json
```

### Example: pass scraper parameters

```powershell
npx tsx src/cli.ts run open-meteo-city-forecast --limit 12 --param latitude=40.7128 --param longitude=-74.0060 --param label=NewYork --param timezone=America/New_York
```

```powershell
npx tsx src/cli.ts run usgs-earthquakes --limit 20 --param minimumMagnitude=5 --param place=Chile
```

### Behavior notes

- The scraper ID must exist in the registry.
- `--limit` must be a positive integer.
- `--param` can be repeated multiple times.
- `--output` controls where the JSON file is saved.
- `--out-dir` affects the context passed to the scraper even if you do not save the result manually.

## `run-all`

Use `run-all` to execute multiple scrapers in sequence and save each result automatically.

### Basic syntax

```powershell
npx tsx src/cli.ts run-all --out-dir output
```

### Supported options

- `-c, --category <category>`
- `-l, --limit <number>`
- `--out-dir <directory>`
- `-p, --param <key=value>`

### Example: run the weather category

```powershell
npx tsx src/cli.ts run-all --category weather --limit 6 --out-dir output/weather
```

### Example: run everything

```powershell
npx tsx src/cli.ts run-all --limit 5 --out-dir output/all
```

### Example: batch parameter propagation

```powershell
npx tsx src/cli.ts run-all --category reports --limit 5 --out-dir output/reports --param country=GBR
```

Be careful with shared parameters. `run-all` forwards the same parameter set to every selected scraper, so only use shared parameters when they make sense across the batch.

### Batch output behavior

For each selected scraper, `run-all`:

1. builds a normal scraper context
2. runs the scraper
3. saves a JSON file using the default output naming pattern
4. records success or failure in an overall summary

At the end, it writes `run-summary.json` into the output directory.

## Parameters and defaults

Scraper parameters are merged in this order:

1. scraper defaults defined in the scraper module
2. values passed through `--param key=value`

That means command-line parameters override defaults without needing code changes.

## Output formats

### `pretty`

Default for `run`. Prints a human-friendly preview and summary to the terminal.

### `json`

Available on `run` and `list`. Prints the full JSON payload to stdout.

## Common examples by use case

### Build a local dataset folder

```powershell
npx tsx src/cli.ts run-all --out-dir output
```

### Collect country indicators

```powershell
npx tsx src/cli.ts run world-bank-population --param country=GBR --output output/world-bank-population-gbr.json
npx tsx src/cli.ts run world-bank-gdp --param country=GBR --output output/world-bank-gdp-gbr.json
```

### Explore current hazards

```powershell
npx tsx src/cli.ts run nws-active-alerts --limit 20 --param event=Flood
npx tsx src/cli.ts run usgs-earthquakes --limit 20 --param minimumMagnitude=4.5
```

### Feed a downstream program

```powershell
npx tsx src/cli.ts list --format json
npx tsx src/cli.ts run crossref-ai-papers --limit 10 --format json
```

## Related pages

- [Installation and Quick Start](Installation-and-Quick-Start.md)
- [Scraper Catalog](Scraper-Catalog.md)
- [Troubleshooting](Troubleshooting.md)
