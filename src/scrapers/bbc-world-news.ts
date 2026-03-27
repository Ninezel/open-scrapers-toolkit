import { createRssScraper } from "../core/factories.js";

const scraper = createRssScraper({
  id: "bbc-world-news",
  name: "BBC World News",
  category: "news",
  description: "World headlines from the BBC News RSS feed.",
  homepage: "https://www.bbc.com/news",
  sourceName: "BBC News",
  feedUrl: "https://feeds.bbci.co.uk/news/world/rss.xml",
  defaultTags: ["world", "headlines"],
});

export default scraper;
