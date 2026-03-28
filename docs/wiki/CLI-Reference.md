# CLI Reference

Core commands:

```bash
npx tsx src/cli.ts list --category weather --search forecast
npx tsx src/cli.ts describe website-links-ai-digest
npx tsx src/cli.ts run bbc-business-news --limit 5 --output output/bbc-business-news.json
npx tsx src/cli.ts run-all --category academic --limit 3 --out-dir output/academic --save-format csv
npx tsx src/cli.ts scrape-links examples/url-lists/demo-links.txt --limit 3 --output output/links-digest.json
npx tsx src/cli.ts health --format table
npx tsx src/cli.ts export output/bbc-business-news.json --format all --output output/bbc-business-news.json
```

`--save-format` accepts `json`, `csv`, `ndjson`, or `all`.
