import { createEuropePmcScraper } from "../core/factories.js";

const scraper = createEuropePmcScraper({
  id: "europepmc-academic-search",
  name: "Europe PMC Academic Search",
  category: "academic",
  description:
    "Prompt-friendly Europe PMC search scraper for biomedical and health research queries.",
  homepage: "https://europepmc.org/",
  sourceName: "Europe PMC",
  query: "public health",
  defaultTags: ["europepmc", "search"],
  defaults: {
    query: "public health",
  },
  params: [
    {
      key: "query",
      description:
        "Europe PMC search query override used for natural-language academic requests.",
      example: "maternal health",
      required: true,
    },
  ],
});

export default scraper;
