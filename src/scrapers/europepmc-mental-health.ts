import { createEuropePmcScraper } from "../core/factories.js";

const scraper = createEuropePmcScraper({
  id: "europepmc-mental-health",
  name: "Europe PMC Mental Health",
  category: "academic",
  description: "Mental-health research discovery via the Europe PMC search API.",
  homepage: "https://europepmc.org/RestfulWebService",
  sourceName: "Europe PMC",
  query: "\"mental health\"",
  defaultTags: ["academic", "europe-pmc", "mental-health"],
  defaults: {
    query: "\"mental health\"",
  },
  params: [
    {
      key: "query",
      description: "Europe PMC query string.",
      example: "\"community psychiatry\"",
    },
  ],
});

export default scraper;
