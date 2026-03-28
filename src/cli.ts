import { config as loadEnv } from "dotenv";
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { Command } from "commander";

import {
  buildCatalogEntries,
  filterCatalogEntries,
  formatScraperDetails,
  normalizeCategoryFilter,
} from "./core/catalog.js";
import { resolveCacheTtlMs } from "./core/cache.js";
import { runHealthChecks } from "./core/health.js";
import {
  defaultOutputPath,
  normalizeExportFormat,
  printResultSummary,
  saveResultFiles,
} from "./core/output.js";
import {
  buildHealthAlertResult,
  postJsonWebhook,
  publishResultSnapshot,
} from "./publishers.js";
import { getAllScrapers, getScraperById } from "./core/registry.js";
import type { ScrapeResult, ScraperContext, ScraperDefinition } from "./core/types.js";
import { parseKeyValuePairs } from "./core/utils.js";
import { publishDiscordWebhookMessages } from "./integrations/discord.js";
import { resolveScraperPrompt, runScraperPrompt } from "./prompt-router.js";
import { resolveHttpRetryCount, resolveHttpRetryDelayMs } from "./core/http.js";

loadEnv();

interface SharedRunOptions {
  alertDiscordWebhook?: string;
  alertFile?: string;
  alertStatus?: string;
  alertWebhook?: string;
  format?: string;
  limit?: string;
  outDir?: string;
  output?: string;
  param?: string[];
  saveFormat?: string;
}

function collect(value: string, previous: string[]): string[] {
  previous.push(value);
  return previous;
}

