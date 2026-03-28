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

export function getScraperCatalog(options: {
  category?: string;
  search?: string;
} = {}) {
  return filterCatalogEntries(buildCatalogEntries(getAllScrapers()), options);
}

export async function runScraper(
  scraper: ScraperDefinition,
  options: LibraryContextOptions = {},
): Promise<ScrapeResult> {
  return scraper.run(createScraperContext(scraper, options));
}

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

export async function runScrapersByCategory(
  category: ScraperCategory,
  options: RunManyOptions = {},
): Promise<ScrapeResult[]> {
  normalizeCategoryFilter(category);
  const selected = getAllScrapers().filter((scraper) => scraper.category === category);

  return Promise.all(selected.map((scraper) => runScraper(scraper, options)));
}

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
