import { XMLParser } from "fast-xml-parser";

import { cleanText, pickFirst, toArray } from "./utils.js";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  trimValues: true,
});

export interface ParsedFeedItem {
  id?: string;
  title?: string;
  link?: string;
  summary?: string;
  publishedAt?: string;
  authors: string[];
  categories: string[];
  raw: Record<string, unknown>;
}

function normalizeLink(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const normalized = normalizeLink(item);
      if (normalized) {
        return normalized;
      }
    }
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;

    if (typeof record.href === "string") {
      return record.href;
    }
  }

  return undefined;
}

function normalizeAuthors(value: unknown): string[] {
  return toArray(value)
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;
        return pickFirst(record.name) ?? pickFirst(record);
      }

      return undefined;
    })
    .filter((item): item is string => Boolean(item));
}

function normalizeCategories(value: unknown): string[] {
  return toArray(value)
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;
        return pickFirst(record.term) ?? pickFirst(record.category) ?? pickFirst(record);
      }

      return undefined;
    })
    .filter((item): item is string => Boolean(item));
}

export function parseFeed(xml: string): ParsedFeedItem[] {
  const parsed = parser.parse(xml) as Record<string, unknown>;

  if (typeof parsed.rss === "object" && parsed.rss !== null) {
    const channel = (parsed.rss as Record<string, unknown>).channel as
      | Record<string, unknown>
      | undefined;
    const items = toArray(channel?.item as Record<string, unknown> | Record<string, unknown>[]);

    return items.map((item) => ({
      id: pickFirst(item.guid) ?? normalizeLink(item.link) ?? pickFirst(item.title),
      title: cleanText(pickFirst(item.title)),
      link: normalizeLink(item.link),
      summary: cleanText(
        pickFirst(item.description) ??
          pickFirst(item.summary) ??
          pickFirst(item["content:encoded"]),
      ),
      publishedAt: pickFirst(item.pubDate) ?? pickFirst(item.published),
      authors: normalizeAuthors(item.creator ?? item.author),
      categories: normalizeCategories(item.category),
      raw: item,
    }));
  }

  if (typeof parsed.feed === "object" && parsed.feed !== null) {
    const feed = parsed.feed as Record<string, unknown>;
    const entries = toArray(feed.entry as Record<string, unknown> | Record<string, unknown>[]);

    return entries.map((entry) => ({
      id: pickFirst(entry.id) ?? normalizeLink(entry.link) ?? pickFirst(entry.title),
      title: cleanText(pickFirst(entry.title)),
      link: normalizeLink(entry.link),
      summary: cleanText(pickFirst(entry.summary) ?? pickFirst(entry.content)),
      publishedAt: pickFirst(entry.updated) ?? pickFirst(entry.published),
      authors: normalizeAuthors(entry.author),
      categories: normalizeCategories(entry.category),
      raw: entry,
    }));
  }

  throw new Error("Unsupported feed format. Expected RSS or Atom.");
}
