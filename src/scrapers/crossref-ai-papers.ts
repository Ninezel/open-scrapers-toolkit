import { createCrossrefScraper } from "../core/factories.js";

const scraper = createCrossrefScraper({
  id: "crossref-ai-papers",
  name: "Crossref AI Papers",
  category: "academic",
  description: "Recently indexed research papers matching an AI-focused Crossref title query.",
  homepage: "https://www.crossref.org/documentation/retrieve-metadata/rest-api/",
  sourceName: "Crossref",
  query: "artificial intelligence",
  defaultTags: ["academic", "crossref", "artificial-intelligence"],
  defaults: {
    query: "artificial intelligence",
  },
  params: [
    {
      key: "query",
      description: "Crossref title query override.",
      example: "large language model",
    },
  ],
});

export default scraper;
