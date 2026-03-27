# FAQ

## Why is this project separate from the desktop app?

Because the scraper engine should stay reusable for developers, scripts, and automation without forcing a GUI stack into every install. The desktop app is a companion product, not the backend itself.

## Can I use the scrapers programmatically?

Yes. The toolkit is a normal TypeScript project. You can use the CLI, reuse the scraper modules, or fork the repository and adapt it for your own workflows.

## Why are there both source-mode and compiled CLI commands?

Source mode is faster for development because it runs the latest TypeScript directly through `tsx`. Compiled mode is cleaner for packaged or controlled environments because it uses `dist/cli.js`.

## Does every scraper save the same JSON shape?

Yes at the top level. The whole project is built around a normalized result contract so tools can consume mixed-source outputs consistently. Individual record metadata still varies by source.

## Why not include browser automation and website scraping everywhere?

Because this starter project is trying to stay durable, reviewable, and lawful to maintain. Public APIs and RSS feeds are usually a better base than brittle page automation.

## Can I add more than 15 scrapers?

Absolutely. The repository was designed to grow beyond the initial catalog. The important thing is to grow through shared conventions and documented source choices, not by adding random one-off scripts.

## What should I do when a source changes upstream?

Open an issue with:

- the scraper ID
- the exact command used
- the date of the run
- the error or changed behavior

## Is this legal everywhere?

The project does not provide legal advice. Contributors and users are responsible for complying with the rules that apply to their jurisdiction, their source, and their actual use case.

## Is the toolkit only for programmers?

No. The toolkit itself is developer-friendly, but its outputs are also meant to power the separate Open Scrapers Desk desktop app for people who prefer a GUI.
