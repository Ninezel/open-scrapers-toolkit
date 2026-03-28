import { createArxivScraper } from "../core/factories.js";

const scraper = createArxivScraper({
  id: "arxiv-climate-science",
  name: "arXiv Climate Science",
  category: "academic",
  description: "Climate science papers discovered through the arXiv API feed.",
  homepage: "https://arxiv.org/",
  sourceName: "arXiv",
  query: "\"climate change\"",
  defaultTags: ["academic", "arxiv", "climate"],
  defaults: {
    query: "\"climate change\"",
  },
  params: [
    {
      key: "query",
      description: "arXiv search query sent through the feed API.",
      example: "\"earth system\"",
    },
  ],
});

export default scraper;
