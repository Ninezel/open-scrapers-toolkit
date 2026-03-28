import { createWorldBankDocumentsScraper } from "../core/factories.js";

const scraper = createWorldBankDocumentsScraper({
  id: "world-bank-health-documents",
  name: "World Bank Health Documents",
  category: "reports",
  description: "Health-related reports and publications from the World Bank document search API.",
  homepage: "https://documents.worldbank.org/",
  sourceName: "World Bank Documents & Reports",
  query: "health",
  defaultTags: ["world-bank", "health", "reports"],
  defaults: {
    query: "health",
  },
  params: [
    {
      key: "query",
      description: "Search term sent to the World Bank document API.",
      example: "primary care",
    },
  ],
});

export default scraper;
