import { createRssScraper } from "../core/factories.js";

const scraper = createRssScraper({
  id: "bbc-business-news",
  name: "BBC Business News",
  category: "news",
  description: "Business headlines from the BBC News RSS feed.",
  homepage: "https://www.bbc.com/news/business",
  sourceName: "BBC News",
  feedUrl: "https://feeds.bbci.co.uk/news/business/rss.xml",
  defaultTags: ["business", "headlines"],
});

export default scraper;
