import type { ScrapeResult, ScrapedRecord } from "../core/types.js";
import { describeOpenMeteoWeather } from "../core/weather.js";
import { splitCommaList, truncateText, uniqueStrings } from "../core/utils.js";
import type { LibraryContextOptions } from "../library.js";
import { getScraperCatalog, runScraperById } from "../library.js";
import {
  runScraperPrompt,
  type ScraperPromptResolution,
  type ScraperPromptResolveOptions,
} from "../prompt-router.js";
import { postJsonWebhook, type PublishResponse } from "../publishers.js";

/** One field inside a Discord embed payload. */
export interface DiscordEmbedField {
  inline?: boolean;
  name: string;
  value: string;
}

/** Minimal Discord embed shape compatible with common bot libraries. */
export interface DiscordEmbedShape {
  author?: {
    icon_url?: string;
    name: string;
    url?: string;
  };
  color?: number;
  description?: string;
  fields?: DiscordEmbedField[];
  footer?: {
    icon_url?: string;
    text: string;
  };
  image?: {
    url: string;
  };
  thumbnail?: {
    url: string;
  };
  timestamp?: string;
  title?: string;
  url?: string;
}

/** Discord-style message payload returned by the formatter helpers. */
export interface DiscordMessagePayload {
  content?: string;
  embeds: DiscordEmbedShape[];
}

/** Plain-object slash-command option shape that bot authors can register directly. */
export interface DiscordSlashCommandOptionShape {
  description: string;
  max_length?: number;
  max_value?: number;
  min_length?: number;
  min_value?: number;
  name: string;
  required?: boolean;
  type: 3 | 4;
}

/** Plain-object slash-command definition compatible with the Discord API. */
export interface DiscordSlashCommandDefinition {
  description: string;
  dm_permission?: boolean;
  name: string;
  options: DiscordSlashCommandOptionShape[];
  type?: 1;
}

/** Channel-specific safety state used when filtering NSFW content. */
export interface DiscordChannelContext {
  allowNsfw?: boolean;
  id?: string;
  isNsfw?: boolean;
  name?: string;
}

/** Lightweight channel input used to build a validated `DiscordChannelContext`. */
export interface DiscordChannelLookup {
  id?: string;
  name?: string;
  nsfw?: boolean;
}

/** Policy options for deciding whether NSFW content may be posted. */
export interface DiscordChannelPolicyOptions {
  allowAllNsfwChannels?: boolean;
  nsfwEnabledChannelIds?: string[];
}

export type DiscordContentRating = "nsfw" | "sfw";
export type DiscordDeliveryMode = "custom" | "every-3-hours" | "hourly" | "on-demand";
export type DiscordRenderStyle = "auto" | "default" | "weather-card";

/** Result of validating one record against one Discord channel. */
export interface DiscordSafetyDecision {
  allowed: boolean;
  channelRating: DiscordContentRating;
  contentRating: DiscordContentRating;
  reason?: string;
}

/** Split view of which records were allowed or blocked for a channel. */
export interface DiscordFilterResult {
  allowedRecords: ScrapedRecord[];
  blockedRecords: ScrapedRecord[];
}

/** Time-based scheduling options for recurring Discord posts. */
export interface DiscordScheduleOptions {
  alignToClock?: boolean;
  intervalHours?: number;
  offsetMinutes?: number;
}

/** Slash-command or picker-friendly scraper choice shape. */
export interface DiscordScraperChoice {
  name: string;
  value: string;
}

/** Prebuilt schedule preset that bots can reuse for recurring posts. */
export interface DiscordScheduleProfile {
  label: string;
  mode: DiscordDeliveryMode;
  schedule?: DiscordScheduleOptions;
  weatherCadenceHours: number;
}

/** Rendering options for turning normalised results into Discord payloads. */
export interface DiscordRenderOptions {
  channel?: DiscordChannelContext;
  includeImages?: boolean;
  includeMetadata?: boolean;
  maxEmbedsPerMessage?: number;
  maxRecords?: number;
  style?: DiscordRenderStyle;
  throwOnUnsafeContent?: boolean;
  titlePrefix?: string;
  weatherCadenceHours?: number;
}

/** Combined scraper-runner and Discord-render options. */
export interface DiscordRunOptions extends LibraryContextOptions, DiscordRenderOptions {}

