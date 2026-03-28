import { createWorldBankDocumentsScraper } from "../core/factories.js";

const topics = [
  ["world-bank-climate-resilience-documents", "World Bank Climate Resilience Documents", "World Bank climate-resilience documents.", "\"climate resilience\"", ["world-bank", "climate-resilience"]],
  ["world-bank-disaster-recovery-documents", "World Bank Disaster Recovery Documents", "World Bank disaster-recovery documents.", "\"disaster recovery\"", ["world-bank", "disaster-recovery"]],
  ["world-bank-digital-development-documents", "World Bank Digital Development Documents", "World Bank digital-development documents.", "\"digital development\"", ["world-bank", "digital-development"]],
  ["world-bank-poverty-reduction-documents", "World Bank Poverty Reduction Documents", "World Bank poverty-reduction documents.", "\"poverty reduction\"", ["world-bank", "poverty-reduction"]],
  ["world-bank-education-quality-documents", "World Bank Education Quality Documents", "World Bank education-quality documents.", "\"education quality\"", ["world-bank", "education-quality"]],
  ["world-bank-health-systems-documents", "World Bank Health Systems Documents", "World Bank health-systems documents.", "\"health systems\"", ["world-bank", "health-systems"]],
  ["world-bank-gender-equality-documents", "World Bank Gender Equality Documents", "World Bank gender-equality documents.", "\"gender equality\"", ["world-bank", "gender-equality"]],
  ["world-bank-food-security-documents", "World Bank Food Security Documents", "World Bank food-security documents.", "\"food security\"", ["world-bank", "food-security"]],
  ["world-bank-labour-markets-documents", "World Bank Labour Markets Documents", "World Bank labour-market documents.", "\"labour market\" OR \"labor market\"", ["world-bank", "labour-markets"]],
  ["world-bank-transport-infrastructure-documents", "World Bank Transport Infrastructure Documents", "World Bank transport-infrastructure documents.", "\"transport infrastructure\"", ["world-bank", "transport-infrastructure"]],
  ["world-bank-urban-development-documents", "World Bank Urban Development Documents", "World Bank urban-development documents.", "\"urban development\"", ["world-bank", "urban-development"]],
  ["world-bank-water-supply-documents", "World Bank Water Supply Documents", "World Bank water-supply documents.", "\"water supply\"", ["world-bank", "water-supply"]],
  ["world-bank-sanitation-documents", "World Bank Sanitation Documents", "World Bank sanitation documents.", "sanitation", ["world-bank", "sanitation"]],
  ["world-bank-governance-reform-documents", "World Bank Governance Reform Documents", "World Bank governance-reform documents.", "\"governance reform\"", ["world-bank", "governance-reform"]],
  ["world-bank-fragility-and-conflict-documents", "World Bank Fragility And Conflict Documents", "World Bank fragility-and-conflict documents.", "\"fragility conflict\" OR fragility", ["world-bank", "fragility-and-conflict"]],
  ["world-bank-social-inclusion-documents", "World Bank Social Inclusion Documents", "World Bank social-inclusion documents.", "\"social inclusion\"", ["world-bank", "social-inclusion"]],
  ["world-bank-housing-documents", "World Bank Housing Documents", "World Bank housing documents.", "housing", ["world-bank", "housing"]],
  ["world-bank-financial-inclusion-documents", "World Bank Financial Inclusion Documents", "World Bank financial-inclusion documents.", "\"financial inclusion\"", ["world-bank", "financial-inclusion"]],
  ["world-bank-agriculture-productivity-documents", "World Bank Agriculture Productivity Documents", "World Bank agriculture-productivity documents.", "\"agriculture productivity\"", ["world-bank", "agriculture-productivity"]],
  ["world-bank-clean-energy-documents", "World Bank Clean Energy Documents", "World Bank clean-energy documents.", "\"clean energy\"", ["world-bank", "clean-energy"]],
  ["world-bank-migration-documents", "World Bank Migration Documents", "World Bank migration documents.", "migration", ["world-bank", "migration"]],
  ["world-bank-public-finance-documents", "World Bank Public Finance Documents", "World Bank public-finance documents.", "\"public finance\"", ["world-bank", "public-finance"]],
  ["world-bank-air-pollution-documents", "World Bank Air Pollution Documents", "World Bank air-pollution documents.", "\"air pollution\"", ["world-bank", "air-pollution"]],
  ["world-bank-coastal-resilience-documents", "World Bank Coastal Resilience Documents", "World Bank coastal-resilience documents.", "\"coastal resilience\"", ["world-bank", "coastal-resilience"]],
  ["world-bank-youth-employment-documents", "World Bank Youth Employment Documents", "World Bank youth-employment documents.", "\"youth employment\"", ["world-bank", "youth-employment"]],
] as const;

const worldBankDocumentExpansionPack = topics.map(
  ([id, name, description, query, defaultTags]) =>
    createWorldBankDocumentsScraper({
      id,
      name,
      category: "reports",
      description,
      homepage: "https://search.worldbank.org/api/v3/wds",
      sourceName: "World Bank",
      query,
      defaultTags: [...defaultTags],
      defaults: {
        query,
      },
      params: [
        {
          key: "query",
          description: "World Bank document query override.",
          example: query.replaceAll("\"", ""),
        },
      ],
    }),
);

export default worldBankDocumentExpansionPack;
