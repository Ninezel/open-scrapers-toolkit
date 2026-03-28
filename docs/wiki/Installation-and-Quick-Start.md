# Installation And Quick Start

```bash
npm install
npx tsx src/cli.ts list
npx tsx src/cli.ts run nasa-breaking-news --limit 5
npx tsx src/cli.ts health --format table
```

Install for app or bot usage:

```bash
npm install github:Ninezel/open-scrapers-toolkit
```

Detailed follow-up pages:

- [Library Usage](Library-Usage)
- [Scraper Catalog](Scraper-Catalog)
- [Roadmap](Roadmap)

Bulk-link example:

```bash
npx tsx src/cli.ts scrape-links examples/url-lists/demo-links.txt --output output/links-digest.json
```

Docker:

```bash
docker build -t open-scrapers-toolkit .
docker run --rm open-scrapers-toolkit list
```
