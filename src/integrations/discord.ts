import type { ScrapeResult, ScrapedRecord } from "../core/types.js";
import type { LibraryContextOptions } from "../library.js";
import { runScraperById } from "../library.js";
import { truncateText } from "../core/utils.js";

export interface DiscordEmbedField {
  inline?: boolean;
  name: string;
  value: string;
}

export interface DiscordEmbedShape {
  description?: string;
  fields?: DiscordEmbedField[];
  footer?: {
    text: string;
  };
  timestamp?: string;
  title?: string;
  url?: string;
}

export interface DiscordMessagePayload {
  content?: string;
  embeds: DiscordEmbedShape[];
}

export interface DiscordRenderOptions {
  includeMetadata?: boolean;
  maxEmbedsPerMessage?: number;
  maxRecords?: number;
  titlePrefix?: string;
}

export interface DiscordRunOptions extends LibraryContextOptions, DiscordRenderOptions {}

function recordFields(record: ScrapedRecord, includeMetadata: boolean): DiscordEmbedField[] {
  const fields: DiscordEmbedField[] = [];

  if (record.publishedAt) {
    fields.push({
      inline: true,
      name: "Published",
      value: record.publishedAt,
    });
  }

  if (record.location) {
    fields.push({
      inline: true,
      name: "Location",
      value: record.location,
    });
  }

  if (record.authors?.length) {
    fields.push({
      name: "Authors",
      value: truncateText(record.authors.join(", "), 1024) ?? "Unknown",
    });
  }

  if (record.tags?.length) {
    fields.push({
      name: "Tags",
      value: truncateText(record.tags.join(", "), 1024) ?? "None",
    });
  }

  if (includeMetadata && record.metadata) {
    fields.push({
      name: "Metadata",
      value: truncateText(JSON.stringify(record.metadata), 1024) ?? "{}",
    });
  }

  return fields.slice(0, 25);
}

export function recordToDiscordEmbed(
  result: ScrapeResult,
  record: ScrapedRecord,
  options: DiscordRenderOptions = {},
): DiscordEmbedShape {
  return {
    description:
      truncateText(record.summary, 4000) ??
      "No summary provided.",
    fields: recordFields(record, options.includeMetadata ?? false),
    footer: {
      text: `${result.scraperName} • ${record.source}`,
    },
    timestamp: record.publishedAt ?? result.fetchedAt,
    title: truncateText(
      options.titlePrefix ? `${options.titlePrefix} ${record.title}` : record.title,
      250,
    ),
    url: record.url,
  };
}

export function resultToDiscordMessages(
  result: ScrapeResult,
  options: DiscordRenderOptions = {},
): DiscordMessagePayload[] {
  const maxEmbedsPerMessage = options.maxEmbedsPerMessage ?? 10;
  const maxRecords = options.maxRecords ?? 5;
  const embeds = result.records
    .slice(0, maxRecords)
    .map((record) => recordToDiscordEmbed(result, record, options));
  const messages: DiscordMessagePayload[] = [];

  for (let index = 0; index < embeds.length; index += maxEmbedsPerMessage) {
    const chunk = embeds.slice(index, index + maxEmbedsPerMessage);
    messages.push({
      content:
        index === 0
          ? `**${result.scraperName}** pulled ${result.records.length} record(s) from ${result.source} at ${result.fetchedAt}.`
          : undefined,
      embeds: chunk,
    });
  }

  if (messages.length === 0) {
    return [
      {
        content: `**${result.scraperName}** returned no records at ${result.fetchedAt}.`,
        embeds: [],
      },
    ];
  }

  return messages;
}

export async function runScraperToDiscordMessages(
  scraperId: string,
  options: DiscordRunOptions = {},
): Promise<DiscordMessagePayload[]> {
  const result = await runScraperById(scraperId, options);
  return resultToDiscordMessages(result, options);
}
