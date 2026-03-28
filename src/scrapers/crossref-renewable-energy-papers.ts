import { createCrossrefScraper } from "../core/factories.js";

const scraper = createCrossrefScraper({
  id: "crossref-renewable-energy-papers",
  name: "Crossref Renewable Energy Papers",
  category: "academic",
  description: "Renewable-energy research discovery via the Crossref works API.",
  homepage: "https://www.crossref.org/documentation/retrieve-metadata/rest-api/",
  sourceName: "Crossref",
  query: "\"renewable energy\"",
  defaultTags: ["academic", "crossref", "renewable-energy"],
  defaults: {
    query: "\"renewable energy\"",
  },
  params: [
    {
      key: "query",
      description: "Crossref title query.",
      example: "\"solar storage\"",
    },
  ],
});

export default scraper;
