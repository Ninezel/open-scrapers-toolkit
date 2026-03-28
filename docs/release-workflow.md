# Release Workflow

This repository uses a lightweight documented workflow so big feature passes do not land without matching docs, tests, and wiki updates.

## Standard workflow

1. implement the code changes
2. update the scraper catalog and user docs
3. update `CHANGELOG.md` with the current date
4. run `npm run check`
5. run `npm test`
6. run `npm run build`
7. run at least one live scraper command related to the change
8. commit with a detailed message
9. push the main repo
10. sync the GitHub wiki from `docs/wiki`

## Release note format

Use a dated heading:

```md
## 2026-03-28
```

Then group changes under `Added`, `Changed`, and `Maintenance` where it helps.

## Wiki sync rule

The wiki source in `docs/wiki` is treated as versioned documentation. When repo docs change in a meaningful way, the live GitHub wiki should be updated in the same release pass.
