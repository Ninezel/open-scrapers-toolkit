# Compliance And Ethics

This project is open source, but it is not permissionless in the ethical sense.

## Core principles

- prefer official sources
- be transparent about where data came from
- use identifiable user agents
- keep request volume polite
- avoid collecting unnecessary personal data

## What this repo is trying to avoid

- stealth scraping
- paywall bypass
- mass extraction from fragile websites
- collecting personal profiles without consent
- undocumented scraping that others cannot review

## Bulk website list guidance

The `website-links-ai-digest` workflow is meant for public webpages that you already have permission to access.

- do not use it to bypass paywalls, logins, CAPTCHAs, or rate limits
- do not treat AI summaries as legal, medical, or factual guarantees
- keep the input list bounded and review source terms before running large batches

## Operational guidance

- cache results if you run the same source regularly
- batch large jobs instead of hammering a site
- stop using a source if the provider changes terms in a way that makes scraping inappropriate
- document all new sources clearly in the catalog

## Legal note

Contributors and users are responsible for following the rules that apply to their jurisdiction and the source they are accessing. This repository only provides software and examples.
