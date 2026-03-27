import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import type { ScrapeResult } from "./types.js";
import { slugify } from "./utils.js";

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
