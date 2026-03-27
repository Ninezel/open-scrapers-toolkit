import { createWorldBankDocumentsScraper } from "../core/factories.js";

const scraper = createWorldBankDocumentsScraper({
  id: "world-bank-education-documents",
  name: "World Bank Education Documents",
  category: "reports",
  description: "Education-related reports and publications from the World Bank document search API.",
  homepage: "https://documents.worldbank.org/",
  sourceName: "World Bank Documents & Reports",
  query: "education",
  defaultTags: ["world-bank", "education", "reports"],
  defaults: {
    query: "education",
  },
  params: [
    {
      key: "query",
      description: "Search term sent to the World Bank document API.",
      example: "school readiness",
    },
  ],
});

export default scraper;
