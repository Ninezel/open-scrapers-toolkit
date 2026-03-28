import { createArxivScraper } from "../core/factories.js";

const scraper = createArxivScraper({
  id: "arxiv-academic-search",
  name: "arXiv Academic Search",
  category: "academic",
  description:
    "Prompt-friendly arXiv search scraper for technical and scientific queries.",
  homepage: "https://arxiv.org/",
  sourceName: "arXiv",
  query: "machine learning",
  defaultTags: ["arxiv", "search"],
  defaults: {
    query: "machine learning",
  },
  params: [
    {
      key: "query",
      description: "arXiv query override used for natural-language academic requests.",
      example: "quantum computing",
      required: true,
    },
  ],
});

export default scraper;
