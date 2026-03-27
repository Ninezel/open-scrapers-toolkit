import { createEuropePmcScraper } from "../core/factories.js";

const scraper = createEuropePmcScraper({
  id: "europepmc-oncology",
  name: "Europe PMC Oncology",
  category: "academic",
  description: "Oncology-focused research discovery via the Europe PMC search API.",
  homepage: "https://europepmc.org/RestfulWebService",
  sourceName: "Europe PMC",
  query: "oncology",
  defaultTags: ["academic", "europe-pmc", "oncology"],
  defaults: {
    query: "oncology",
  },
  params: [
    {
      key: "query",
      description: "Europe PMC query string.",
      example: "immunotherapy",
    },
  ],
});

export default scraper;
