import { createWorldBankIndicatorScraper } from "../core/factories.js";

const scraper = createWorldBankIndicatorScraper({
  id: "world-bank-population",
  name: "World Bank Population Snapshot",
  category: "reports",
  description: "Latest population indicator values from the World Bank API.",
  homepage: "https://datahelpdesk.worldbank.org/knowledgebase/topics/125589",
  sourceName: "World Bank Open Data",
  indicator: "SP.POP.TOTL",
  defaultCountry: "all",
  defaultTags: ["world-bank", "population", "indicator"],
  defaults: {
    country: "all",
  },
  params: [
    {
      key: "country",
      description: "Country or region code accepted by the World Bank API.",
      example: "GBR",
    },
  ],
});

export default scraper;
