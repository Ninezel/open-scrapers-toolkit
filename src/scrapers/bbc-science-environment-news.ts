import { createRssScraper } from "../core/factories.js";

const scraper = createRssScraper({
  id: "bbc-science-environment-news",
  name: "BBC Science & Environment News",
  category: "news",
  description: "Science and environment coverage from the BBC News RSS feed.",
  homepage: "https://www.bbc.com/news/science_and_environment",
  sourceName: "BBC News",
  feedUrl: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
  defaultTags: ["science", "environment", "headlines"],
});

export default scraper;
