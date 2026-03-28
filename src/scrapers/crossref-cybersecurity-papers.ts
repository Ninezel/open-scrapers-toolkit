import { createCrossrefScraper } from "../core/factories.js";

const scraper = createCrossrefScraper({
  id: "crossref-cybersecurity-papers",
  name: "Crossref Cybersecurity Papers",
  category: "academic",
  description: "Cybersecurity research discovery via the Crossref works API.",
  homepage: "https://www.crossref.org/documentation/retrieve-metadata/rest-api/",
  sourceName: "Crossref",
  query: "cybersecurity",
  defaultTags: ["academic", "crossref", "cybersecurity"],
  defaults: {
    query: "cybersecurity",
  },
  params: [
    {
      key: "query",
      description: "Crossref title query.",
      example: "ransomware",
    },
  ],
});

export default scraper;
