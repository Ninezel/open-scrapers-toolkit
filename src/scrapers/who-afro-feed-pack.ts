import { createRssScraper } from "../core/factories.js";

const whoAfroScrapers = [
  {
    id: "who-afro-featured-news",
    name: "WHO AFRO Featured News",
    description: "Featured news from the WHO Regional Office for Africa.",
    homepage: "https://www.afro.who.int/rss-feeds",
    feedUrl: "https://www.afro.who.int/rss/featured-news.xml",
    defaultTags: ["who", "africa", "featured-news"],
  },
  {
    id: "who-afro-emergencies",
    name: "WHO AFRO Emergencies And Outbreaks",
    description: "WHO AFRO emergencies and outbreak updates.",
    homepage: "https://www.afro.who.int/rss-feeds",
    feedUrl: "https://www.afro.who.int/rss/emergencies.xml",
    defaultTags: ["who", "africa", "emergencies"],
  },
  {
    id: "who-afro-rd-speeches",
    name: "WHO AFRO RD Speeches And Messages",
    description: "Speeches and messages from the WHO AFRO regional leadership.",
    homepage: "https://www.afro.who.int/rss-feeds",
    feedUrl: "https://www.afro.who.int/rss/speeches-messages.xml",
    defaultTags: ["who", "africa", "speeches"],
  },
].map((config) =>
  createRssScraper({
    ...config,
    category: "news",
    sourceName: "WHO AFRO",
  }),
);

export default whoAfroScrapers;
