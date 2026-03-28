import { createEuropePmcScraper } from "../core/factories.js";

const scraper = createEuropePmcScraper({
  id: "europepmc-infectious-disease",
  name: "Europe PMC Infectious Disease",
  category: "academic",
  description: "Infectious disease research discovery via the Europe PMC search API.",
  homepage: "https://europepmc.org/RestfulWebService",
  sourceName: "Europe PMC",
  query: "\"infectious disease\"",
  defaultTags: ["academic", "europe-pmc", "infectious-disease"],
  defaults: {
    query: "\"infectious disease\"",
  },
  params: [
    {
      key: "query",
      description: "Europe PMC query string.",
      example: "\"outbreak response\"",
    },
  ],
});

export default scraper;
