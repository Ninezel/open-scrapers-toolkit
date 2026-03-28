import { getScraperCatalog, runScraperById, type LibraryContextOptions } from "./library.js";
import { resolveOpenMeteoLocation, type GeocodedLocation } from "./core/geocoding.js";
import type { ScrapeResult, ScraperCategory, ScraperContext } from "./core/types.js";

export type ScraperPromptConfidence = "high" | "low" | "medium";

export type ScraperPromptIntent =
  | "academic-search"
  | "air-quality"
  | "alerts"
  | "catalogue-match"
  | "earthquakes"
  | "reports-search"
  | "subreddit-image"
  | "weather";

export interface ScraperPromptResolution {
  category: ScraperCategory;
  confidence: ScraperPromptConfidence;
  intent: ScraperPromptIntent;
  params: Record<string, string>;
  prompt: string;
  queryText?: string;
  reason: string;
  renderStyle?: "auto" | "default" | "weather-card";
  scraperId: string;
}

export interface ScraperPromptResolveOptions extends LibraryContextOptions {
  locationResolver?: (
    query: string,
    options: LibraryContextOptions,
  ) => Promise<GeocodedLocation | undefined>;
}

export interface ScraperPromptRunResult {
  resolution: ScraperPromptResolution;
  result: ScrapeResult;
}

interface PromptScraperMatch {
  category: ScraperCategory;
  reason: string;
  score: number;
  scraperId: string;
}

const SEARCH_STOP_WORDS = new Set([
  "a",
  "about",
  "academic",
  "an",
  "and",
  "for",
  "from",
  "give",
  "in",
  "latest",
  "me",
  "of",
  "on",
  "please",
  "records",
  "report",
  "reports",
  "scraper",
  "show",
  "the",
  "what",
]);

const HEALTH_KEYWORDS = [
  "biomedical",
  "cancer",
  "cardio",
  "clinical",
  "disease",
  "drug",
  "epidemiology",
  "health",
  "hospital",
  "medical",
  "medicine",
  "mental health",
  "oncology",
  "patient",
  "public health",
  "vaccine",
  "virology",
];

const TECH_KEYWORDS = [
  "ai",
  "algorithm",
  "astrophysics",
  "computer",
  "computing",
  "cryptography",
  "cyber",
  "data science",
  "language model",
  "llm",
  "machine learning",
  "mathematics",
  "nlp",
  "physics",
  "quantum",
  "reinforcement learning",
  "remote sensing",
  "robotics",
  "software",
  "statistics",
];

function defaultUserAgent(contactEmail?: string): string {
  if (contactEmail?.trim()) {
    return `OpenScrapers/0.3.0 (${contactEmail.trim()})`;
  }

  return "OpenScrapers/0.3.0";
}

function buildPromptContext(options: LibraryContextOptions = {}): ScraperContext {
  return {
    cacheTtlMs: options.cacheTtlMs,
    contactEmail: options.contactEmail,
    limit: options.limit ?? 1,
    now: options.now ?? new Date(),
    outputDir: options.outputDir ?? "output",
    params: {
      ...(options.params ?? {}),
    },
    retryCount: options.retryCount,
    retryDelayMs: options.retryDelayMs,
    userAgent: options.userAgent ?? defaultUserAgent(options.contactEmail),
  };
}

function normalisePrompt(prompt: string): string {
  return prompt.replace(/\s+/gu, " ").trim();
}

function promptTokens(prompt: string): string[] {
  return normalisePrompt(prompt)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s/-]+/gu, " ")
    .split(/\s+/u)
    .filter((token) => token.length > 2 && !SEARCH_STOP_WORDS.has(token));
}

function cleanExtractedPhrase(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const cleaned = value
    .replace(/[?!.]+$/gu, "")
    .replace(/^(?:the|a|an)\s+/iu, "")
    .replace(/\b(?:please|thanks|thank you)\b$/iu, "")
    .replace(/\s+/gu, " ")
    .trim();

  return cleaned || undefined;
}