function normalizeLimit(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "10", 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid limit "${value}". Use a positive integer.`);
  }

  return parsed;
}

function buildUserAgent(): string {
  const explicit = process.env.SCRAPERS_USER_AGENT?.trim();

  if (explicit) {
    return explicit;
  }

  const contact = process.env.SCRAPERS_CONTACT_EMAIL?.trim();
  return contact ? `OpenScrapers/0.3.0 (${contact})` : "OpenScrapers/0.3.0";
}

function buildContext(
  scraper: ScraperDefinition,
  options: {
    limit?: string;
    outDir?: string;
    param?: string[];
  },
): ScraperContext {
  const params = parseKeyValuePairs(options.param ?? []);

  return {
    cacheTtlMs: resolveCacheTtlMs(),
    limit: normalizeLimit(options.limit),
    outputDir: options.outDir ?? process.env.SCRAPERS_OUTPUT_DIR ?? "output",
    params: {
      ...(scraper.defaults ?? {}),
      ...params,
    },
    retryCount: resolveHttpRetryCount(),
    retryDelayMs: resolveHttpRetryDelayMs(),
    userAgent: buildUserAgent(),
    contactEmail: process.env.SCRAPERS_CONTACT_EMAIL,
    now: new Date(),
  };
}

function selectScrapers(options: {
  category?: string;
  search?: string;
}): ScraperDefinition[] {
  const selectedIds = new Set(
    filterCatalogEntries(buildCatalogEntries(getAllScrapers()), options).map(
      (entry) => entry.id,
    ),
  );

  return getAllScrapers().filter((scraper) => selectedIds.has(scraper.id));
}

function printHealthSummary(result: ScrapeResult): void {
  console.table(
    result.records.map((record) => ({
      scraperId: String(record.metadata?.scraperId ?? ""),
      category: String(record.metadata?.category ?? ""),
      status: String(record.metadata?.status ?? ""),
      records: String(record.metadata?.records ?? ""),
      durationMs: String(record.metadata?.durationMs ?? ""),
      message: record.summary ?? "",
    })),
  );

  if (result.meta) {
    console.log(
      `Health check completed: ${result.meta.ok ?? 0} ok, ${result.meta.failed ?? 0} failed, ${result.meta.skipped ?? 0} skipped.`,
    );
  }
}

async function saveIfRequested(
  result: ScrapeResult,
  options: SharedRunOptions,
  fallbackOutputPath: string,
): Promise<void> {
  if (!options.output && options.saveFormat) {
    throw new Error(
      "Provide --output when using --save-format for single-result commands.",
    );
  }

  if (!options.output) {
    return;
  }

  const exportFormat = normalizeExportFormat(options.saveFormat);
  const savedPaths = await saveResultFiles(
    result,
    options.output ?? fallbackOutputPath,
    exportFormat,
  );

  for (const savedPath of savedPaths) {
    console.log(`Saved ${result.scraperId} output to ${savedPath}`);
  }
}

async function publishHealthAlerts(
  result: ScrapeResult,
  options: SharedRunOptions,
): Promise<void> {
  const alertResult = buildHealthAlertResult(result, options.alertStatus);

  if (alertResult.records.length === 0) {
    console.log("No matching health alerts to publish.");
    return;
  }

  if (options.alertFile) {
    const savedPaths = await publishResultSnapshot(
      alertResult,
      options.alertFile,
      normalizeExportFormat("json"),
    );
    for (const savedPath of savedPaths) {
      console.log(`Saved health alerts to ${savedPath}`);
    }
  }

  if (options.alertWebhook) {
    const response = await postJsonWebhook(options.alertWebhook, {
      alertCount: alertResult.records.length,
      fetchedAt: alertResult.fetchedAt,
      scraperId: alertResult.scraperId,
      summary: alertResult.records.map((record) => ({
        scraperId: record.metadata?.scraperId,
        status: record.metadata?.status,
        title: record.title,
        summary: record.summary,
      })),
    });
    console.log(`Published health alerts to webhook (${response.status}).`);
  }

  if (options.alertDiscordWebhook) {
    const responses = await publishDiscordWebhookMessages(
      options.alertDiscordWebhook,
      alertResult,
      {
        maxEmbedsPerMessage: 5,
        maxRecords: 5,
        titlePrefix: "[Health Alert]",
      },
    );
    console.log(`Published ${responses.length} Discord webhook message(s).`);
  }
}

async function runSingleScraper(
  scraper: ScraperDefinition,
  options: SharedRunOptions,
): Promise<void> {
  const context = buildContext(scraper, options);
  const result = await scraper.run(context);
  const format = options.format ?? "pretty";

  if (format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printResultSummary(result);
  }

  await saveIfRequested(result, options, defaultOutputPath(context.outputDir, result));
}

async function runPromptQuestion(
  question: string,
  options: SharedRunOptions & {
    resolveOnly?: boolean;
  },
): Promise<void> {
  const params = parseKeyValuePairs(options.param ?? []);
  const promptOptions = {
    cacheTtlMs: resolveCacheTtlMs(),
    contactEmail: process.env.SCRAPERS_CONTACT_EMAIL,
    limit: normalizeLimit(options.limit),
    outputDir: options.outDir ?? process.env.SCRAPERS_OUTPUT_DIR ?? "output",
    params,
    retryCount: resolveHttpRetryCount(),
    retryDelayMs: resolveHttpRetryDelayMs(),
    userAgent: buildUserAgent(),
  };
  const resolvedOnly = options.resolveOnly === true;

  if (resolvedOnly) {
    const resolution = await resolveScraperPrompt(question, promptOptions);

    console.log(JSON.stringify(resolution, null, 2));
    return;
  }

  const { resolution, result } = await runScraperPrompt(question, promptOptions);
  const format = options.format ?? "pretty";

  if (format === "json") {
    console.log(
      JSON.stringify(
        {
          resolution,
          result,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(`Prompt: ${question}`);
    console.log(
      `Resolved to ${resolution.scraperId} [${resolution.category}] with ${resolution.confidence} confidence.`,
    );
    console.log(resolution.reason);

    if (Object.keys(resolution.params).length > 0) {
      console.log(`Params: ${JSON.stringify(resolution.params)}`);
    }

    console.log("");
    printResultSummary(result);
  }

  const outputDir = options.outDir ?? process.env.SCRAPERS_OUTPUT_DIR ?? "output";
  await saveIfRequested(result, options, defaultOutputPath(outputDir, result));
}

async function runAllScrapers(options: {
  category?: string;
  limit?: string;
  outDir?: string;
  param?: string[];
  saveFormat?: string;
  search?: string;
}): Promise<void> {
  if (options.category) {
    normalizeCategoryFilter(options.category);
  }

  const selected = selectScrapers({
    category: options.category,
    search: options.search,
  });

  if (selected.length === 0) {
    throw new Error("No scrapers matched the supplied filters.");
  }

  const outputDir = options.outDir ?? process.env.SCRAPERS_OUTPUT_DIR ?? "output";
  await mkdir(outputDir, { recursive: true });

  const exportFormat = normalizeExportFormat(options.saveFormat);
  const summary: Array<Record<string, string | number>> = [];

  for (const scraper of selected) {
    try {
      const context = buildContext(scraper, options);
      const result = await scraper.run(context);
      const target = defaultOutputPath(outputDir, result);
      const savedPaths = await saveResultFiles(result, target, exportFormat);

      summary.push({
        scraperId: scraper.id,
        category: scraper.category,
        records: result.records.length,
        saved: savedPaths.length,
        status: "ok",
      });

      console.log(`Finished ${scraper.id} -> ${savedPaths.join(", ")}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      summary.push({
        scraperId: scraper.id,
        category: scraper.category,
        records: 0,
        saved: 0,
        status: `error: ${message}`,
      });
      console.error(`Failed ${scraper.id}: ${message}`);
    }
  }

  const summaryResult: ScrapeResult = {
    scraperId: "run-summary",
    scraperName: "Run Summary",
    category: "reports",
    source: "open-scrapers-toolkit",
    fetchedAt: new Date().toISOString(),
    records: [],
    meta: {
      results: summary,
    },
  };
  await saveResultFiles(summaryResult, join(outputDir, "run-summary.json"), "json");

  console.table(summary);
}

