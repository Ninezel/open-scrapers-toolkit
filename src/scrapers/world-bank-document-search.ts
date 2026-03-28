import { createWorldBankDocumentsScraper } from "../core/factories.js";

const scraper = createWorldBankDocumentsScraper({
  id: "world-bank-document-search",
  name: "World Bank Document Search",
  category: "reports",
  description:
    "Prompt-friendly World Bank document search scraper for report, dataset, and policy queries.",
  homepage: "https://search.worldbank.org/api/v3/wds",
  sourceName: "World Bank",
  query: "climate resilience",
  defaultTags: ["world-bank", "search", "reports"],
  defaults: {
    query: "climate resilience",
  },
  params: [
    {
      key: "query",
      description:
        "World Bank document query override used for natural-language report requests.",
      example: "education quality",
      required: true,
    },
  ],
});

export default scraper;