function extractPhraseAfter(prompt: string, keywords: string[]): string | undefined {
  for (const keyword of keywords) {
    const pattern = new RegExp(`${keyword}\\s+(.+)$`, "iu");
    const match = prompt.match(pattern);

    if (match?.[1]) {
      return cleanExtractedPhrase(match[1]);
    }
  }

  return undefined;
}

function extractLocationFromPrompt(prompt: string): string | undefined {
  return extractPhraseAfter(prompt, [
    " in",
    " for",
    " at",
    " near",
    " around",
  ]);
}

function stripLeadingInstruction(prompt: string): string {
  let value = normalisePrompt(prompt);
  const leadingPatterns = [
    /^(?:please\s+)?(?:show|give|find|fetch|list|get)\s+me\s+/iu,
    /^(?:please\s+)?(?:show|give|find|fetch|list|get)\s+/iu,
    /^(?:please\s+)?tell\s+me\s+/iu,
    /^(?:please\s+)?what(?:'s| is)\s+/iu,
    /^(?:please\s+)?search\s+(?:for\s+)?/iu,
  ];

  for (const pattern of leadingPatterns) {
    value = value.replace(pattern, "");
  }

  return value.trim();
}

function extractSearchQuery(
  prompt: string,
  removablePatterns: RegExp[],
): string | undefined {
  let value = stripLeadingInstruction(prompt);

  for (const pattern of removablePatterns) {
    value = value.replace(pattern, " ");
  }

  value = value
    .trimStart()
    .replace(/^(?:about|for|of|on)\s+/iu, "")
    .replace(/\b(?:about|for|of|on)\b\s*$/iu, "")
    .replace(/\s+/gu, " ")
    .trim();

  return cleanExtractedPhrase(value);
}

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

function isHealthResearchPrompt(prompt: string): boolean {
  return includesAny(prompt, HEALTH_KEYWORDS);
}

function isTechnicalResearchPrompt(prompt: string): boolean {
  return includesAny(prompt, TECH_KEYWORDS);
}

function scoreCataloguePrompt(prompt: string, tokens: string[]): PromptScraperMatch | undefined {
  const catalogue = getScraperCatalog();
  let best: PromptScraperMatch | undefined;

  for (const entry of catalogue) {
    const id = entry.id.toLowerCase();
    const name = entry.name.toLowerCase();
    const description = entry.description.toLowerCase();
    const sourceName = (entry.sourceName ?? "").toLowerCase();
    let score = 0;

    if (prompt.includes(id)) {
      score += 30;
    }

    if (prompt.includes(name)) {
      score += 22;
    }

    if (sourceName && prompt.includes(sourceName)) {
      score += 12;
    }

    if (prompt.includes(entry.category)) {
      score += 4;
    }

    for (const token of tokens) {
      if (name.includes(token)) {
        score += 5;
      } else if (id.includes(token)) {
        score += 4;
      } else if (sourceName.includes(token)) {
        score += 3;
      } else if (description.includes(token)) {
        score += 2;
      }
    }

    if (id.includes("search")) {
      score -= 2;
    }

    if (!best || score > best.score) {
      best = {
        category: entry.category,
        reason: `Matched the prompt against "${entry.name}" in the scraper catalogue.`,
        score,
        scraperId: entry.id,
      };
    }
  }

  return best && best.score >= 8 ? best : undefined;
}

function extractSubreddit(prompt: string): string | undefined {
  const match = prompt.match(/(?:^|\s)(?:r\/|subreddit\s+)([A-Za-z0-9_]+)/u);
  return cleanExtractedPhrase(match?.[1]);
}

function extractMagnitude(prompt: string): string | undefined {
  const match = prompt.match(
    /\b(?:magnitude|min(?:imum)?\s+magnitude)\s*(\d+(?:\.\d+)?)\b/iu,
  );
  return match?.[1];
}

async function resolveLocation(
  query: string | undefined,
  options: ScraperPromptResolveOptions,
): Promise<GeocodedLocation | undefined> {
  const trimmed = query?.trim();

  if (!trimmed) {
    return undefined;
  }

  const locationResolver = options.locationResolver ?? (async (locationQuery, resolverOptions) =>
    resolveOpenMeteoLocation(buildPromptContext(resolverOptions), locationQuery));

  return locationResolver(trimmed, options);
}

/**
 * Resolves a natural-language question or slash-command prompt into a scraper,
 * merged params, and presentation hints that app and bot authors can reuse.
 */
export async function resolveScraperPrompt(
  prompt: string,
  options: ScraperPromptResolveOptions = {},
): Promise<ScraperPromptResolution> {
  const trimmedPrompt = normalisePrompt(prompt);

  if (!trimmedPrompt) {
    throw new Error("Provide a prompt such as \"What is the weather in London\".");
  }

  const loweredPrompt = trimmedPrompt.toLowerCase();
  const tokens = promptTokens(trimmedPrompt);

  if (includesAny(loweredPrompt, ["reddit", "subreddit", "r/"])) {
    const subreddit = extractSubreddit(trimmedPrompt);

    if (subreddit) {
      return {
        category: "news",
        confidence: "high",
        intent: "subreddit-image",
        params: {
          allowNsfw: includesAny(loweredPrompt, [" nsfw", "18+", " adult"]) ? "true" : "false",
          subreddit,
        },
        prompt: trimmedPrompt,
        queryText: subreddit,
        reason: `Detected a subreddit image request for r/${subreddit}.`,
        scraperId: "reddit-random-subreddit-image",
      };
    }
  }

  if (includesAny(loweredPrompt, ["air quality", "aqi", "pollution", "uv index"])) {
    const locationQuery = extractLocationFromPrompt(trimmedPrompt);
    const location = await resolveLocation(locationQuery, options);

    return {
      category: "weather",
      confidence: location ? "high" : "medium",
      intent: "air-quality",
      params: location
        ? {
            label: location.label,
            latitude: location.latitude,
            longitude: location.longitude,
            timezone: location.timezone ?? "auto",
          }
        : {},
      prompt: trimmedPrompt,
      queryText: locationQuery,
      reason: location
        ? `Resolved "${locationQuery}" to ${location.label} for an air-quality lookup.`
        : "Detected an air-quality request and used the scraper defaults because no location was supplied.",
      renderStyle: "weather-card",
      scraperId: "open-meteo-air-quality",
    };
  }

  if (
    includesAny(loweredPrompt, [
      "weather",
      "forecast",
      "temperature",
      "humidity",
      "rain",
      "wind",
      "sunrise",
      "sunset",
    ])
  ) {
    const locationQuery = extractLocationFromPrompt(trimmedPrompt);
    const location = await resolveLocation(locationQuery, options);

    return {
      category: "weather",
      confidence: location ? "high" : "medium",
      intent: "weather",
      params: location
        ? {
            label: location.label,
            latitude: location.latitude,
            longitude: location.longitude,
            timezone: location.timezone ?? "auto",
          }
        : {},
      prompt: trimmedPrompt,
      queryText: locationQuery,
      reason: location
        ? `Resolved "${locationQuery}" to ${location.label} for a weather forecast lookup.`
        : "Detected a weather request and used the default Open-Meteo location because no place was supplied.",
      renderStyle: "weather-card",
      scraperId: "open-meteo-city-forecast",
    };
  }

  if (includesAny(loweredPrompt, ["alert", "warning", "watch", "advisory"])) {
    const area = extractLocationFromPrompt(trimmedPrompt);

    return {
      category: "weather",
      confidence: area ? "high" : "medium",
      intent: "alerts",
      params: area ? { area } : {},
      prompt: trimmedPrompt,
      queryText: area,
      reason: area
        ? `Detected a weather-alert request filtered to "${area}".`
        : "Detected a weather-alert request and used the unfiltered NWS alert feed.",
      renderStyle: "weather-card",
      scraperId: "nws-active-alerts",
    };
  }

  if (includesAny(loweredPrompt, ["earthquake", "earthquakes", "quake", "seismic"])) {
    const place = extractLocationFromPrompt(trimmedPrompt);
    const minimumMagnitude = extractMagnitude(trimmedPrompt);

    return {
      category: "reports",
      confidence: place || minimumMagnitude ? "high" : "medium",
      intent: "earthquakes",
      params: {
        ...(minimumMagnitude ? { minimumMagnitude } : {}),
        ...(place ? { place } : {}),
      },
      prompt: trimmedPrompt,
      queryText: place,
      reason: place
        ? `Detected an earthquake request filtered to "${place}".`
        : "Detected an earthquake request and used the recent USGS feed.",
      scraperId: "usgs-earthquakes",
    };
  }

  if (
    includesAny(loweredPrompt, [
      "academic",
      "article",
      "journal",
      "paper",
      "papers",
      "publication",
      "publications",
      "record",
      "records",
      "research",
      "study",
      "studies",
    ])
  ) {
    const queryText =
      extractSearchQuery(trimmedPrompt, [
        /\bacademic\b/giu,
        /\barticles?\b/giu,
        /\bjournals?\b/giu,
        /\bpapers?\b/giu,
        /\bpublications?\b/giu,
        /\brecords?\b/giu,
        /\bresearch\b/giu,
        /\bstudies?\b/giu,
      ]) ?? trimmedPrompt;

    if (isHealthResearchPrompt(loweredPrompt)) {
      return {
        category: "academic",
        confidence: "high",
        intent: "academic-search",
        params: {
          query: queryText,
        },
        prompt: trimmedPrompt,
        queryText,
        reason: `Detected a health-focused academic query and routed it to Europe PMC with "${queryText}".`,
        scraperId: "europepmc-academic-search",
      };
    }

    if (isTechnicalResearchPrompt(loweredPrompt)) {
      return {
        category: "academic",
        confidence: "high",
        intent: "academic-search",
        params: {
          query: queryText,
        },
        prompt: trimmedPrompt,
        queryText,
        reason: `Detected a technical academic query and routed it to arXiv with "${queryText}".`,
        scraperId: "arxiv-academic-search",
      };
    }

    return {
      category: "academic",
      confidence: "high",
      intent: "academic-search",
      params: {
        query: queryText,
      },
      prompt: trimmedPrompt,
      queryText,
      reason: `Detected a general academic query and routed it to Crossref with "${queryText}".`,
      scraperId: "crossref-academic-search",
    };
  }

  if (includesAny(loweredPrompt, ["dataset", "datasets", "document", "documents", "indicator", "report", "reports"])) {
    const queryText =
      extractSearchQuery(trimmedPrompt, [
        /\bdatasets?\b/giu,
        /\bdocuments?\b/giu,
        /\bindicators?\b/giu,
        /\breports?\b/giu,
      ]) ?? trimmedPrompt;

    return {
      category: "reports",
      confidence: "high",
      intent: "reports-search",
      params: {
        query: queryText,
      },
      prompt: trimmedPrompt,
      queryText,
      reason: `Detected a reports query and routed it to the World Bank document search with "${queryText}".`,
      scraperId: "world-bank-document-search",
    };
  }

  const matchedCatalogueScraper = scoreCataloguePrompt(loweredPrompt, tokens);

  if (matchedCatalogueScraper) {
    return {
      category: matchedCatalogueScraper.category,
      confidence: matchedCatalogueScraper.score >= 18 ? "high" : "medium",
      intent: "catalogue-match",
      params: {},
      prompt: trimmedPrompt,
      reason: matchedCatalogueScraper.reason,
      scraperId: matchedCatalogueScraper.scraperId,
    };
  }

  return {
    category: "news",
    confidence: "low",
    intent: "catalogue-match",
    params: {},
    prompt: trimmedPrompt,
    reason: "No strong prompt match was found, so the router fell back to BBC World News.",
    scraperId: "bbc-world-news",
  };
}

/**
 * Resolves a natural-language prompt, runs the chosen scraper, and returns both
 * the routing decision and the normalised result for further formatting.
 */
export async function runScraperPrompt(
  prompt: string,
  options: ScraperPromptResolveOptions = {},
): Promise<ScraperPromptRunResult> {
  const resolution = await resolveScraperPrompt(prompt, options);
  const result = await runScraperById(resolution.scraperId, {
    ...options,
    params: {
      ...resolution.params,
      ...(options.params ?? {}),
    },
  });

  return {
    resolution,
    result,
  };
}
