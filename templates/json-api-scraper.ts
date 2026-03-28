import { fetchJson } from "../src/core/http.js";
import type { ScrapedRecord, ScraperDefinition } from "../src/core/types.js";
import { buildStableId, take, toIsoDate } from "../src/core/utils.js";

const scraper: ScraperDefinition = {
  id: "example-json-api-scraper",
  name: "Example JSON API Scraper",
  category: "reports",
  description: "Starter template for a JSON API scraper.",
  homepage: "https://api.example.com/docs",
  sourceName: "Example API",
  defaults: {
    topic: "climate",
  },
  params: [
    {
      key: "topic",
      description: "API topic override.",
      example: "health",
    },
  ],
  async run(context) {
    const topic = context.params.topic ?? "climate";
    const endpoint = new URL("https://api.example.com/items");
    endpoint.searchParams.set("topic", topic);
    endpoint.searchParams.set("limit", String(context.limit));

    const payload = await fetchJson<{ items?: Array<Record<string, unknown>> }>(
      context,
      endpoint.toString(),
    );
    const items = take(payload.items ?? [], context.limit);

    const records = items.map<ScrapedRecord>((item) => ({
      id: buildStableId("example-json-api-scraper", String(item.id ?? item.title)),
      source: "Example API",
      title: typeof item.title === "string" ? item.title : "Untitled API item",
      url: typeof item.url === "string" ? item.url : undefined,
      summary: typeof item.summary === "string" ? item.summary : undefined,
      publishedAt: toIsoDate(typeof item.publishedAt === "string" ? item.publishedAt : undefined),
      metadata: {
        endpoint: endpoint.toString(),
        topic,
      },
    }));

    return {
      scraperId: "example-json-api-scraper",
      scraperName: "Example JSON API Scraper",
      category: "reports",
      source: "Example API",
      fetchedAt: context.now.toISOString(),
      records,
      meta: {
        endpoint: endpoint.toString(),
        topic,
      },
    };
  },
};

export default scraper;
