import { fetchJson, fetchText } from "./http.js";
import { parseFeed } from "./rss.js";
import type {
  ScrapedRecord,
  ScrapeResult,
  ScraperCategory,
  ScraperContext,
  ScraperDefinition,
  ScraperParameter,
} from "./types.js";
import {
  buildStableId,
  cleanText,
  fromDateParts,
  splitCommaList,
  take,
  toIsoDate,
} from "./utils.js";

interface BaseScraperConfig {
  id: string;
  name: string;
  category: ScraperCategory;
  description: string;
  homepage: string;
  sourceName: string;
  defaults?: Record<string, string>;
  params?: ScraperParameter[];
}

function buildResult(
  config: BaseScraperConfig,
  context: ScraperContext,
  records: ScrapedRecord[],
  meta?: Record<string, unknown>,
): ScrapeResult {
  return {
    scraperId: config.id,
    scraperName: config.name,
    category: config.category,
    source: config.sourceName,
    fetchedAt: context.now.toISOString(),
    records,
    meta,
  };
}

export function mergeScraperParams(
  defaults: Record<string, string> | undefined,
  params: Record<string, string>,
): Record<string, string> {
  return {
    ...(defaults ?? {}),
    ...params,
  };
}

function normalizeCrossrefDate(
  context: ScraperContext,
  item: Record<string, unknown>,
): string | undefined {
  const publishedAt =
    fromDateParts(
      ((item["published-print"] as Record<string, unknown> | undefined)?.["date-parts"] as
        | number[][]
        | undefined)?.[0],
    ) ??
    fromDateParts(
      ((item["published-online"] as Record<string, unknown> | undefined)?.["date-parts"] as
        | number[][]
        | undefined)?.[0],
    ) ??
    fromDateParts(
      ((item.created as Record<string, unknown> | undefined)?.["date-parts"] as
        | number[][]
        | undefined)?.[0],
    );

  const indexedAt = toIsoDate(
    typeof (item.indexed as Record<string, unknown> | undefined)?.["date-time"] === "string"
      ? ((item.indexed as Record<string, unknown>)["date-time"] as string)
      : undefined,
  );

  if (!publishedAt) {
    return indexedAt;
  }

  const publishedDate = new Date(publishedAt);
  const maxReasonableDate = new Date(context.now);
  maxReasonableDate.setDate(maxReasonableDate.getDate() + 30);

  if (publishedDate > maxReasonableDate) {
    return indexedAt ?? publishedAt;
  }

  return publishedAt;
}

export function createRssScraper(
  config: BaseScraperConfig & {
    feedUrl: string;
    defaultTags?: string[];
  },
): ScraperDefinition {
  return {
    ...config,
    async run(context) {
      const xml = await fetchText(context, config.feedUrl, {
        headers: {
          accept: "application/rss+xml, application/xml, text/xml",
        },
      });
      const items = take(parseFeed(xml), context.limit);

      const records = items.map<ScrapedRecord>((item) => ({
        id: buildStableId(config.id, item.id, item.link, item.title),
        source: config.sourceName,
        title: item.title ?? "Untitled feed item",
        url: item.link,
        summary: item.summary,
        publishedAt: toIsoDate(item.publishedAt),
        authors: item.authors.length > 0 ? item.authors : undefined,
        tags: Array.from(new Set([...(config.defaultTags ?? []), ...item.categories])),
        metadata: {
          feedUrl: config.feedUrl,
        },
      }));

      return buildResult(config, context, records, {
        feedUrl: config.feedUrl,
      });
    },
  };
}

export function createArxivScraper(
  config: BaseScraperConfig & {
    query: string;
    defaultTags?: string[];
  },
): ScraperDefinition {
  return {
    ...config,
    async run(context) {
      const params = mergeScraperParams(config.defaults, context.params);
      const query = params.query ?? config.query;
      const endpoint = new URL("https://export.arxiv.org/api/query");

      endpoint.searchParams.set("search_query", `all:${query}`);
      endpoint.searchParams.set("start", "0");
      endpoint.searchParams.set("max_results", String(context.limit));
      endpoint.searchParams.set("sortBy", "submittedDate");
      endpoint.searchParams.set("sortOrder", "descending");

      const xml = await fetchText(context, endpoint.toString(), {
        headers: {
          accept: "application/atom+xml, application/xml, text/xml",
        },
      });
      const items = take(parseFeed(xml), context.limit);

      const records = items.map<ScrapedRecord>((item) => ({
        id: buildStableId(config.id, item.id, item.link, item.title),
        source: config.sourceName,
        title: item.title ?? "Untitled arXiv entry",
        url: item.link,
        summary: item.summary,
        publishedAt: toIsoDate(item.publishedAt),
        authors: item.authors.length > 0 ? item.authors : undefined,
        tags: Array.from(new Set([...(config.defaultTags ?? []), ...item.categories])),
        metadata: {
          endpoint: endpoint.toString(),
          query,
        },
      }));

      return buildResult(config, context, records, {
        endpoint: endpoint.toString(),
        query,
      });
    },
  };
}

