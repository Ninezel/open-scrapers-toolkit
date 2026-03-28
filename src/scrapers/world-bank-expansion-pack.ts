import {
  createWorldBankDocumentsScraper,
  createWorldBankIndicatorScraper,
} from "../core/factories.js";

const worldBankDocumentScrapers = [
  { id: "world-bank-agriculture-documents", name: "World Bank Agriculture Documents", description: "World Bank agriculture-related documents.", query: "agriculture", defaultTags: ["world-bank", "agriculture"] },
  { id: "world-bank-disaster-risk-documents", name: "World Bank Disaster Risk Documents", description: "World Bank disaster risk management documents.", query: "\"disaster risk\"", defaultTags: ["world-bank", "disaster-risk"] },
  { id: "world-bank-energy-documents", name: "World Bank Energy Documents", description: "World Bank energy-related documents.", query: "energy", defaultTags: ["world-bank", "energy"] },
  { id: "world-bank-governance-documents", name: "World Bank Governance Documents", description: "World Bank governance-related documents.", query: "governance", defaultTags: ["world-bank", "governance"] },
  { id: "world-bank-social-protection-documents", name: "World Bank Social Protection Documents", description: "World Bank social protection documents.", query: "\"social protection\"", defaultTags: ["world-bank", "social-protection"] },
].map(({ id, name, description, query, defaultTags }) =>
  createWorldBankDocumentsScraper({
    id,
    name,
    category: "reports",
    description,
    homepage: "https://search.worldbank.org/api/v3/wds",
    sourceName: "World Bank",
    query,
    defaultTags: defaultTags as string[],
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

const worldBankIndicatorScrapers = [
  { id: "world-bank-access-to-electricity", name: "World Bank Access To Electricity", description: "Latest World Bank access-to-electricity indicator snapshots.", indicator: "EG.ELC.ACCS.ZS", topic: "access to electricity", defaultTags: ["world-bank", "electricity"] },
  { id: "world-bank-co2-emissions", name: "World Bank CO2 Emissions", description: "Latest World Bank CO2-emissions-per-capita indicator snapshots.", indicator: "EN.ATM.CO2E.PC", topic: "CO2 emissions", defaultTags: ["world-bank", "co2-emissions"] },
  { id: "world-bank-life-expectancy", name: "World Bank Life Expectancy", description: "Latest World Bank life-expectancy indicator snapshots.", indicator: "SP.DYN.LE00.IN", topic: "life expectancy", defaultTags: ["world-bank", "life-expectancy"] },
  { id: "world-bank-unemployment", name: "World Bank Unemployment", description: "Latest World Bank unemployment indicator snapshots.", indicator: "SL.UEM.TOTL.ZS", topic: "unemployment", defaultTags: ["world-bank", "unemployment"] },
].map(({ id, name, description, indicator, topic, defaultTags }) =>
  createWorldBankIndicatorScraper({
    id,
    name,
    category: "reports",
    description,
    homepage: "https://api.worldbank.org/",
    sourceName: "World Bank",
    indicator,
    defaultCountry: "all",
    defaultTags: defaultTags as string[],
    defaults: {
      country: "all",
    },
    params: [
      {
        key: "country",
        description: `ISO3 country code override for the ${String(topic)} indicator.`,
        example: "GBR",
      },
    ],
  }),
);

export default [...worldBankDocumentScrapers, ...worldBankIndicatorScrapers];
