import { mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";

import type { ScrapeResult } from "./types.js";
import { slugify } from "./utils.js";

export type ResultExportFormat = "all" | "csv" | "json" | "ndjson";

export async function saveResult(
  result: ScrapeResult,
  targetPath: string,
): Promise<string> {
  const resolved = resolve(targetPath);
  await mkdir(dirname(resolved), { recursive: true });
  await writeFile(resolved, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  return resolved;
}

export function defaultOutputPath(
  outputDir: string,
  result: ScrapeResult,
): string {
  return join(outputDir, `${slugify(result.scraperId)}.json`);
}

export function normalizeExportFormat(
  value: string | undefined,
): ResultExportFormat {
  const normalized = value?.trim().toLowerCase() ?? "json";

  if (
    normalized === "json" ||
    normalized === "csv" ||
    normalized === "ndjson" ||
    normalized === "all"
  ) {
    return normalized;
  }

  throw new Error(
    `Invalid export format "${value}". Use one of: json, csv, ndjson, all.`,
  );
}

function resolveExportPath(targetPath: string, format: Exclude<ResultExportFormat, "all">): string {
  const resolved = resolve(targetPath);
  const extension = extname(resolved).toLowerCase();
  const base = extension ? resolved.slice(0, -extension.length) : resolved;

  if (format === "json") {
    return extension === ".json" ? resolved : `${base}.json`;
  }

  if (format === "csv") {
    return extension === ".csv" ? resolved : `${base}.csv`;
  }

  return extension === ".ndjson" ? resolved : `${base}.ndjson`;
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text =
    typeof value === "string" ? value : JSON.stringify(value);
  const normalized = text.replace(/"/g, "\"\"");

  return `"${normalized}"`;
}

function resultToCsv(result: ScrapeResult): string {
  const headers = [
    "scraperId",
    "scraperName",
    "category",
    "source",
    "fetchedAt",
    "recordId",
    "title",
    "url",
    "summary",
    "publishedAt",
    "authors",
    "tags",
    "location",
    "metadata",
  ];

  const rows = result.records.map((record) =>
    [
      result.scraperId,
      result.scraperName,
      result.category,
      result.source,
      result.fetchedAt,
      record.id,
      record.title,
      record.url ?? "",
      record.summary ?? "",
      record.publishedAt ?? "",
      (record.authors ?? []).join(" | "),
      (record.tags ?? []).join(" | "),
      record.location ?? "",
      record.metadata ?? {},
    ]
      .map(escapeCsvCell)
      .join(","),
  );

  return `${headers.join(",")}\n${rows.join("\n")}${rows.length > 0 ? "\n" : ""}`;
}

function resultToNdjson(result: ScrapeResult): string {
  return result.records
    .map((record) =>
      JSON.stringify({
        authors: record.authors ?? [],
        category: result.category,
        fetchedAt: result.fetchedAt,
        location: record.location ?? "",
        metadata: record.metadata ?? {},
        publishedAt: record.publishedAt ?? "",
        recordId: record.id,
        source: result.source,
        scraperId: result.scraperId,
        scraperName: result.scraperName,
        summary: record.summary ?? "",
        tags: record.tags ?? [],
        title: record.title,
        url: record.url ?? "",
      }),
    )
    .join("\n")
    .concat(result.records.length > 0 ? "\n" : "");
}

export async function saveResultFiles(
  result: ScrapeResult,
  targetPath: string,
  format: ResultExportFormat,
): Promise<string[]> {
  const formats: Exclude<ResultExportFormat, "all">[] =
    format === "all" ? ["json", "csv", "ndjson"] : [format];
  const savedPaths: string[] = [];

  for (const currentFormat of formats) {
    const resolved = resolveExportPath(targetPath, currentFormat);
    await mkdir(dirname(resolved), { recursive: true });

    if (currentFormat === "json") {
      await writeFile(resolved, `${JSON.stringify(result, null, 2)}\n`, "utf8");
    } else if (currentFormat === "csv") {
      await writeFile(resolved, resultToCsv(result), "utf8");
    } else {
      await writeFile(resolved, resultToNdjson(result), "utf8");
    }

    savedPaths.push(resolved);
  }

  return savedPaths;
}

export function printResultSummary(result: ScrapeResult): void {
  console.log(
    `${result.scraperName} [${result.scraperId}] fetched ${result.records.length} records from ${result.source}.`,
  );

  result.records.slice(0, 5).forEach((record, index) => {
    console.log(
      `${index + 1}. ${record.title}${record.publishedAt ? ` (${record.publishedAt})` : ""}`,
    );
  });

  if (result.records.length > 5) {
    console.log(`...and ${result.records.length - 5} more.`);
  }
}
