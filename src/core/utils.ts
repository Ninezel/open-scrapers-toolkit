import { createHash } from "node:crypto";

export function buildStableId(...parts: Array<string | undefined>): string {
  const value = parts.filter(Boolean).join("::");
  return createHash("sha1").update(value).digest("hex").slice(0, 16);
}

export function cleanText(value: string | undefined | null): string | undefined {
  if (!value) {
    return undefined;
  }

  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateText(
  value: string | undefined | null,
  maxLength: number,
): string | undefined {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return undefined;
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function pickFirst(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === "string");
  }

  return undefined;
}

export function take<T>(items: T[], limit: number): T[] {
  return items.slice(0, Math.max(1, limit));
}

export function parseKeyValuePairs(entries: string[]): Record<string, string> {
  return entries.reduce<Record<string, string>>((accumulator, entry) => {
    const index = entry.indexOf("=");

    if (index === -1) {
      throw new Error(`Invalid --param value "${entry}". Expected key=value.`);
    }

    const key = entry.slice(0, index).trim();
    const value = entry.slice(index + 1).trim();

    if (!key) {
      throw new Error(`Invalid --param value "${entry}". Key cannot be empty.`);
    }

    accumulator[key] = value;
    return accumulator;
  }, {});
}

export function parseBoolean(
  value: string | undefined | null,
  fallback = false,
): boolean {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "y", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "n", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

export function parseOptionalPositiveInteger(
  value: string | undefined | null,
  fallback: number,
): number {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toIsoDate(value: string | undefined | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function fromDateParts(
  value: number[] | undefined | null,
): string | undefined {
  if (!value || value.length === 0) {
    return undefined;
  }

  const [year, month = 1, day = 1] = value;
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function splitCommaList(value: string | undefined | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function uniqueStrings(
  values: Array<string | undefined | null>,
): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

export function parseLineList(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split(/\r?\n/u)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#")),
    ),
  );
}