/** Combined prompt-router and Discord-render options for `/scraper` style flows. */
export interface DiscordPromptRunOptions
  extends DiscordRunOptions,
    ScraperPromptResolveOptions {}

/** Full output of a prompt-based Discord helper call. */
export interface DiscordPromptMessageResult {
  messages: DiscordMessagePayload[];
  resolution: ScraperPromptResolution;
  result: ScrapeResult;
}

function numberFromUnknown(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function booleanFromUnknown(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "y", "on"].includes(normalized)) {
      return true;
    }
    if (["0", "false", "no", "n", "off"].includes(normalized)) {
      return false;
    }
  }

  return undefined;
}

function stringFromUnknown(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function categoryColor(result: ScrapeResult): number {
  switch (result.category) {
    case "academic":
      return 0x2563eb;
    case "reports":
      return 0xd97706;
    case "weather":
      return 0x10b981;
    default:
      return 0x0891b2;
  }
}

function channelLabel(channel: DiscordChannelContext | undefined): string {
  if (channel?.name) {
    return `#${channel.name}`;
  }

  if (channel?.id) {
    return `channel ${channel.id}`;
  }

  return "this channel";
}

function imageUrlFromRecord(record: ScrapedRecord): string | undefined {
  const metadata = record.metadata ?? {};
  const imageUrl = stringFromUnknown(metadata.imageUrl);

  if (imageUrl) {
    return imageUrl;
  }

  const thumbnailUrl = stringFromUnknown(metadata.thumbnailUrl);

  if (thumbnailUrl) {
    return thumbnailUrl;
  }

  if (record.url && /\.(gif|jpe?g|png|webp)(\?.*)?$/iu.test(record.url)) {
    return record.url;
  }

  return undefined;
}

function formatIsoTime(value: string | undefined, timeZone?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(parsed);
}

function formatNumber(value: number | undefined, suffix: string): string {
  return value === undefined ? "n/a" : `${value.toFixed(1)}${suffix}`;
}

function weatherCadenceHours(options: DiscordRenderOptions): number {
  return normalizeIntervalHours(options.weatherCadenceHours);
}

function normalizeIntervalHours(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return 1;
  }

  return Math.floor(value);
}

function cadenceLabel(hours: number): string {
  return hours === 1 ? "hourly" : `every ${hours} hours`;
}

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

function buildDefaultEmbed(
  result: ScrapeResult,
  record: ScrapedRecord,
  options: DiscordRenderOptions,
): DiscordEmbedShape {
  const imageUrl = options.includeImages === false ? undefined : imageUrlFromRecord(record);

  return {
    color: categoryColor(result),
    description: truncateText(record.summary, 4000) ?? "No summary provided.",
    fields: recordFields(record, options.includeMetadata ?? false),
    footer: {
      text: `${result.scraperName} • ${record.source}`,
    },
    image: imageUrl ? { url: imageUrl } : undefined,
    thumbnail: imageUrl ? { url: imageUrl } : undefined,
    timestamp: record.publishedAt ?? result.fetchedAt,
    title: truncateText(
      options.titlePrefix ? `${options.titlePrefix} ${record.title}` : record.title,
      250,
    ),
    url: record.url,
  };
}

function weatherSeverityColor(severity: string | undefined): number {
  switch (severity?.trim().toLowerCase()) {
    case "extreme":
      return 0xb91c1c;
    case "severe":
      return 0xea580c;
    case "moderate":
      return 0xd97706;
    case "minor":
      return 0x16a34a;
    default:
      return 0x2563eb;
  }
}

