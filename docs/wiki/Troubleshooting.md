# Troubleshooting

This page collects the most common setup and runtime issues for the toolkit. Because the project works with live public endpoints, some failures come from local environment problems and some come from upstream source changes.

## `npx` or `tsx` is not recognized

Symptoms:

- `npx tsx src/cli.ts ...` fails immediately
- your shell reports that `npx` or `tsx` is missing

Fix:

1. Confirm Node.js and npm are installed.
2. Run `node --version` and `npm --version`.
3. Run `npm install` in the repo.
4. If you prefer not to use source mode, build and run the compiled CLI:

```powershell
npm run build
node dist/cli.js list
```

## `npm run list` works but `run` fails

Possible causes:

- the specific upstream source is temporarily unavailable
- the source response format changed
- your parameter values are invalid or too restrictive
- the upstream request hit the configured timeout

What to do:

1. Retry the scraper without extra filters.
2. Run the scraper with `--format json` to inspect raw output.
3. Compare the source homepage or API docs to the current behavior.
4. Open an issue if the upstream source appears to have changed.

If the error mentions a timeout, increase `SCRAPERS_HTTP_TIMEOUT_MS` in your `.env` file and retry.

## Unknown scraper ID

Run:

```powershell
npx tsx src/cli.ts list
```

Copy the exact scraper ID from the catalog and retry.

## Invalid limit

Use a positive integer:

```powershell
npx tsx src/cli.ts run bbc-world-news --limit 5
```

## Invalid category

The toolkit only supports these categories:

- `news`
- `weather`
- `reports`
- `academic`

If you pass another value to `list --category` or `run-all --category`, the CLI will reject it.

## Output file was not created

Check:

- whether you passed `--output`
- whether the target directory exists or can be created
- whether the scraper failed before save time

For batch runs, confirm the output directory and inspect `output/run-summary.json`.

## Desktop app cannot see the catalog

If you are using the toolkit with Open Scrapers Desk and the app cannot load scrapers:

1. confirm this repo path points to the toolkit root
2. run `npm install`
3. run `npm run build`
4. test the catalog manually:

```powershell
npx tsx src/cli.ts list --format json
```

If that command fails in the terminal, fix the toolkit first before troubleshooting the desktop app.

## When to open an issue

Open an issue when:

- a previously working source changed upstream
- the docs and the actual CLI behavior disagree
- the same failure persists after a clean install and a simple test command

Helpful issue reports include the exact command, the date, and the error text.
