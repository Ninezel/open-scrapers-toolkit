# Contribution And Release Process

Recommended contributor loop:

1. add or edit a scraper
2. update docs and catalogue pages
3. update `CHANGELOG.md` with the current date
4. run `npm run check`
5. run `npm test`
6. run `npm run build`
7. run at least one live source command
8. commit with a detailed message
9. push the repo
10. sync the live GitHub wiki from `docs/wiki`

Automation included:

- CI workflow for checks, tests, and builds
- scheduled source-health workflow
