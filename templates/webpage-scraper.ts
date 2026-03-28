import { fetchTextResponse } from "../src/core/http.js";
import { extractReadableWebpage } from "../src/core/html.js";
import type { ScraperDefinition } from "../src/core/types.js";
import { buildStableId, truncateText } from "../src/core/utils.js";

const scraper: ScraperDefinition = {
  id: "example-webpage-scraper",
  name: "Example Webpage Scraper",
  category: "reports",
  description: "Starter template for a public webpage scraper.",
  homepage: "https://example.com/article",
  sourceName: "Example Webpage",
  defaults: {
    url: "https://example.com/article",
  },
  params: [
    {
      key: "url",
      description: "Public webpage URL to inspect.",
      example: "https://example.com/article",
      required: true,
    },
  ],
  async run(context) {
    const url = context.params.url;
    const response = await fetchTextResponse(context, url);
    const extracted = extractReadableWebpage(response.text, response.finalUrl);

    return {
      scraperId: "example-webpage-scraper",
      scraperName: "Example Webpage Scraper",
      category: "reports",
      source: "Example Webpage",
      fetchedAt: context.now.toISOString(),
      records: [
        {
          id: buildStableId("example-webpage-scraper", extracted.url, extracted.title),
          source: "Example Webpage",
          title: extracted.title,
          url: extracted.url,
          summary: truncateText(extracted.text, 600),
          metadata: {
            contentType: response.contentType,
            finalUrl: response.finalUrl,
          },
        },
      ],
    };
  },
};

export default scraper;
