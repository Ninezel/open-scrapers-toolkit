import { createCrossrefScraper } from "../core/factories.js";

const topics = [
  ["crossref-ai-ethics-papers", "Crossref AI Ethics Papers", "Recent Crossref literature about AI ethics.", "\"AI ethics\" OR \"artificial intelligence ethics\"", ["crossref", "ai-ethics"]],
  ["crossref-climate-adaptation-papers", "Crossref Climate Adaptation Papers", "Recent Crossref literature about climate adaptation.", "\"climate adaptation\"", ["crossref", "climate-adaptation"]],
  ["crossref-disaster-recovery-papers", "Crossref Disaster Recovery Papers", "Recent Crossref literature about disaster recovery.", "\"disaster recovery\"", ["crossref", "disaster-recovery"]],
  ["crossref-public-health-policy-papers", "Crossref Public Health Policy Papers", "Recent Crossref literature about public health policy.", "\"public health policy\"", ["crossref", "public-health-policy"]],
  ["crossref-humanitarian-response-papers", "Crossref Humanitarian Response Papers", "Recent Crossref literature about humanitarian response.", "\"humanitarian response\"", ["crossref", "humanitarian-response"]],
  ["crossref-food-systems-papers", "Crossref Food Systems Papers", "Recent Crossref literature about food systems.", "\"food systems\"", ["crossref", "food-systems"]],
  ["crossref-water-governance-papers", "Crossref Water Governance Papers", "Recent Crossref literature about water governance.", "\"water governance\"", ["crossref", "water-governance"]],
  ["crossref-urban-resilience-papers", "Crossref Urban Resilience Papers", "Recent Crossref literature about urban resilience.", "\"urban resilience\"", ["crossref", "urban-resilience"]],
  ["crossref-migration-studies-papers", "Crossref Migration Studies Papers", "Recent Crossref literature about migration studies.", "\"migration studies\"", ["crossref", "migration-studies"]],
  ["crossref-peacebuilding-papers", "Crossref Peacebuilding Papers", "Recent Crossref literature about peacebuilding.", "peacebuilding", ["crossref", "peacebuilding"]],
  ["crossref-religion-and-society-papers", "Crossref Religion And Society Papers", "Recent Crossref literature about religion and society.", "\"religion and society\"", ["crossref", "religion-and-society"]],
  ["crossref-education-technology-papers", "Crossref Education Technology Papers", "Recent Crossref literature about education technology.", "\"education technology\"", ["crossref", "education-technology"]],
  ["crossref-labour-economics-papers", "Crossref Labour Economics Papers", "Recent Crossref literature about labour economics.", "\"labour economics\" OR \"labor economics\"", ["crossref", "labour-economics"]],
  ["crossref-housing-policy-papers", "Crossref Housing Policy Papers", "Recent Crossref literature about housing policy.", "\"housing policy\"", ["crossref", "housing-policy"]],
  ["crossref-transport-planning-papers", "Crossref Transport Planning Papers", "Recent Crossref literature about transport planning.", "\"transport planning\"", ["crossref", "transport-planning"]],
  ["crossref-sustainable-agriculture-papers", "Crossref Sustainable Agriculture Papers", "Recent Crossref literature about sustainable agriculture.", "\"sustainable agriculture\"", ["crossref", "sustainable-agriculture"]],
  ["crossref-biodiversity-conservation-papers", "Crossref Biodiversity Conservation Papers", "Recent Crossref literature about biodiversity conservation.", "\"biodiversity conservation\"", ["crossref", "biodiversity-conservation"]],
  ["crossref-renewable-energy-storage-papers", "Crossref Renewable Energy Storage Papers", "Recent Crossref literature about renewable-energy storage.", "\"renewable energy storage\"", ["crossref", "renewable-energy-storage"]],
  ["crossref-digital-inclusion-papers", "Crossref Digital Inclusion Papers", "Recent Crossref literature about digital inclusion.", "\"digital inclusion\"", ["crossref", "digital-inclusion"]],
  ["crossref-gender-equality-papers", "Crossref Gender Equality Papers", "Recent Crossref literature about gender equality.", "\"gender equality\"", ["crossref", "gender-equality"]],
  ["crossref-mental-health-policy-papers", "Crossref Mental Health Policy Papers", "Recent Crossref literature about mental-health policy.", "\"mental health policy\"", ["crossref", "mental-health-policy"]],
  ["crossref-oncology-research-papers", "Crossref Oncology Research Papers", "Recent Crossref literature about oncology research.", "\"oncology research\"", ["crossref", "oncology-research"]],
  ["crossref-marine-conservation-papers", "Crossref Marine Conservation Papers", "Recent Crossref literature about marine conservation.", "\"marine conservation\"", ["crossref", "marine-conservation"]],
  ["crossref-social-care-papers", "Crossref Social Care Papers", "Recent Crossref literature about social care.", "\"social care\"", ["crossref", "social-care"]],
  ["crossref-vatican-studies-papers", "Crossref Vatican Studies Papers", "Recent Crossref literature about Vatican studies and church history.", "\"Vatican\" OR \"Catholic Church\"", ["crossref", "vatican-studies"]],
] as const;

const crossrefExpansionPack = topics.map(([id, name, description, query, defaultTags]) =>
  createCrossrefScraper({
    id,
    name,
    category: "academic",
    description,
    homepage: "https://api.crossref.org/works",
    sourceName: "Crossref",
    query,
    defaultTags: [...defaultTags],
    defaults: {
      query,
    },
    params: [
      {
        key: "query",
        description: "Crossref query title override.",
        example: query.replaceAll("\"", ""),
      },
    ],
  }),
);

export default crossrefExpansionPack;
