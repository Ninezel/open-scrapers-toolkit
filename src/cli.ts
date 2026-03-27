import { config as loadEnv } from "dotenv";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import { Command } from "commander";

import {
  defaultOutputPath,
  printResultSummary,
  saveResult,
} from "./core/output.js";
import { getAllScrapers, getScraperById } from "./core/registry.js";
import type { ScraperContext, ScraperDefinition } from "./core/types.js";
import { parseKeyValuePairs } from "./core/utils.js";

loadEnv();

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
  return contact ? `OpenScrapers/0.1 (${contact})` : "OpenScrapers/0.1";
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
    limit: normalizeLimit(options.limit),
    outputDir: options.outDir ?? process.env.SCRAPERS_OUTPUT_DIR ?? "output",
    params: {
      ...(scraper.defaults ?? {}),
      ...params,
    },
    userAgent: buildUserAgent(),
    contactEmail: process.env.SCRAPERS_CONTACT_EMAIL,
    now: new Date(),
  };
}

async function runSingleScraper(
  scraper: ScraperDefinition,
  options: {
    limit?: string;
    outDir?: string;
    output?: string;
    format?: string;
    param?: string[];
  },
): Promise<void> {
  const context = buildContext(scraper, options);
  const result = await scraper.run(context);
  const format = options.format ?? "pretty";

  if (format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printResultSummary(result);
  }

  if (options.output) {
    const savedPath = await saveResult(result, options.output);
    console.log(`Saved ${scraper.id} output to ${savedPath}`);
  }
}

async function runAllScrapers(options: {
  category?: string;
  limit?: string;
  outDir?: string;
  param?: string[];
}): Promise<void> {
  const selected = getAllScrapers().filter(
    (scraper) => !options.category || scraper.category === options.category,
  );

  if (selected.length === 0) {
    throw new Error("No scrapers matched the supplied filters.");
  }

  const outputDir = options.outDir ?? process.env.SCRAPERS_OUTPUT_DIR ?? "output";
  await mkdir(outputDir, { recursive: true });

  const summary: Array<Record<string, string | number>> = [];

  for (const scraper of selected) {
    try {
      const context = buildContext(scraper, options);
      const result = await scraper.run(context);
      const target = defaultOutputPath(outputDir, result);
      const savedPath = await saveResult(result, target);

      summary.push({
        scraperId: scraper.id,
        category: scraper.category,
        records: result.records.length,
        status: "ok",
        file: savedPath,
      });

      console.log(`Finished ${scraper.id} -> ${savedPath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      summary.push({
        scraperId: scraper.id,
        category: scraper.category,
        records: 0,
        status: `error: ${message}`,
        file: "",
      });
      console.error(`Failed ${scraper.id}: ${message}`);
    }
  }

  const summaryPath = join(outputDir, "run-summary.json");
  await saveResult(
    {
      scraperId: "run-summary",
      scraperName: "Run Summary",
      category: "reports",
      source: "open-scrapers-toolkit",
      fetchedAt: new Date().toISOString(),
      records: [],
      meta: {
        results: summary,
      },
    },
    summaryPath,
  );

  console.table(summary);
}

const program = new Command();

program
  .name("open-scrapers")
  .description(
    "Starter toolkit of open-source scrapers for news, weather, reports, and academic research.",
  );

program
  .command("list")
  .description("List all available starter scrapers.")
  .option("--format <table|json>", "List output format.", "table")
  .action((options) => {
    const rows = getAllScrapers().map((scraper) => ({
      id: scraper.id,
      category: scraper.category,
      name: scraper.name,
      description: scraper.description,
      homepage: scraper.homepage,
      params: scraper.params ?? [],
    }));

    if (options.format === "json") {
      console.log(JSON.stringify(rows, null, 2));
      return;
    }

    console.table(
      rows.map(({ id, category, name, description }) => ({
        id,
        category,
        name,
        description,
      })),
    );
  });

program
  .command("run")
  .argument("<scraper-id>", "Scraper identifier to execute.")
  .description("Run a single scraper and print a short preview.")
  .option("-l, --limit <number>", "Maximum number of records to collect.", "10")
  .option("--out-dir <directory>", "Output directory for saved results.")
  .option("--output <file>", "Optional JSON file path to save the result.")
  .option("--format <pretty|json>", "Console output format.", "pretty")
  .option("-p, --param <key=value>", "Additional scraper parameter.", collect, [])
  .action(async (scraperId, options) => {
    const scraper = getScraperById(scraperId);

    if (!scraper) {
      throw new Error(
        `Unknown scraper "${scraperId}". Run "npm run list" to inspect the catalog.`,
      );
    }

    await runSingleScraper(scraper, options);
  });

program
  .command("run-all")
  .description("Run every starter scraper and save each result to a JSON file.")
  .option(
    "-c, --category <category>",
    "Optional category filter: news, weather, reports, academic.",
  )
  .option("-l, --limit <number>", "Maximum number of records per scraper.", "10")
  .option("--out-dir <directory>", "Output directory.", "output")
  .option("-p, --param <key=value>", "Additional scraper parameter for every run.", collect, [])
  .action(async (options) => {
    await runAllScrapers(options);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
