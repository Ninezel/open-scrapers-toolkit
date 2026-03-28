import { createArxivScraper } from "../core/factories.js";

const scraper = createArxivScraper({
  id: "arxiv-machine-learning",
  name: "arXiv Machine Learning",
  category: "academic",
  description: "Recent machine learning papers from the arXiv API feed.",
  homepage: "https://arxiv.org/",
  sourceName: "arXiv",
  query: "\"machine learning\"",
  defaultTags: ["academic", "arxiv", "machine-learning"],
  defaults: {
    query: "\"machine learning\"",
  },
  params: [
    {
      key: "query",
      description: "arXiv search query sent through the feed API.",
      example: "\"large language models\"",
    },
  ],
});

export default scraper;
