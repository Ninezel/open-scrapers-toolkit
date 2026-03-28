import {
  buildCatalogEntries,
  filterCatalogEntries,
  normalizeCategoryFilter,
} from "./core/catalog.js";
import { runHealthChecks } from "./core/health.js";
import { getAllScrapers, getScraperById } from "./core/registry.js";
import type {
  ScrapeResult,
  ScraperCategory,
  ScraperContext,
  ScraperDefinition,
} from "./core/types.js";

/**
 * Common runtime options accepted by the library runner helpers.
 * These mirror the same ideas used by the CLI, but are passed directly in code.
 */
export interface LibraryContextOptions {
  cacheTtlMs?: number;
  contactEmail?: string;
  limit?: number;
  now?: Date;
  outputDir?: string;
  params?: Record<string, string>;
  retryCount?: number;
  retryDelayMs?: number;
  userAgent?: string;
}

/**
 * Options for helpers that run more than one scraper.
 * Use `category` and `search` to filter the catalogue before execution.
 */
export interface RunManyOptions extends LibraryContextOptions {
  category?: string;
  search?: string;
}

function defaultUserAgent(contactEmail?: string): string {
  if (contactEmail?.trim()) {
    return `OpenScrapers/0.3.0 (${contactEmail.trim()})`;
  }

  return "OpenScrapers/0.3.0";
}

/**
 * Builds the normalised scraper context object used by every scraper module.
 * Most app developers will call `runScraperById()` instead of this directly.
 */
export function createScraperContext(
  scraper: ScraperDefinition,
  options: LibraryContextOptions = {},
): ScraperContext {
  return {
    contactEmail: options.contactEmail,
    cacheTtlMs: options.cacheTtlMs,
    limit: options.limit ?? 10,
    now: options.now ?? new Date(),
    outputDir: options.outputDir ?? "output",
    params: {
      ...(scraper.defaults ?? {}),
      ...(options.params ?? {}),
    },
    retryCount: options.retryCount,
    retryDelayMs: options.retryDelayMs,
    userAgent: options.userAgent ?? defaultUserAgent(options.contactEmail),
  };
}

/**
 * Returns a filtered catalogue that is suitable for bot command pickers,
 * app-side discovery screens, or validating scraper IDs before execution.
 */
export function getScraperCatalog(options: {
  category?: string;
  search?: string;
} = {}) {
  return filterCatalogEntries(buildCatalogEntries(getAllScrapers()), options);
}

/**
 * Runs a scraper definition directly.
 * Use this when you already have the scraper object and do not need ID lookup.
 */
export async function runScraper(
  scraper: ScraperDefinition,
  options: LibraryContextOptions = {},
): Promise<ScrapeResult> {
  return scraper.run(createScraperContext(scraper, options));
}

/**
 * Runs one scraper by its catalogue ID and returns a normalised `ScrapeResult`.
 * This is the main entry point for most app and bot integrations.
 */
export async function runScraperById(
  scraperId: string,
  options: LibraryContextOptions = {},
): Promise<ScrapeResult> {
  const scraper = getScraperById(scraperId);

  if (!scraper) {
    throw new Error(`Unknown scraper "${scraperId}".`);
  }

  return runScraper(scraper, options);
}

/**
 * Runs every scraper in a single category such as `news` or `weather`.
 * Returns one normalised result per scraper.
 */
export async function runScrapersByCategory(
  category: ScraperCategory,
  options: RunManyOptions = {},
): Promise<ScrapeResult[]> {
  normalizeCategoryFilter(category);
  const selected = getAllScrapers().filter((scraper) => scraper.category === category);

  return Promise.all(selected.map((scraper) => runScraper(scraper, options)));
}

/**
 * Runs a filtered slice of the catalogue using the same `category` and `search`
 * style filters used by the catalogue view helpers.
 */
export async function runScrapersFromCatalog(
  options: RunManyOptions = {},
): Promise<ScrapeResult[]> {
  const selectedIds = new Set(
    getScraperCatalog({
      category: options.category,
      search: options.search,
    }).map((entry) => entry.id),
  );

  return Promise.all(
    getAllScrapers()
      .filter((scraper) => selectedIds.has(scraper.id))
      .map((scraper) => runScraper(scraper, options)),
  );
}

/**
 * Runs the built-in source health workflow from code and returns the health
 * report in the same normalised `ScrapeResult` shape used elsewhere.
 */
export async function runLibraryHealth(
  options: RunManyOptions = {},
): Promise<ScrapeResult> {
  const selectedIds = new Set(
    getScraperCatalog({
      category: options.category,
      search: options.search,
    }).map((entry) => entry.id),
  );
  const selected = getAllScrapers().filter((scraper) => selectedIds.has(scraper.id));

  return runHealthChecks(selected, {
    buildContext: (scraper) => createScraperContext(scraper, options),
  });
}