function buildWeatherForecastEmbed(
  result: ScrapeResult,
  record: ScrapedRecord,
): DiscordEmbedShape {
  const metadata = record.metadata ?? {};
  const timeZone = stringFromUnknown(metadata.timezone);
  const descriptor = describeOpenMeteoWeather(
    numberFromUnknown(metadata.weatherCode) ?? numberFromUnknown(metadata.currentWeatherCode),
    booleanFromUnknown(metadata.isDay) ?? true,
  );
  const timeLabel = formatIsoTime(record.publishedAt ?? result.fetchedAt, timeZone) ?? "now";
  const sunrise = formatIsoTime(stringFromUnknown(metadata.sunrise), timeZone);
  const sunset = formatIsoTime(stringFromUnknown(metadata.sunset), timeZone);
  const footerParts = [
    sunrise ? `Sunrise ${sunrise}` : undefined,
    sunset ? `Sunset ${sunset}` : undefined,
    result.source,
  ].filter((value): value is string => Boolean(value));

  return {
    color: descriptor.color,
    description: `${record.location ?? stringFromUnknown(result.meta?.label) ?? "Unknown location"}\n${descriptor.label}`,
    fields: [
      {
        inline: true,
        name: "Temperature",
        value: formatNumber(numberFromUnknown(metadata.temperature), " °C"),
      },
      {
        inline: true,
        name: "Feels Like",
        value: formatNumber(
          numberFromUnknown(metadata.apparentTemperature) ??
            numberFromUnknown(metadata.currentApparentTemperature),
          " °C",
        ),
      },
      {
        inline: true,
        name: "Humidity",
        value:
          numberFromUnknown(metadata.relativeHumidity) === undefined
            ? "n/a"
            : `${numberFromUnknown(metadata.relativeHumidity)?.toFixed(0)}%`,
      },
      {
        inline: true,
        name: "Rain Chance",
        value:
          numberFromUnknown(metadata.precipitationProbability) === undefined
            ? "n/a"
            : `${numberFromUnknown(metadata.precipitationProbability)?.toFixed(0)}%`,
      },
      {
        inline: true,
        name: "Wind",
        value: formatNumber(numberFromUnknown(metadata.windSpeed10m), " km/h"),
      },
    ],
    footer: {
      text: footerParts.join(" • "),
    },
    timestamp: record.publishedAt ?? result.fetchedAt,
    title: `${descriptor.emoji} Weather Update at ${timeLabel}`,
    url: record.url,
  };
}

function airQualityColor(aqi: number | undefined): number {
  if (aqi === undefined) {
    return 0x64748b;
  }

  if (aqi <= 50) {
    return 0x16a34a;
  }

  if (aqi <= 100) {
    return 0xd97706;
  }

  if (aqi <= 150) {
    return 0xea580c;
  }

  return 0xb91c1c;
}

function buildAirQualityEmbed(
  result: ScrapeResult,
  record: ScrapedRecord,
): DiscordEmbedShape {
  const metadata = record.metadata ?? {};
  const timeZone = stringFromUnknown(metadata.timezone);
  const timeLabel = formatIsoTime(record.publishedAt ?? result.fetchedAt, timeZone) ?? "now";
  const usAqi = numberFromUnknown(metadata.usAqi);

  return {
    color: airQualityColor(usAqi),
    description: `${record.location ?? "Unknown location"}\nAir quality and UV snapshot`,
    fields: [
      {
        inline: true,
        name: "US AQI",
        value: usAqi === undefined ? "n/a" : usAqi.toFixed(0),
      },
      {
        inline: true,
        name: "PM2.5",
        value: formatNumber(numberFromUnknown(metadata.pm25), " μg/m³"),
      },
      {
        inline: true,
        name: "PM10",
        value: formatNumber(numberFromUnknown(metadata.pm10), " μg/m³"),
      },
      {
        inline: true,
        name: "UV Index",
        value:
          numberFromUnknown(metadata.uvIndex) === undefined
            ? "n/a"
            : numberFromUnknown(metadata.uvIndex)?.toFixed(1) ?? "n/a",
      },
    ],
    footer: {
      text: `${result.scraperName} • ${result.source}`,
    },
    timestamp: record.publishedAt ?? result.fetchedAt,
    title: `🌫️ Air Quality Update at ${timeLabel}`,
    url: record.url,
  };
}

function buildWeatherAlertEmbed(
  result: ScrapeResult,
  record: ScrapedRecord,
): DiscordEmbedShape {
  const metadata = record.metadata ?? {};
  const severity = stringFromUnknown(metadata.severity);
  const endsAt = stringFromUnknown(metadata.ends);

  return {
    color: weatherSeverityColor(severity),
    description: truncateText(record.summary, 4000) ?? "Weather alert issued.",
    fields: [
      {
        inline: true,
        name: "Event",
        value: stringFromUnknown(metadata.event) ?? record.title,
      },
      {
        inline: true,
        name: "Severity",
        value: severity ?? "Unknown",
      },
      {
        inline: true,
        name: "Area",
        value: record.location ?? "Unknown",
      },
      ...(endsAt
        ? [
            {
              inline: true,
              name: "Ends",
              value: endsAt,
            } satisfies DiscordEmbedField,
          ]
        : []),
    ],
    footer: {
      text: `${result.scraperName} • ${result.source}`,
    },
    timestamp: record.publishedAt ?? result.fetchedAt,
    title: `⚠️ ${record.title}`,
    url: record.url,
  };
}

