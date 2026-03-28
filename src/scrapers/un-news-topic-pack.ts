import { createRssScraper } from "../core/factories.js";

const unNewsTopicScrapers = [
  {
    id: "un-news-climate-change",
    name: "UN News Climate Change",
    description: "Latest UN News coverage on climate change.",
    homepage: "https://news.un.org/en/news/topic/climate-change",
    feedUrl: "https://news.un.org/feed/subscribe/en/news/topic/climate-change/feed/rss.xml",
    defaultTags: ["un", "climate-change"],
  },
  {
    id: "un-news-health",
    name: "UN News Health",
    description: "Latest UN News coverage on global health.",
    homepage: "https://news.un.org/en/news/topic/health",
    feedUrl: "https://news.un.org/feed/subscribe/en/news/topic/health/feed/rss.xml",
    defaultTags: ["un", "health"],
  },
  {
    id: "un-news-human-rights",
    name: "UN News Human Rights",
    description: "Latest UN News coverage on human rights.",
    homepage: "https://news.un.org/en/news/topic/human-rights",
    feedUrl: "https://news.un.org/feed/subscribe/en/news/topic/human-rights/feed/rss.xml",
    defaultTags: ["un", "human-rights"],
  },
  {
    id: "un-news-peace-security",
    name: "UN News Peace And Security",
    description: "Latest UN News coverage on peace and security.",
    homepage: "https://news.un.org/en/news/topic/peace-and-security",
    feedUrl: "https://news.un.org/feed/subscribe/en/news/topic/peace-and-security/feed/rss.xml",
    defaultTags: ["un", "peace-and-security"],
  },
  {
    id: "un-news-women",
    name: "UN News Women",
    description: "Latest UN News coverage on women and gender issues.",
    homepage: "https://news.un.org/en/news/topic/women",
    feedUrl: "https://news.un.org/feed/subscribe/en/news/topic/women/feed/rss.xml",
    defaultTags: ["un", "women"],
  },
  {
    id: "un-news-migrants-refugees",
    name: "UN News Migrants And Refugees",
    description: "Latest UN News coverage on migrants and refugees.",
    homepage: "https://news.un.org/en/news/topic/migrants-and-refugees",
    feedUrl: "https://news.un.org/feed/subscribe/en/news/topic/migrants-and-refugees/feed/rss.xml",
    defaultTags: ["un", "migrants", "refugees"],
  },
  {
    id: "un-news-humanitarian-aid",
    name: "UN News Humanitarian Aid",
    description: "Latest UN News coverage on humanitarian aid.",
    homepage: "https://news.un.org/en/news/topic/humanitarian-aid",
    feedUrl: "https://news.un.org/feed/subscribe/en/news/topic/humanitarian-aid/feed/rss.xml",
    defaultTags: ["un", "humanitarian-aid"],
  },
  {
    id: "un-news-sdgs",
    name: "UN News Sustainable Development Goals",
    description: "Latest UN News coverage on the Sustainable Development Goals.",
    homepage: "https://news.un.org/en/news/topic/sdgs",
    feedUrl: "https://news.un.org/feed/subscribe/en/news/topic/sdgs/feed/rss.xml",
    defaultTags: ["un", "sdgs"],
  },
].map((config) =>
  createRssScraper({
    ...config,
    category: "news",
    sourceName: "UN News",
  }),
);

export default unNewsTopicScrapers;
