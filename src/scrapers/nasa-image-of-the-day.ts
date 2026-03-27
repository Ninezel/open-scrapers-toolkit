import { createRssScraper } from "../core/factories.js";

const scraper = createRssScraper({
  id: "nasa-image-of-the-day",
  name: "NASA Image Of The Day",
  category: "news",
  description: "Daily NASA imagery feed with captions and article links.",
  homepage: "https://www.nasa.gov/image-of-the-day/",
  sourceName: "NASA",
  feedUrl: "https://www.nasa.gov/rss/dyn/lg_image_of_the_day.rss",
  defaultTags: ["space", "imagery", "daily"],
});

export default scraper;
