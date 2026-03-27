# Policies and Responsible Use

Open Scrapers Toolkit is open source, but responsible use is part of the project design. This page collects the practical rules that contributors and users should follow when adding or running scrapers.

These guidelines complement:

- `SCRAPING_POLICY.md`
- `SECURITY.md`
- `CONTRIBUTING.md`
- `GOVERNANCE.md`

## Core principles

### Prefer official sources

Before building a scraper, look for:

1. official APIs
2. official RSS or Atom feeds
3. public structured datasets
4. stable document endpoints

### Be identifiable

Use a clear user agent. When possible, include a contact email through:

- `SCRAPERS_CONTACT_EMAIL`
- or an explicit `SCRAPERS_USER_AGENT`

### Keep request volume polite

Even public endpoints can be overloaded by careless automation. Use bounded limits, avoid aggressive polling, and cache where it makes sense.

### Minimize unnecessary data collection

Do not collect personal data just because it is technically available. If a scraper needs potentially sensitive fields, the need should be explicit, reviewable, and justified.

## Prohibited behavior

The project does not accept scrapers that:

- bypass paywalls
- evade authentication requirements
- defeat CAPTCHAs
- impersonate real users deceptively
- ignore source restrictions intentionally
- scrape private or semi-private personal profiles without a strong lawful basis

## Source selection checklist

Before adding a source, confirm:

- the source is public
- the terms or usage expectations do not clearly prohibit the approach
- the endpoint is stable enough to maintain
- the project can explain the source clearly in documentation
- the output has real user value

## Documentation as an ethical tool

Documentation is not just convenience here. It is part of the review process. Every scraper should document:

- what source it uses
- why the source is appropriate
- what parameters are supported
- how to run it
- any caveats about volume, filters, or output meaning

## Personal data guidance

If a source contains personal or quasi-personal data, slow down and ask:

1. Is the data actually needed?
2. Is the source publishing it for this kind of reuse?
3. Can the use case be met with aggregated or less sensitive fields?
4. Would a reasonable person expect this data to be collected in an open-source scraper toolkit?

If the answer is not comfortably yes, the scraper likely does not belong here.

## Security and secrets

The starter toolkit is intentionally based on public sources and does not depend on secrets for normal use. If a future source requires credentials:

- do not hardcode secrets
- do not commit tokens
- document the setup clearly
- check whether the source still fits the project's public-reuse goals

## Legal note

This project provides software, examples, and community documentation. It does not provide legal advice. Each contributor and user is responsible for complying with the rules that apply to their jurisdiction, their data source, and their use case.

## Reporting concerns

Use the repository issue tracker or security policy when you spot:

- a scraper that violates project policy
- a source that should be removed
- a security-sensitive behavior
- unclear documentation around lawful use

## Related pages

- [Adding a Scraper](Adding-a-Scraper.md)
- [Contribution and Release Process](Contribution-and-Release-Process.md)
- [FAQ](FAQ.md)
