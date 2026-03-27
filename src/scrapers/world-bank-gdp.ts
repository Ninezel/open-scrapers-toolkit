import { createWorldBankIndicatorScraper } from "../core/factories.js";

const scraper = createWorldBankIndicatorScraper({
  id: "world-bank-gdp",
  name: "World Bank GDP Snapshot",
  category: "reports",
  description: "Latest GDP values from the World Bank indicator API.",
  homepage: "https://datahelpdesk.worldbank.org/knowledgebase/topics/125589",
  sourceName: "World Bank Open Data",
  indicator: "NY.GDP.MKTP.CD",
  defaultCountry: "all",
  defaultTags: ["world-bank", "gdp", "economy", "indicator"],
  defaults: {
    country: "all",
  },
  params: [
    {
      key: "country",
      description: "Country or region code accepted by the World Bank API.",
      example: "USA",
    },
  ],
});

export default scraper;
