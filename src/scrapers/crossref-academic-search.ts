import { createCrossrefScraper } from "../core/factories.js";

const scraper = createCrossrefScraper({
  id: "crossref-academic-search",
  name: "Crossref Academic Search",
  category: "academic",
  description:
    "Prompt-friendly Crossref search scraper for broad academic and scholarly queries.",
  homepage: "https://api.crossref.org/works",
  sourceName: "Crossref",
  query: "climate change",
  defaultTags: ["crossref", "search"],
  defaults: {
    query: "climate change",
  },
  params: [
    {
      key: "query",
      description: "Crossref title query override used for natural-language academic requests.",
      example: "Vatican Church",
      required: true,
    },
  ],
});

export default scraper;
