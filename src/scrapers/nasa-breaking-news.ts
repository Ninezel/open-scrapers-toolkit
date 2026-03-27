import { createRssScraper } from "../core/factories.js";

const scraper = createRssScraper({
  id: "nasa-breaking-news",
  name: "NASA Breaking News",
  category: "news",
  description: "Latest NASA announcements from the public RSS feed.",
  homepage: "https://www.nasa.gov/news/",
  sourceName: "NASA",
  feedUrl: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
  defaultTags: ["space", "science", "official"],
});

export default scraper;