function weatherRecordToDiscordEmbed(
  result: ScrapeResult,
  record: ScrapedRecord,
): DiscordEmbedShape {
  switch (result.scraperId) {
    case "open-meteo-air-quality":
      return buildAirQualityEmbed(result, record);
    case "nws-active-alerts":
      return buildWeatherAlertEmbed(result, record);
    default:
      return buildWeatherForecastEmbed(result, record);
  }
}

function resolveRenderStyle(
  result: ScrapeResult,
  options: DiscordRenderOptions,
): DiscordRenderStyle {
  if (options.style && options.style !== "auto") {
    return options.style;
  }

  return result.category === "weather" ? "weather-card" : "default";
}

function normalizeScheduleOptions(
  options: DiscordScheduleOptions = {},
): Required<DiscordScheduleOptions> {
  const intervalHours = normalizeIntervalHours(options.intervalHours);

  return {
    alignToClock: options.alignToClock ?? true,
    intervalHours:
      Number.isFinite(intervalHours) && intervalHours > 0 ? Math.floor(intervalHours) : 1,
    offsetMinutes:
      Number.isFinite(options.offsetMinutes ?? 0) && (options.offsetMinutes ?? 0) >= 0
        ? Math.floor(options.offsetMinutes ?? 0)
        : 0,
  };
}

/**
 * Parses a comma-separated channel ID list into unique Discord channel IDs.
 * Useful for environment variables such as `DISCORD_ALLOWED_NSFW_CHANNEL_IDS`.
 */
export function parseDiscordChannelIdList(
  value: string | undefined | null,
): string[] {
  return uniqueStrings(splitCommaList(value));
}

/**
 * Builds the channel context used by the Discord safety helpers.
 * A channel only gets `allowNsfw=true` when it is actually NSFW and the policy allows it.
 */
export function buildDiscordChannelContext(
  channel: DiscordChannelLookup | undefined,
  options: DiscordChannelPolicyOptions = {},
): DiscordChannelContext {
  const id = stringFromUnknown(channel?.id);
  const name = stringFromUnknown(channel?.name);
  const isNsfw = channel?.nsfw === true;
  const enabledChannelIds = new Set(uniqueStrings(options.nsfwEnabledChannelIds ?? []));
  const allowConfigured =
    options.allowAllNsfwChannels === true || (id ? enabledChannelIds.has(id) : false);

  return {
    allowNsfw: isNsfw && allowConfigured,
    id,
    isNsfw,
    name,
  };
}

/**
 * Creates a reusable delivery profile for on-demand, hourly, every-3-hours,
 * or custom recurring Discord posting workflows.
 */
export function buildDiscordScheduleProfile(
  mode: DiscordDeliveryMode,
  options: DiscordScheduleOptions = {},
): DiscordScheduleProfile {
  switch (mode) {
    case "hourly": {
      const schedule = normalizeScheduleOptions({
        ...options,
        intervalHours: 1,
      });

      return {
        label: "hourly",
        mode,
        schedule,
        weatherCadenceHours: 1,
      };
    }
    case "every-3-hours": {
      const schedule = normalizeScheduleOptions({
        ...options,
        intervalHours: 3,
      });

      return {
        label: "every 3 hours",
        mode,
        schedule,
        weatherCadenceHours: 3,
      };
    }
    case "custom": {
      const intervalHours = normalizeIntervalHours(options.intervalHours);
      const schedule = normalizeScheduleOptions({
        ...options,
        intervalHours,
      });

      return {
        label: intervalHours === 1 ? "hourly" : `every ${intervalHours} hours`,
        mode,
        schedule,
        weatherCadenceHours: intervalHours,
      };
    }
    case "on-demand":
    default:
      return {
        label: "on demand",
        mode: "on-demand",
        weatherCadenceHours: 1,
      };
  }
}

