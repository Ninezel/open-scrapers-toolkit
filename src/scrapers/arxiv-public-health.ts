import { createArxivScraper } from "../core/factories.js";

const scraper = createArxivScraper({
  id: "arxiv-public-health",
  name: "arXiv Public Health",
  category: "academic",
  description: "Public-health-adjacent research pulled from the arXiv API feed.",
  homepage: "https://arxiv.org/",
  sourceName: "arXiv",
  query: "\"public health\"",
  defaultTags: ["academic", "arxiv", "public-health"],
  defaults: {
    query: "\"public health\"",
  },
  params: [
    {
      key: "query",
      description: "arXiv search query sent through the feed API.",
      example: "\"epidemiology\"",
    },
  ],
});

export default scraper;
