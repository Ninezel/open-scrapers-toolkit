import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { enrichPageWithOpenAi, hasOpenAiConfiguration } from "../core/ai.js";
import { extractReadablePage } from "../core/html.js";
import { fetchTextResponse } from "../core/http.js";
import type { ScrapedRecord, ScrapeResult, ScraperDefinition } from "../core/types.js";
import {
  buildStableId,
  parseLineList,
  parseOptionalPositiveInteger,
  take,
  truncateText,
  uniqueStrings,
} from "../core/utils.js";

const scraper: ScraperDefinition = {
  id: "website-links-ai-digest",
  name: "Website Links AI Digest",
  category: "reports",
  description:
    "Scrape a text file of webpage URLs, one per line, and optionally enrich each page with OpenAI-generated summaries and tags.",
  homepage: "https://github.com/Ninezel/open-scrapers-toolkit",
  sourceName: "User-Supplied Web Pages",
  defaults: {
    maxChars: "8000",
    sourceLabel: "User-Supplied Web Pages",
    useAi: "auto",
  },
  params: [
    {
      key: "file",
      description: "Path to a UTF-8 text file containing one webpage URL per line.",
      example: "examples/url-lists/demo-links.txt",
      required: true,
    },
    {
      key: "useAi",
      description:
        "Set to auto, true, or false. auto uses OpenAI only when OPENAI_API_KEY and OPENAI_MODEL are configured.",
      example: "auto",
    },
    {
      key: "model",
      description: "Optional OpenAI model override when AI enrichment is enabled.",
      example: "gpt-4.1",
    },
    {
      key: "maxChars",
      description: "Maximum amount of extracted page text to send into the enrichment step.",
      example: "8000",
    },
    {
      key: "sourceLabel",
      description: "Custom source label shown in the saved result file.",
      example: "My saved reading list",
    },
  ],
  async run(context): Promise<ScrapeResult> {
    const filePath = context.params.file?.trim();

    if (!filePath) {
      throw new Error(
        "The website-links-ai-digest scraper requires --param file=path-to-links.txt.",
      );
    }

    const resolvedFilePath = resolve(filePath);
    const useAiMode = context.params.useAi?.trim().toLowerCase() ?? "auto";
    const aiConfigured = hasOpenAiConfiguration();
    const aiEnabled =
      useAiMode === "true" || useAiMode === "yes" || useAiMode === "1"
        ? true
        : useAiMode === "auto"
          ? aiConfigured
          : false;

    if (aiEnabled && !aiConfigured) {
      throw new Error(
        "AI enrichment was requested, but OPENAI_API_KEY and OPENAI_MODEL are not both configured.",
      );
    }

    const rawFile = await readFile(resolvedFilePath, "utf8");
    const urls = take(
      parseLineList(rawFile).filter((line) => /^https?:\/\//iu.test(line)),
      context.limit,
    );

    if (urls.length === 0) {
      throw new Error(
        `No valid http(s) URLs were found in ${resolvedFilePath}. Add one webpage link per line.`,
      );
    }

    const sourceLabel =
      context.params.sourceLabel?.trim() || "User-Supplied Web Pages";
    const maxChars = parseOptionalPositiveInteger(context.params.maxChars, 8_000);
    const errors: Array<Record<string, string>> = [];
    const records: ScrapedRecord[] = [];

    for (const url of urls) {
      try {
        const response = await fetchTextResponse(context, url, {
          headers: {
            accept: "text/html,application/xhtml+xml",
          },
        });
        const hostname = new URL(response.finalUrl).hostname.replace(/^www\./iu, "");
        const extracted = extractReadablePage(response.text);
        const clippedText =
          truncateText(extracted.text, maxChars) ??
          extracted.excerpt ??
          extracted.description ??
          "";

        let aiSummary:
          | {
              contentType?: string;
              readingTimeMinutes?: number;
              summary: string;
              tags: string[];
            }
          | undefined;

        if (aiEnabled && clippedText) {
          try {
            aiSummary = await enrichPageWithOpenAi({
              excerpt: extracted.excerpt,
              model: context.params.model,
              text: clippedText,
              title: extracted.title,
              url: response.finalUrl,
            });
          } catch (error) {
            errors.push({
              error: error instanceof Error ? error.message : String(error),
              stage: "ai-enrichment",
              url: response.finalUrl,
            });
          }
        }

        const title = extracted.title ?? response.finalUrl;
        const summary =
          aiSummary?.summary ??
          extracted.description ??
          extracted.excerpt ??
          truncateText(clippedText, 280) ??
          "No summary available.";

        records.push({
          id: buildStableId(scraper.id, response.finalUrl, title),
          source: extracted.siteName ?? sourceLabel,
          title,
          url: response.finalUrl,
          summary,
          publishedAt: extracted.publishedAt,
          authors: extracted.author ? [extracted.author] : undefined,
          tags: uniqueStrings([
            "user-links",
            hostname.split(".")[0],
            aiSummary?.contentType,
            ...(aiSummary?.tags ?? []),
          ]),
          metadata: {
            aiEnabled,
            aiSummaryUsed: Boolean(aiSummary),
            contentType: response.contentType,
            inferredContentType: aiSummary?.contentType,
            inputUrl: url,
            language: extracted.language,
            readingTimeMinutes:
              aiSummary?.readingTimeMinutes ??
              Math.max(1, Math.round(extracted.wordCount / 220)),
            siteName: extracted.siteName,
            wordCount: extracted.wordCount,
          },
        });
      } catch (error) {
        errors.push({
          error: error instanceof Error ? error.message : String(error),
          stage: "page-fetch",
          url,
        });
      }
    }

    if (records.length === 0) {
      throw new Error(
        `All URL fetches failed for ${resolvedFilePath}. Review the file contents and meta.errors in the output after a retry.`,
      );
    }

    return {
      scraperId: scraper.id,
      scraperName: scraper.name,
      category: scraper.category,
      source: sourceLabel,
      fetchedAt: context.now.toISOString(),
      records,
      meta: {
        aiConfigured,
        aiEnabled,
        errors,
        file: resolvedFilePath,
        maxChars,
        sourceLabel,
        urlsProcessed: records.length,
        urlsRequested: urls.length,
      },
    };
  },
};

export default scraper;