function getCatalogRows(options: {
  category?: string;
  search?: string;
}) {
  const entries = buildCatalogEntries(getAllScrapers());
  return filterCatalogEntries(entries, {
    category: options.category,
    search: options.search,
  });
}

async function runLinksFile(
  filePath: string,
  options: SharedRunOptions & {
    maxChars?: string;
    model?: string;
    sourceLabel?: string;
    useAi?: string;
  },
): Promise<void> {
  const scraper = getScraperById("website-links-ai-digest");

  if (!scraper) {
    throw new Error("The website-links-ai-digest scraper is not registered.");
  }

  const params = [...(options.param ?? []), `file=${filePath}`];

  if (options.useAi) {
    params.push(`useAi=${options.useAi}`);
  }

  if (options.model) {
    params.push(`model=${options.model}`);
  }

  if (options.maxChars) {
    params.push(`maxChars=${options.maxChars}`);
  }

  if (options.sourceLabel) {
    params.push(`sourceLabel=${options.sourceLabel}`);
  }

  await runSingleScraper(scraper, {
    ...options,
    param: params,
  });
}

async function exportSavedResult(options: {
  format?: string;
  input: string;
  output?: string;
}): Promise<void> {
  const payload = JSON.parse(await readFile(options.input, "utf8")) as ScrapeResult;
  const output =
    options.output ??
    join(
      process.env.SCRAPERS_OUTPUT_DIR ?? "output",
      `${payload.scraperId || "exported-result"}.json`,
    );
  const savedPaths = await saveResultFiles(
    payload,
    output,
    normalizeExportFormat(options.format),
  );

  for (const savedPath of savedPaths) {
    console.log(`Exported ${payload.scraperId} to ${savedPath}`);
  }
}

const program = new Command();

program
  .name("open-scrapers")
  .description(
    "Open-source scrapers for news, weather, reports, research, and user-supplied website link collections.",
  );

program
  .command("list")
  .description("List all available starter scrapers.")
  .option("--format <table|json>", "List output format.", "table")
  .option("-c, --category <category>", "Optional category filter.")
  .option("-s, --search <text>", "Optional free-text search filter.")
  .action((options) => {
    const rows = getCatalogRows(options);

    if (options.format === "json") {
      console.log(JSON.stringify(rows, null, 2));
      return;
    }

    console.table(
      rows.map(({ id, category, name, description, sourceName }) => ({
        id,
        category,
        name,
        source: sourceName ?? "",
        description,
      })),
    );
  });

program
  .command("describe")
  .argument("<scraper-id>", "Scraper identifier to inspect.")
  .description("Print the full metadata for one scraper.")
  .option("--format <pretty|json>", "Describe output format.", "pretty")
  .action((scraperId, options) => {
    const scraper = getScraperById(scraperId);

    if (!scraper) {
      throw new Error(
        `Unknown scraper "${scraperId}". Run "npm run list" to inspect the catalogue.`,
      );
    }

    const entry = buildCatalogEntries([scraper])[0];

    if (options.format === "json") {
      console.log(JSON.stringify(entry, null, 2));
      return;
    }

    console.log(formatScraperDetails(entry));
  });

program
  .command("run")
  .argument("<scraper-id>", "Scraper identifier to execute.")
  .description("Run a single scraper and print a short preview.")
  .option("-l, --limit <number>", "Maximum number of records to collect.", "10")
  .option("--out-dir <directory>", "Output directory for saved results.")
  .option("--output <file>", "Optional file path used when saving the result.")
  .option("--format <pretty|json>", "Console output format.", "pretty")
  .option(
    "--save-format <json|csv|ndjson|all>",
    "Optional saved export format when --output is supplied.",
  )
  .option("-p, --param <key=value>", "Additional scraper parameter.", collect, [])
  .action(async (scraperId, options) => {
    const scraper = getScraperById(scraperId);

    if (!scraper) {
      throw new Error(
        `Unknown scraper "${scraperId}". Run "npm run list" to inspect the catalogue.`,
      );
    }

    await runSingleScraper(scraper, options);
  });

