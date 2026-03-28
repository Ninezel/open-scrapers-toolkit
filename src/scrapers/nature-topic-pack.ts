import { createRssScraper } from "../core/factories.js";

const natureTopicScrapers = [
  {
    id: "nature-climate-change",
    name: "Nature Climate Change",
    description: "Latest Nature articles tagged with climate change.",
    homepage: "https://www.nature.com/subjects/climate-change",
    feedUrl: "https://www.nature.com/subjects/climate-change.rss",
    defaultTags: ["nature", "climate-change"],
  },
  {
    id: "nature-machine-learning",
    name: "Nature Machine Learning",
    description: "Latest Nature articles tagged with machine learning.",
    homepage: "https://www.nature.com/subjects/machine-learning",
    feedUrl: "https://www.nature.com/subjects/machine-learning.rss",
    defaultTags: ["nature", "machine-learning"],
  },
  {
    id: "nature-genetics",
    name: "Nature Genetics",
    description: "Latest Nature articles tagged with genetics.",
    homepage: "https://www.nature.com/subjects/genetics",
    feedUrl: "https://www.nature.com/subjects/genetics.rss",
    defaultTags: ["nature", "genetics"],
  },
  {
    id: "nature-cancer",
    name: "Nature Cancer",
    description: "Latest Nature articles tagged with cancer research.",
    homepage: "https://www.nature.com/subjects/cancer",
    feedUrl: "https://www.nature.com/subjects/cancer.rss",
    defaultTags: ["nature", "cancer"],
  },
  {
    id: "nature-ecology",
    name: "Nature Ecology",
    description: "Latest Nature articles tagged with ecology.",
    homepage: "https://www.nature.com/subjects/ecology",
    feedUrl: "https://www.nature.com/subjects/ecology.rss",
    defaultTags: ["nature", "ecology"],
  },
].map((config) =>
  createRssScraper({
    ...config,
    category: "academic",
    sourceName: "Nature",
  }),
);

export default natureTopicScrapers;
