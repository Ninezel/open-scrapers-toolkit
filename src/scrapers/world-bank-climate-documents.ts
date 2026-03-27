import { createWorldBankDocumentsScraper } from "../core/factories.js";

const scraper = createWorldBankDocumentsScraper({
  id: "world-bank-climate-documents",
  name: "World Bank Climate Documents",
  category: "reports",
  description: "Climate-related reports and publications from the World Bank document search API.",
  homepage: "https://documents.worldbank.org/",
  sourceName: "World Bank Documents & Reports",
  query: "climate",
  defaultTags: ["world-bank", "climate", "reports"],
  defaults: {
    query: "climate",
  },
  params: [
    {
      key: "query",
      description: "Search term sent to the World Bank document API.",
      example: "resilience",
    },
  ],
});

export default scraper;
