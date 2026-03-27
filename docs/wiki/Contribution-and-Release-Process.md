# Contribution and Release Process

This page explains how work moves through the toolkit repository, from local edits to public releases. The project is meant to stay open to contributors while still holding a clear line on code quality, documentation quality, and source responsibility.

## Governance documents

Before contributing, read:

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `GOVERNANCE.md`
- `SECURITY.md`
- `SCRAPING_POLICY.md`

## What a good contribution looks like

A strong contribution usually has these traits:

- one clear purpose
- readable code
- bounded defaults
- documentation updates
- live verification against the target source
- respect for the project scraping policy

## Typical contribution flow

1. Open an issue or choose an existing one.
2. Confirm the source and scope are appropriate.
3. Create a branch.
4. Implement the scraper or improvement.
5. Update docs and catalog pages.
6. Run validation commands.
7. Open a pull request with clear notes.

## Pull request checklist

Before requesting review, make sure:

- `npm run check` passes
- the scraper can run successfully against the live source
- docs are updated
- parameter defaults are reasonable
- source caveats are explained
- no unrelated cleanup is mixed into the change

## Validation commands

```powershell
npm run check
npm run build
npx tsx src/cli.ts list --format json
```

For scraper-specific work, also run:

```powershell
npx tsx src/cli.ts run <scraper-id> --limit 5 --format json
```

## Documentation expectations in pull requests

When adding or changing a scraper, update the relevant docs:

- `docs/scraper-catalog.md`
- `docs/wiki/Scraper-Catalog.md`
- `README.md` if the change affects user-visible setup or project scope

When changing architecture or CLI behavior, update:

- `docs/architecture.md`
- `docs/wiki/Architecture.md`
- `docs/wiki/CLI-Reference.md`

## Release goals

Toolkit releases should be:

- reproducible
- documented
- friendly to both CLI users and the desktop companion app

At minimum, a release should confirm:

- the catalog loads
- core commands run
- packaged docs match the actual behavior

## Suggested release checklist

1. Run `npm run check`.
2. Run `npm run build`.
3. Run representative scrapers across each category.
4. Review docs for outdated commands or changed scraper IDs.
5. Update release notes.
6. Push tags and publish the GitHub release.

## Compatibility with Open Scrapers Desk

Because the desktop app consumes the toolkit catalog and run commands, toolkit changes should avoid breaking:

- `list --format json`
- `run`
- `run-all`
- normalized output structure

If a change affects any of those behaviors, coordinate the docs and desktop app accordingly.

## Related pages

- [Policies and Responsible Use](Policies-and-Responsible-Use.md)
- [Troubleshooting](Troubleshooting.md)
- [FAQ](FAQ.md)
