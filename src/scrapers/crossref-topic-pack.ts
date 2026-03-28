import { createCrossrefScraper } from "../core/factories.js";

const crossrefTopicScrapers = [
  { id: "crossref-biodiversity-papers", name: "Crossref Biodiversity Papers", description: "Recent Crossref literature about biodiversity.", query: "biodiversity", defaultTags: ["crossref", "biodiversity"] },
  { id: "crossref-disaster-risk-papers", name: "Crossref Disaster Risk Papers", description: "Recent Crossref literature about disaster risk reduction.", query: "disaster risk reduction", defaultTags: ["crossref", "disaster-risk"] },
  { id: "crossref-digital-health-papers", name: "Crossref Digital Health Papers", description: "Recent Crossref literature about digital health.", query: "digital health", defaultTags: ["crossref", "digital-health"] },
  { id: "crossref-education-policy-papers", name: "Crossref Education Policy Papers", description: "Recent Crossref literature about education policy.", query: "education policy", defaultTags: ["crossref", "education-policy"] },
  { id: "crossref-environmental-justice-papers", name: "Crossref Environmental Justice Papers", description: "Recent Crossref literature about environmental justice.", query: "environmental justice", defaultTags: ["crossref", "environmental-justice"] },
  { id: "crossref-food-security-papers", name: "Crossref Food Security Papers", description: "Recent Crossref literature about food security.", query: "food security", defaultTags: ["crossref", "food-security"] },
  { id: "crossref-public-policy-papers", name: "Crossref Public Policy Papers", description: "Recent Crossref literature about public policy.", query: "public policy", defaultTags: ["crossref", "public-policy"] },
  { id: "crossref-sustainable-finance-papers", name: "Crossref Sustainable Finance Papers", description: "Recent Crossref literature about sustainable finance.", query: "sustainable finance", defaultTags: ["crossref", "sustainable-finance"] },
  { id: "crossref-urban-planning-papers", name: "Crossref Urban Planning Papers", description: "Recent Crossref literature about urban planning.", query: "urban planning", defaultTags: ["crossref", "urban-planning"] },
  { id: "crossref-water-security-papers", name: "Crossref Water Security Papers", description: "Recent Crossref literature about water security.", query: "water security", defaultTags: ["crossref", "water-security"] },
].map(({ id, name, description, query, defaultTags }) =>
  createCrossrefScraper({
    id,
    name,
    category: "academic",
    description,
    homepage: "https://api.crossref.org/works",
    sourceName: "Crossref",
    query,
    defaultTags: defaultTags as string[],
    defaults: {
      query,
    },
    params: [
      {
        key: "query",
        description: "Crossref query title override.",
        example: query,
      },
    ],
  }),
);

export default crossrefTopicScrapers;
