import { saveResultFiles, type ResultExportFormat } from "./core/output.js";
import type { ScrapeResult } from "./core/types.js";
import { splitCommaList } from "./core/utils.js";

export interface PublishResponse {
  status: number;
  target: string;
}

export async function postJsonWebhook(
  url: string,
  payload: unknown,
  headers: HeadersInit = {},
): Promise<PublishResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": process.env.SCRAPERS_USER_AGENT ?? "OpenScrapersPublisher/0.3.0",
      ...headers,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Webhook publish failed with ${response.status} ${response.statusText}: ${body.slice(0, 200)}`,
    );
  }

  return {
    status: response.status,
    target: url,
  };
}

export async function publishResultSnapshot(
  result: ScrapeResult,
  targetPath: string,
  format: ResultExportFormat = "json",
): Promise<string[]> {
  return saveResultFiles(result, targetPath, format);
}

export function buildHealthAlertResult(
  healthResult: ScrapeResult,
  statuses = "error",
): ScrapeResult {
  const normalizedStatuses = new Set(
    splitCommaList(statuses).map((value) => value.toLowerCase()),
  );
  const filtered =
    normalizedStatuses.size === 0
      ? healthResult.records
      : healthResult.records.filter((record) =>
          normalizedStatuses.has(String(record.metadata?.status ?? "").toLowerCase()),
        );

  return {
    ...healthResult,
    scraperId: "source-health-alerts",
    scraperName: "Source Health Alerts",
    records: filtered,
    meta: {
      ...(healthResult.meta ?? {}),
      alertStatuses: Array.from(normalizedStatuses),
      alertCount: filtered.length,
    },
  };
}
