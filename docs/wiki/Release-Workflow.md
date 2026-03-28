# Release Workflow

Toolkit release flow:

1. finish the code changes
2. update repo docs and wiki source pages
3. add a date-and-time entry to `CHANGELOG.md`
4. run checks, tests, and a build
5. run at least one live scraper command
6. commit with a detailed message
7. push the repository
8. sync the live GitHub wiki

Timestamp format example:

```md
## 2026-03-28 10:44:09 +00:00
```

Use a separate timestamped heading for every same-day release so source, doc, and workflow updates do not blur together in one daily entry.