program
  .command("ask")
  .argument("<question>", "Natural-language question or instruction.")
  .description(
    "Resolve a free-text prompt into the most suitable scraper and run it.",
  )
  .option("-l, --limit <number>", "Maximum number of records to collect.", "5")
  .option("--out-dir <directory>", "Output directory for saved results.")
  .option("--output <file>", "Optional file path used when saving the result.")
  .option("--format <pretty|json>", "Console output format.", "pretty")
  .option("--resolve-only", "Only print the routing decision without running the scraper.")
  .option(
    "--save-format <json|csv|ndjson|all>",
    "Optional saved export format when --output is supplied.",
  )
  .option("-p, --param <key=value>", "Additional scraper parameter.", collect, [])
  .action(async (question, options) => {
    await runPromptQuestion(question, options);
  });

program
  .command("run-all")
  .description("Run every starter scraper and save each result to disk.")
  .option(
    "-c, --category <category>",
    "Optional category filter: news, weather, reports, academic.",
  )
  .option("-s, --search <text>", "Optional free-text filter.")
  .option("-l, --limit <number>", "Maximum number of records per scraper.", "10")
  .option("--out-dir <directory>", "Output directory.", "output")
  .option(
    "--save-format <json|csv|ndjson|all>",
    "Save JSON, CSV, NDJSON, or all three.",
    "json",
  )
  .option("-p, --param <key=value>", "Additional scraper parameter for every run.", collect, [])
  .action(async (options) => {
    await runAllScrapers(options);
  });

program
  .command("scrape-links")
  .argument("<file>", "Text file with one webpage URL per line.")
  .description(
    "Scrape a text file of webpage links through the website-links-ai-digest workflow.",
  )
  .option("-l, --limit <number>", "Maximum number of URLs to process.", "10")
  .option("--out-dir <directory>", "Output directory for default paths.")
  .option("--output <file>", "Optional file path used when saving the result.")
  .option("--format <pretty|json>", "Console output format.", "pretty")
  .option(
    "--save-format <json|csv|ndjson|all>",
    "Optional saved export format when --output is supplied.",
  )
  .option("--use-ai <auto|true|false>", "Control optional AI enrichment.", "auto")
  .option("--model <name>", "Optional OpenAI model override.")
  .option("--max-chars <number>", "Maximum page text characters sent for enrichment.")
  .option("--source-label <label>", "Custom source label for the saved result.")
  .option("-p, --param <key=value>", "Additional scraper parameter.", collect, [])
  .action(async (filePath, options) => {
    await runLinksFile(filePath, options);
  });

program
  .command("health")
  .description("Run lightweight health checks against the selected scrapers.")
  .option(
    "-c, --category <category>",
    "Optional category filter: news, weather, reports, academic.",
  )
  .option("-s, --search <text>", "Optional free-text filter.")
  .option("-l, --limit <number>", "Maximum number of records fetched during each check.", "1")
  .option("--out-dir <directory>", "Output directory used for context defaults.", "output")
  .option("--output <file>", "Optional file path used when saving the report.")
  .option("--format <pretty|json|table>", "Console output format.", "table")
  .option(
    "--alert-status <statuses>",
    "Comma-separated health statuses to publish, for example error or error,skipped.",
    "error",
  )
  .option("--alert-file <file>", "Optional JSON snapshot path for filtered health alerts.")
  .option("--alert-webhook <url>", "Optional generic webhook target for filtered health alerts.")
  .option(
    "--alert-discord-webhook <url>",
    "Optional Discord webhook target for filtered health alerts.",
  )
  .option(
    "--save-format <json|csv|ndjson|all>",
    "Optional saved export format when --output is supplied.",
  )
  .option("-p, --param <key=value>", "Additional scraper parameter for every check.", collect, [])
  .action(async (options) => {
    if (options.category) {
      normalizeCategoryFilter(options.category);
    }

    const selected = selectScrapers({
      category: options.category,
      search: options.search,
    });

    if (selected.length === 0) {
      throw new Error("No scrapers matched the supplied filters.");
    }

    const result = await runHealthChecks(selected, {
      buildContext: (scraper) => buildContext(scraper, options),
    });

    if (options.format === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else if (options.format === "pretty") {
      printResultSummary(result);
    } else {
      printHealthSummary(result);
    }

    await saveIfRequested(
      result,
      options,
      join(options.outDir ?? "output", "source-health-report.json"),
    );

    await publishHealthAlerts(result, options);
  });

program
  .command("export")
  .argument("<input>", "Path to an existing saved JSON result.")
  .description("Export an existing JSON result to CSV, NDJSON, or both.")
  .option("--format <csv|ndjson|all|json>", "Output format.", "csv")
  .option("--output <file>", "Optional output file path.")
  .action(async (input, options) => {
    await exportSavedResult({
      format: options.format,
      input,
      output: options.output,
    });
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
