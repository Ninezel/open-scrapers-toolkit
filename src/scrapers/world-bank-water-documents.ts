import { createWorldBankDocumentsScraper } from "../core/factories.js";

const scraper = createWorldBankDocumentsScraper({
  id: "world-bank-water-documents",
  name: "World Bank Water Documents",
  category: "reports",
  description: "Water-related reports and publications from the World Bank document search API.",
  homepage: "https://documents.worldbank.org/",
  sourceName: "World Bank Documents & Reports",
  query: "water",
  defaultTags: ["world-bank", "water", "reports"],
  defaults: {
    query: "water",
  },
  params: [
    {
      key: "query",
      description: "Search term sent to the World Bank document API.",
      example: "sanitation",
    },
  ],
});

export default scraper;
