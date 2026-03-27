import type { ScraperCategory, ScraperDefinition, ScraperParameter } from "./types.js";

export const SCRAPER_CATEGORIES: ScraperCategory[] = [
  "academic",
  "news",
  "reports",
  "weather",
];

export interface ScraperCatalogEntry {
  id: string;
  category: ScraperCategory;
  name: string;
  description: string;
  homepage: string;
  sourceName?: string;
  defaults: Record<string, string>;
  params: ScraperParameter[];
}

export interface ScraperCatalogFilters {
  category?: string;
  search?: string;
}

export function isScraperCategory(value: string): value is ScraperCategory {
  return SCRAPER_CATEGORIES.includes(value as ScraperCategory);
}

export function normalizeCategoryFilter(
  value: string | undefined,
): ScraperCategory | undefined {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  if (!isScraperCategory(normalized)) {
    throw new Error(
      `Invalid category "${value}". Use one of: ${SCRAPER_CATEGORIES.join(", ")}.`,
    );
  }

  return normalized;
}

export function toCatalogEntry(
  scraper: ScraperDefinition,
): ScraperCatalogEntry {
  return {
    id: scraper.id,
    category: scraper.category,
    name: scraper.name,
    description: scraper.description,
    homepage: scraper.homepage,
    sourceName: scraper.sourceName,
    defaults: {
      ...(scraper.defaults ?? {}),
    },
    params: [...(scraper.params ?? [])],
  };
}

export function buildCatalogEntries(
  scrapers: ScraperDefinition[],
): ScraperCatalogEntry[] {
  return scrapers.map(toCatalogEntry);
}

export function filterCatalogEntries(
  entries: ScraperCatalogEntry[],
  filters: ScraperCatalogFilters = {},
): ScraperCatalogEntry[] {
  const category = normalizeCategoryFilter(filters.category);
  const search = filters.search?.trim().toLowerCase() ?? "";

  return entries.filter((entry) => {
    if (category && entry.category !== category) {
      return false;
    }

    if (!search) {
      return true;
    }

    const haystack = [
      entry.id,
      entry.category,
      entry.name,
      entry.description,
      entry.homepage,
      entry.sourceName ?? "",
      Object.keys(entry.defaults).join(" "),
      entry.params.map((parameter) => `${parameter.key} ${parameter.description}`).join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function formatScraperDetails(entry: ScraperCatalogEntry): string {
  const lines = [
    `${entry.name} [${entry.id}]`,
    `Category: ${entry.category}`,
  ];

  if (entry.sourceName) {
    lines.push(`Source: ${entry.sourceName}`);
  }

  lines.push(`Homepage: ${entry.homepage}`);
  lines.push("");
  lines.push(entry.description);

  if (Object.keys(entry.defaults).length > 0) {
    lines.push("");
    lines.push("Defaults:");
    for (const [key, value] of Object.entries(entry.defaults)) {
      lines.push(`- ${key}=${value}`);
    }
  }

  lines.push("");
  lines.push("Parameters:");

  if (entry.params.length === 0) {
    lines.push("- none");
  } else {
    for (const parameter of entry.params) {
      const required = parameter.required ? " (required)" : "";
      const example = parameter.example ? ` Example: ${parameter.example}` : "";
      lines.push(`- ${parameter.key}${required}: ${parameter.description}${example}`);
    }
  }

  lines.push("");
  lines.push(`Example run: npx tsx src/cli.ts run ${entry.id} --limit 5`);

  return lines.join("\n");
}
