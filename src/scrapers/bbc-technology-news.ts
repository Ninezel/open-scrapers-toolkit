import { createRssScraper } from "../core/factories.js";

const scraper = createRssScraper({
  id: "bbc-technology-news",
  name: "BBC Technology News",
  category: "news",
  description: "Technology headlines from the BBC News RSS feed.",
  homepage: "https://www.bbc.com/news/technology",
  sourceName: "BBC News",
  feedUrl: "https://feeds.bbci.co.uk/news/technology/rss.xml",
  defaultTags: ["technology", "headlines"],
});

export default scraper;
