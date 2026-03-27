import { createEuropePmcScraper } from "../core/factories.js";

const scraper = createEuropePmcScraper({
  id: "europepmc-public-health",
  name: "Europe PMC Public Health",
  category: "academic",
  description: "Public health research discovery via the Europe PMC search API.",
  homepage: "https://europepmc.org/RestfulWebService",
  sourceName: "Europe PMC",
  query: "\"public health\"",
  defaultTags: ["academic", "europe-pmc", "public-health"],
  defaults: {
    query: "\"public health\"",
  },
  params: [
    {
      key: "query",
      description: "Europe PMC query string.",
      example: "\"mental health\"",
    },
  ],
});

export default scraper;