export function createCrossrefScraper(
  config: BaseScraperConfig & {
    query: string;
    filters?: string;
    defaultTags?: string[];
  },
): ScraperDefinition {
  return {
    ...config,
    async run(context) {
      const params = mergeScraperParams(config.defaults, context.params);
      const query = params.query ?? config.query;
      const endpoint = new URL("https://api.crossref.org/works");

      endpoint.searchParams.set("rows", String(context.limit));
      endpoint.searchParams.set("sort", "indexed");
      endpoint.searchParams.set("order", "desc");
      endpoint.searchParams.set("query.title", query);

      if (config.filters) {
        endpoint.searchParams.set("filter", config.filters);
      }

      const response = await fetchJson<Record<string, unknown>>(context, endpoint.toString(), {
        headers: {
          accept: "application/json",
        },
      });
      const message = response.message as Record<string, unknown> | undefined;
      const items = Array.isArray(message?.items)
        ? (message.items as Record<string, unknown>[])
        : [];

      const records = items.map<ScrapedRecord>((item) => {
        const authors = Array.isArray(item.author)
          ? (item.author as Record<string, unknown>[])
              .map((author) => {
                const given = typeof author.given === "string" ? author.given : "";
                const family = typeof author.family === "string" ? author.family : "";
                return `${given} ${family}`.trim();
              })
              .filter(Boolean)
          : [];

        return {
          id: buildStableId(config.id, String(item.DOI ?? item.URL ?? item.title)),
          source: config.sourceName,
          title:
            (Array.isArray(item.title) ? item.title[0] : item.title) as string | undefined ??
            "Untitled Crossref record",
          url:
            (typeof item.URL === "string" ? item.URL : undefined) ??
            (typeof item.DOI === "string" ? `https://doi.org/${item.DOI}` : undefined),
          summary: cleanText(typeof item.abstract === "string" ? item.abstract : undefined),
          publishedAt: normalizeCrossrefDate(context, item),
          authors: authors.length > 0 ? authors : undefined,
          tags: Array.from(
            new Set([
              ...(config.defaultTags ?? []),
              ...(Array.isArray(item.subject)
                ? item.subject.filter((value): value is string => typeof value === "string")
                : []),
            ]),
          ),
          metadata: {
            doi: item.DOI,
            publisher: item.publisher,
            type: item.type,
            references: item["reference-count"],
            citations: item["is-referenced-by-count"],
            query,
          },
        };
      });

      return buildResult(config, context, records, {
        endpoint: endpoint.toString(),
        query,
      });
    },
  };
}

export function createEuropePmcScraper(
  config: BaseScraperConfig & {
    query: string;
    defaultTags?: string[];
  },
): ScraperDefinition {
  return {
    ...config,
    async run(context) {
      const params = mergeScraperParams(config.defaults, context.params);
      const query = params.query ?? config.query;
      const endpoint = new URL(
        "https://www.ebi.ac.uk/europepmc/webservices/rest/search",
      );

      endpoint.searchParams.set("query", query);
      endpoint.searchParams.set("pageSize", String(context.limit));
      endpoint.searchParams.set("format", "json");
      endpoint.searchParams.set("sort_date", "y");

      const response = await fetchJson<Record<string, unknown>>(context, endpoint.toString(), {
        headers: {
          accept: "application/json",
        },
      });

      const records = Array.isArray(
        (response.resultList as Record<string, unknown> | undefined)?.result,
      )
        ? ((response.resultList as Record<string, unknown>).result as Record<string, unknown>[])
            .map<ScrapedRecord>((item) => ({
              id: buildStableId(config.id, String(item.id ?? item.pmid ?? item.doi ?? item.title)),
              source: config.sourceName,
              title:
                (typeof item.title === "string" ? item.title : undefined) ??
                "Untitled Europe PMC result",
              url:
                (typeof item.doi === "string" ? `https://doi.org/${item.doi}` : undefined) ??
                (typeof item.id === "string"
                  ? `https://europepmc.org/article/${item.source}/${item.id}`
                  : undefined),
              summary: cleanText(
                typeof item.abstractText === "string" ? item.abstractText : undefined,
              ),
              publishedAt:
                toIsoDate(
                  typeof item.firstPublicationDate === "string"
                    ? item.firstPublicationDate
                    : undefined,
                ) ??
                toIsoDate(
                  typeof item.dateOfCompletion === "string"
                    ? item.dateOfCompletion
                    : undefined,
                ),
              authors:
                typeof item.authorString === "string"
                  ? item.authorString
                      .split(",")
                      .map((author) => author.trim())
                      .filter(Boolean)
                  : undefined,
              tags: Array.from(
                new Set([
                  ...(config.defaultTags ?? []),
                  ...(typeof item.keywordList === "string"
                    ? splitCommaList(item.keywordList)
                    : []),
                ]),
              ),
              metadata: {
                doi: item.doi,
                journal: item.journalTitle,
                pubYear: item.pubYear,
                source: item.source,
                query,
              },
            }))
        : [];

      return buildResult(config, context, records, {
        endpoint: endpoint.toString(),
        query,
        hitCount: response.hitCount,
      });
    },
  };
}

