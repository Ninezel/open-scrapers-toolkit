import type { ScrapeResult, ScraperContext, ScraperDefinition } from "./types.js";
import { buildStableId } from "./utils.js";

export interface HealthCheckOptions {
  buildContext: (scraper: ScraperDefinition) => ScraperContext;
}

function missingRequiredParams(scraper: ScraperDefinition): string[] {
  const defaults = scraper.defaults ?? {};

  return (scraper.params ?? [])
    .filter((parameter) => parameter.required && !defaults[parameter.key])
    .map((parameter) => parameter.key);
}

export async function runHealthChecks(
  scrapers: ScraperDefinition[],
  options: HealthCheckOptions,
): Promise<ScrapeResult> {
  const records: ScrapeResult["records"] = [];
  const startedAt = new Date();
  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const scraper of scrapers) {
    const missing = missingRequiredParams(scraper);

    if (missing.length > 0) {
      skipped += 1;
      records.push({
        id: buildStableId("source-health-report", scraper.id, "skipped"),
        source: scraper.sourceName ?? scraper.name,
        title: `${scraper.name} health check skipped`,
        url: scraper.homepage,
        summary: `Skipped because this scraper needs required parameters: ${missing.join(", ")}.`,
        publishedAt: startedAt.toISOString(),
        tags: ["health-check", "skipped", scraper.category],
        metadata: {
          category: scraper.category,
          homepage: scraper.homepage,
          missingParams: missing,
          scraperId: scraper.id,
          status: "skipped",
        },
      });
      continue;
    }

    const context = options.buildContext(scraper);
    const checkStarted = Date.now();

    try {
      const result = await scraper.run(context);
      const durationMs = Date.now() - checkStarted;
      ok += 1;

      records.push({
        id: buildStableId("source-health-report", scraper.id, "ok"),
        source: scraper.sourceName ?? scraper.name,
        title: `${scraper.name} health check passed`,
        url: scraper.homepage,
        summary: `Fetched ${result.records.length} record(s) in ${durationMs}ms.`,
        publishedAt: startedAt.toISOString(),
        tags: ["health-check", "ok", scraper.category],
        metadata: {
          category: scraper.category,
          durationMs,
          homepage: scraper.homepage,
          records: result.records.length,
          scraperId: scraper.id,
          source: scraper.sourceName ?? scraper.name,
          status: "ok",
        },
      });
    } catch (error) {
      const durationMs = Date.now() - checkStarted;
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);

      records.push({
        id: buildStableId("source-health-report", scraper.id, "error"),
        source: scraper.sourceName ?? scraper.name,
        title: `${scraper.name} health check failed`,
        url: scraper.homepage,
        summary: message,
        publishedAt: startedAt.toISOString(),
        tags: ["health-check", "error", scraper.category],
        metadata: {
          category: scraper.category,
          durationMs,
          error: message,
          homepage: scraper.homepage,
          scraperId: scraper.id,
          source: scraper.sourceName ?? scraper.name,
          status: "error",
        },
      });
    }
  }

  return {
    scraperId: "source-health-report",
    scraperName: "Source Health Report",
    category: "reports",
    source: "open-scrapers-toolkit",
    fetchedAt: startedAt.toISOString(),
    records,
    meta: {
      failed,
      ok,
      skipped,
      total: scrapers.length,
    },
  };
}
