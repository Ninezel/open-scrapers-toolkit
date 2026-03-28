import { createEuropePmcScraper } from "../core/factories.js";

const europePmcTopicScrapers = [
  { id: "europepmc-antimicrobial-resistance", name: "Europe PMC Antimicrobial Resistance", description: "Recent Europe PMC records about antimicrobial resistance.", query: "antimicrobial resistance", defaultTags: ["europepmc", "antimicrobial-resistance"] },
  { id: "europepmc-digital-health", name: "Europe PMC Digital Health", description: "Recent Europe PMC records about digital health.", query: "digital health", defaultTags: ["europepmc", "digital-health"] },
  { id: "europepmc-environmental-health", name: "Europe PMC Environmental Health", description: "Recent Europe PMC records about environmental health.", query: "environmental health", defaultTags: ["europepmc", "environmental-health"] },
  { id: "europepmc-epidemiology", name: "Europe PMC Epidemiology", description: "Recent Europe PMC records about epidemiology.", query: "epidemiology", defaultTags: ["europepmc", "epidemiology"] },
  { id: "europepmc-genomics", name: "Europe PMC Genomics", description: "Recent Europe PMC records about genomics.", query: "genomics", defaultTags: ["europepmc", "genomics"] },
  { id: "europepmc-health-systems", name: "Europe PMC Health Systems", description: "Recent Europe PMC records about health systems.", query: "\"health systems\"", defaultTags: ["europepmc", "health-systems"] },
  { id: "europepmc-maternal-health", name: "Europe PMC Maternal Health", description: "Recent Europe PMC records about maternal health.", query: "\"maternal health\"", defaultTags: ["europepmc", "maternal-health"] },
  { id: "europepmc-nutrition", name: "Europe PMC Nutrition", description: "Recent Europe PMC records about nutrition.", query: "nutrition", defaultTags: ["europepmc", "nutrition"] },
  { id: "europepmc-pediatrics", name: "Europe PMC Pediatrics", description: "Recent Europe PMC records about pediatrics.", query: "pediatrics", defaultTags: ["europepmc", "pediatrics"] },
  { id: "europepmc-vaccine-research", name: "Europe PMC Vaccine Research", description: "Recent Europe PMC records about vaccine research.", query: "\"vaccine research\"", defaultTags: ["europepmc", "vaccine-research"] },
].map(({ id, name, description, query, defaultTags }) =>
  createEuropePmcScraper({
    id,
    name,
    category: "academic",
    description,
    homepage: "https://europepmc.org/",
    sourceName: "Europe PMC",
    query,
    defaultTags: defaultTags as string[],
    defaults: {
      query,
    },
    params: [
      {
        key: "query",
        description: "Europe PMC search query override.",
        example: query.replaceAll("\"", ""),
      },
    ],
  }),
);

export default europePmcTopicScrapers;
