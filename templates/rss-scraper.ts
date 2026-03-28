import { createRssScraper } from "../src/core/factories.js";

export default createRssScraper({
  id: "example-rss-scraper",
  name: "Example RSS Scraper",
  category: "news",
  description: "Starter template for an RSS or Atom-based scraper.",
  homepage: "https://example.com/feed",
  sourceName: "Example Source",
  feedUrl: "https://example.com/feed.xml",
  defaultTags: ["example"],
});