export function createWorldBankIndicatorScraper(
  config: BaseScraperConfig & {
    indicator: string;
    defaultCountry?: string;
    defaultTags?: string[];
  },
): ScraperDefinition {
  return {
    ...config,
    async run(context) {
      const params = mergeScraperParams(config.defaults, context.params);
      const country = params.country ?? config.defaultCountry ?? "all";
      const endpoint = new URL(
        `https://api.worldbank.org/v2/country/${country}/indicator/${config.indicator}`,
      );

      endpoint.searchParams.set("format", "json");
      endpoint.searchParams.set("per_page", String(context.limit));
      endpoint.searchParams.set("mrv", "1");

      const response = await fetchJson<unknown[]>(context, endpoint.toString(), {
        headers: {
          accept: "application/json",
        },
      });

      const meta = Array.isArray(response)
        ? (response[0] as Record<string, unknown>)
        : undefined;
      const items = Array.isArray(response?.[1])
        ? (response[1] as Record<string, unknown>[])
        : [];

      const records = items
        .filter((item) => item.value !== null)
        .map<ScrapedRecord>((item) => {
          const indicator = item.indicator as Record<string, unknown> | undefined;
          const countryMeta = item.country as Record<string, unknown> | undefined;
          const indicatorLabel =
            typeof indicator?.value === "string" ? indicator.value : config.name;
          const countryLabel =
            typeof countryMeta?.value === "string" ? countryMeta.value : "Unknown";
          const period = typeof item.date === "string" ? item.date : "latest";

          return {
            id: buildStableId(config.id, String(item.countryiso3code ?? countryLabel), period),
            source: config.sourceName,
            title: `${indicatorLabel} for ${countryLabel} (${period})`,
            summary: `${indicatorLabel}: ${String(item.value)}`,
            publishedAt: toIsoDate(`${period}-01-01`),
            tags: config.defaultTags,
            location: countryLabel,
            metadata: {
              indicator: indicator?.id,
              countryIso3: item.countryiso3code,
              period,
              value: item.value,
              unit: item.unit,
            },
          };
        });

      return buildResult(config, context, records, {
        endpoint: endpoint.toString(),
        country,
        total: meta?.total,
        lastUpdated: meta?.lastupdated,
      });
    },
  };
}

export function createWorldBankDocumentsScraper(
  config: BaseScraperConfig & {
    query: string;
    defaultTags?: string[];
  },
): ScraperDefinition {
  return {
    ...config,
    async run(context) {
      const params = mergeScraperParams(config.defaults, context.params);
      const query = params.query ?? config.query;
      const endpoint = new URL("https://search.worldbank.org/api/v3/wds");

      endpoint.searchParams.set("format", "json");
      endpoint.searchParams.set("rows", String(context.limit));
      endpoint.searchParams.set("qterm", query);

      const response = await fetchJson<Record<string, unknown>>(context, endpoint.toString(), {
        headers: {
          accept: "application/json",
        },
      });

      const documents = response.documents as
        | Record<string, Record<string, unknown>>
        | undefined;
      const records = documents
        ? Object.values(documents).map<ScrapedRecord>((document) => {
            const authors = document.authors as
              | Record<string, Record<string, unknown>>
              | undefined;
            const authorList = authors
              ? Object.values(authors)
                  .map((author) =>
                    typeof author.author === "string" ? author.author : undefined,
                  )
                  .filter((author): author is string => Boolean(author))
              : [];

            const title =
              (typeof document.display_title === "string"
                ? document.display_title
                : undefined) ?? "Untitled World Bank document";

            return {
              id: buildStableId(config.id, String(document.guid ?? document.id ?? title)),
              source: config.sourceName,
              title,
              url:
                (typeof document.pdfurl === "string" ? document.pdfurl : undefined) ??
                (typeof document.url === "string" ? document.url : undefined),
              summary: cleanText(
                typeof (document.abstracts as Record<string, unknown> | undefined)?.[
                  "cdata!"
                ] === "string"
                  ? ((document.abstracts as Record<string, unknown>)["cdata!"] as string)
                  : undefined,
              ),
              publishedAt:
                toIsoDate(
                  typeof document.disclosure_date === "string"
                    ? document.disclosure_date
                    : undefined,
                ) ??
                toIsoDate(
                  typeof document.docdt === "string" ? document.docdt : undefined,
                ),
              authors: authorList.length > 0 ? authorList : undefined,
              tags: Array.from(
                new Set([
                  ...(config.defaultTags ?? []),
                  ...(typeof document.docty === "string" ? [document.docty] : []),
                  ...splitCommaList(
                    typeof document.theme === "string" ? document.theme : undefined,
                  ),
                ]),
              ),
              metadata: {
                documentType: document.docty,
                majorDocumentType: document.majdocty,
                language: document.lang,
                reportNumber: document.repnb,
                projectId: document.projectid,
                textUrl: document.txturl,
                query,
              },
            };
          })
        : [];

      return buildResult(config, context, records, {
        endpoint: endpoint.toString(),
        query,
        total: response.total,
      });
    },
  };
}
