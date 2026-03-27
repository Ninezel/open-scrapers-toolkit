import { createCrossrefScraper } from "../core/factories.js";

const scraper = createCrossrefScraper({
  id: "crossref-climate-papers",
  name: "Crossref Climate Papers",
  category: "academic",
  description: "Recently indexed climate-focused papers from the Crossref REST API.",
  homepage: "https://www.crossref.org/documentation/retrieve-metadata/rest-api/",
  sourceName: "Crossref",
  query: "climate change",
  defaultTags: ["academic", "crossref", "climate"],
  defaults: {
    query: "climate change",
  },
  params: [
    {
      key: "query",
      description: "Crossref title query override.",
      example: "carbon capture",
    },
  ],
});

export default scraper;