function coerceDate(value: Date | string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = value instanceof Date ? new Date(value) : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function isNsfwRecord(record: ScrapedRecord): boolean {
  const metadata = record.metadata ?? {};
  const tags = (record.tags ?? []).map((tag) => tag.toLowerCase());

  return Boolean(
    booleanFromUnknown(metadata.nsfw) ||
      booleanFromUnknown(metadata.over18) ||
      tags.includes("nsfw"),
  );
}

/** Infers whether a normalised record should be treated as SFW or NSFW. */
export function inferDiscordRecordContentRating(
  record: ScrapedRecord,
): DiscordContentRating {
  return isNsfwRecord(record) ? "nsfw" : "sfw";
}

/**
 * Checks whether a record is allowed in the target Discord channel and returns
 * a structured decision instead of throwing.
 */
export function validateDiscordRecordForChannel(
  record: ScrapedRecord,
  channel?: DiscordChannelContext,
): DiscordSafetyDecision {
  const contentRating = inferDiscordRecordContentRating(record);
  const channelRating: DiscordContentRating = channel?.isNsfw ? "nsfw" : "sfw";

  if (contentRating === "nsfw" && !(channel?.isNsfw && channel.allowNsfw)) {
    return {
      allowed: false,
      channelRating,
      contentRating,
      reason: `"${record.title}" is marked NSFW and ${channelLabel(channel)} is not explicitly enabled for NSFW content.`,
    };
  }

  return {
    allowed: true,
    channelRating,
    contentRating,
  };
}

/** Throws when a record is not allowed in the given Discord channel. */
export function assertDiscordRecordAllowedForChannel(
  record: ScrapedRecord,
  channel?: DiscordChannelContext,
): void {
  const decision = validateDiscordRecordForChannel(record, channel);

  if (!decision.allowed) {
    throw new Error(decision.reason ?? "Discord channel safety validation failed.");
  }
}

/**
 * Splits a scraper result into records that are safe to post and records that
 * should be blocked for the given channel.
 */
export function filterDiscordResultForChannel(
  result: ScrapeResult,
  channel?: DiscordChannelContext,
): DiscordFilterResult {
  const allowedRecords: ScrapedRecord[] = [];
  const blockedRecords: ScrapedRecord[] = [];

  for (const record of result.records) {
    const decision = validateDiscordRecordForChannel(record, channel);

    if (decision.allowed) {
      allowedRecords.push(record);
    } else {
      blockedRecords.push(record);
    }
  }

  return {
    allowedRecords,
    blockedRecords,
  };
}

/**
 * Picks a cadence-friendly subset of weather records, such as hourly or every
 * three hours, starting from the active forecast window when available.
 */
export function selectWeatherCadenceRecords(
  result: ScrapeResult,
  options: {
    intervalHours?: number;
    maxRecords?: number;
  } = {},
): ScrapedRecord[] {
  const intervalHours =
    Number.isFinite(options.intervalHours ?? 1) && (options.intervalHours ?? 1) > 0
      ? Math.floor(options.intervalHours ?? 1)
      : 1;
  const intervalMs = intervalHours * 60 * 60 * 1000;
  const maxRecords =
    Number.isFinite(options.maxRecords ?? 3) && (options.maxRecords ?? 3) > 0
      ? Math.floor(options.maxRecords ?? 3)
      : 3;
  const candidates = result.records
    .map((record) => ({
      publishedAt: record.publishedAt ? new Date(record.publishedAt).getTime() : NaN,
      record,
    }))
    .filter((entry) => Number.isFinite(entry.publishedAt))
    .sort((left, right) => left.publishedAt - right.publishedAt);

  if (candidates.length === 0) {
    return result.records.slice(0, maxRecords);
  }

  const currentMeta =
    result.meta && typeof result.meta.current === "object" && result.meta.current
      ? (result.meta.current as Record<string, unknown>)
      : undefined;
  const currentTime = coerceDate(stringFromUnknown(currentMeta?.time));
  const fetchedTime = coerceDate(result.fetchedAt);
  const referenceTime =
    currentTime && fetchedTime
      ? new Date(Math.max(currentTime.getTime(), fetchedTime.getTime()))
      : currentTime ?? fetchedTime ?? undefined;
  const referenceMs = referenceTime?.getTime();
  const activeCandidates =
    referenceMs === undefined
      ? candidates
      : candidates.filter((candidate) => candidate.publishedAt >= referenceMs);
  const pool = activeCandidates.length > 0 ? activeCandidates : candidates;

  const selected: ScrapedRecord[] = [];
  let lastSelectedAt: number | undefined;

  for (const candidate of pool) {
    if (selected.length === 0 || candidate.publishedAt - (lastSelectedAt ?? 0) >= intervalMs) {
      selected.push(candidate.record);
      lastSelectedAt = candidate.publishedAt;
    }

    if (selected.length >= maxRecords) {
      break;
    }
  }

  return selected;
}

/** Returns the next scheduled posting time for a recurring Discord job. */
export function nextDiscordScheduledRunAt(
  options: DiscordScheduleOptions = {},
  from = new Date(),
): Date {
  const normalized = normalizeScheduleOptions(options);
  const intervalMs = normalized.intervalHours * 60 * 60 * 1000;
  const offsetMs = normalized.offsetMinutes * 60 * 1000;
  const baseTime = from.getTime() - offsetMs;
  const nextBoundary = (Math.floor(baseTime / intervalMs) + 1) * intervalMs + offsetMs;

  return new Date(nextBoundary);
}

/** Returns `true` when a recurring Discord job is due to run now. */
export function shouldRunDiscordSchedule(
  lastRunAt: Date | string | undefined,
  options: DiscordScheduleOptions = {},
  now = new Date(),
): boolean {
  const normalized = normalizeScheduleOptions(options);
  const lastRun = coerceDate(lastRunAt);

  if (!lastRun) {
    return true;
  }

  if (!normalized.alignToClock) {
    const intervalMs = normalized.intervalHours * 60 * 60 * 1000;
    return now.getTime() - lastRun.getTime() >= intervalMs;
  }

  return nextDiscordScheduledRunAt(normalized, lastRun).getTime() <= now.getTime();
}

/**
 * Builds catalogue-backed choices that fit Discord slash-command or picker limits.
 * Choice labels include both the scraper name and ID for easier selection.
 */
export function buildDiscordScraperChoices(options: {
  category?: string;
  maxChoices?: number;
  search?: string;
} = {}): DiscordScraperChoice[] {
  const maxChoices =
    Number.isFinite(options.maxChoices ?? 25) && (options.maxChoices ?? 25) > 0
      ? Math.min(25, Math.floor(options.maxChoices ?? 25))
      : 25;

  return getScraperCatalog({
    category: options.category,
    search: options.search,
  })
    .slice(0, maxChoices)
    .map((entry) => ({
      name: `${entry.name} [${entry.id}]`.slice(0, 100),
      value: entry.id,
    }));
}

/**
 * Builds a simple `/scraper` slash-command definition that bot authors can
 * register without pulling in framework-specific builder classes.
 */
export function buildDiscordScraperSlashCommandDefinition(options: {
  commandName?: string;
  description?: string;
  includeLimitOption?: boolean;
  questionDescription?: string;
  questionName?: string;
} = {}): DiscordSlashCommandDefinition {
  const questionName = options.questionName?.trim() || "question";

  return {
    description:
      options.description?.trim() ||
      "Ask the scraper toolkit for weather, research, reports, news, or images.",
    dm_permission: true,
    name: options.commandName?.trim() || "scraper",
    options: [
      {
        description:
          options.questionDescription?.trim() ||
          "Natural-language request, for example weather in London or academic records of Vatican Church.",
        max_length: 200,
        min_length: 2,
        name: questionName,
        required: true,
        type: 3,
      },
      ...(options.includeLimitOption === false
        ? []
        : [
            {
              description: "Optional maximum number of records to show.",
              max_value: 10,
              min_value: 1,
              name: "limit",
              required: false,
              type: 4 as const,
            },
          ]),
    ],
    type: 1,
  };
}

/** Formats one normalised record as one Discord embed. */
export function recordToDiscordEmbed(
  result: ScrapeResult,
  record: ScrapedRecord,
  options: DiscordRenderOptions = {},
): DiscordEmbedShape {
  if (resolveRenderStyle(result, options) === "weather-card") {
    return weatherRecordToDiscordEmbed(result, record);
  }

  return buildDefaultEmbed(result, record, options);
}

function buildSummaryContent(
  result: ScrapeResult,
  recordCount: number,
  blockedCount: number,
  options: DiscordRenderOptions,
): string {
  if (resolveRenderStyle(result, options) === "weather-card") {
    const cadenceHours = weatherCadenceHours(options);
    const label = result.records[0]?.location ?? stringFromUnknown(result.meta?.label) ?? result.source;
    const blockedNote =
      blockedCount > 0
        ? ` Filtered ${blockedCount} unsafe record(s) for the current channel.`
        : "";

    return `**${result.scraperName}** prepared ${recordCount} ${cadenceLabel(cadenceHours)} update(s) for ${label}.${blockedNote}`;
  }

  const blockedNote =
    blockedCount > 0
      ? ` Filtered ${blockedCount} unsafe record(s) for the current channel.`
      : "";

  return `**${result.scraperName}** pulled ${result.records.length} record(s) from ${result.source} at ${result.fetchedAt}.${blockedNote}`;
}

/**
 * Converts a normalised scraper result into one or more Discord message payloads,
 * applying channel safety filtering, weather-card formatting, and embed chunking.
 */
export function resultToDiscordMessages(
  result: ScrapeResult,
  options: DiscordRenderOptions = {},
): DiscordMessagePayload[] {
  const maxEmbedsPerMessage = options.maxEmbedsPerMessage ?? 10;
  const maxRecords = options.maxRecords ?? 5;
  const safety = filterDiscordResultForChannel(result, options.channel);

  if (options.throwOnUnsafeContent && safety.blockedRecords.length > 0) {
    throw new Error(
      safety.blockedRecords
        .map((record) => validateDiscordRecordForChannel(record, options.channel).reason)
        .filter((value): value is string => Boolean(value))
        .join(" "),
    );
  }

  const filteredResult: ScrapeResult = {
    ...result,
    records: safety.allowedRecords,
  };
  const selectedRecords =
    resolveRenderStyle(result, options) === "weather-card"
      ? selectWeatherCadenceRecords(filteredResult, {
          intervalHours: weatherCadenceHours(options),
          maxRecords,
        })
      : filteredResult.records.slice(0, maxRecords);
  const embeds = selectedRecords.map((record) => recordToDiscordEmbed(result, record, options));
  const messages: DiscordMessagePayload[] = [];

  for (let index = 0; index < embeds.length; index += maxEmbedsPerMessage) {
    const chunk = embeds.slice(index, index + maxEmbedsPerMessage);
    messages.push({
      content:
        index === 0
          ? buildSummaryContent(result, selectedRecords.length, safety.blockedRecords.length, options)
          : undefined,
      embeds: chunk,
    });
  }

  if (messages.length === 0) {
    if (safety.blockedRecords.length > 0) {
      return [
        {
          content: `**${result.scraperName}** filtered ${safety.blockedRecords.length} record(s) because ${channelLabel(options.channel)} is not explicitly enabled for NSFW content.`,
          embeds: [],
        },
      ];
    }

    return [
      {
        content: `**${result.scraperName}** returned no records at ${result.fetchedAt}.`,
        embeds: [],
      },
    ];
  }

  return messages;
}

/** Runs one scraper by ID and immediately formats the result for Discord. */
export async function runScraperToDiscordMessages(
  scraperId: string,
  options: DiscordRunOptions = {},
): Promise<DiscordMessagePayload[]> {
  const result = await runScraperById(scraperId, options);
  return resultToDiscordMessages(result, options);
}

/**
 * Resolves a free-text prompt such as "What is the weather in London", runs
 * the chosen scraper, and returns Discord-ready payloads plus routing metadata.
 */
export async function runScraperPromptToDiscordMessages(
  prompt: string,
  options: DiscordPromptRunOptions = {},
): Promise<DiscordPromptMessageResult> {
  const { resolution, result } = await runScraperPrompt(prompt, options);
  const messages = resultToDiscordMessages(result, {
    ...options,
    style: options.style ?? resolution.renderStyle,
  });

  return {
    messages,
    resolution,
    result,
  };
}

/** Publishes Discord-formatted messages to a Discord-compatible webhook. */
export async function publishDiscordWebhookMessages(
  webhookUrl: string,
  result: ScrapeResult,
  options: DiscordRenderOptions = {},
): Promise<PublishResponse[]> {
  const messages = resultToDiscordMessages(result, options);
  const responses: PublishResponse[] = [];

  for (const payload of messages) {
    responses.push(await postJsonWebhook(webhookUrl, payload));
  }

  return responses;
}
