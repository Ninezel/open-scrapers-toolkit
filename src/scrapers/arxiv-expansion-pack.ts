import { createArxivScraper } from "../core/factories.js";

const topics = [
  ["arxiv-large-language-models", "arXiv Large Language Models", "Recent arXiv records about large language models.", "\"large language models\"", ["arxiv", "large-language-models"]],
  ["arxiv-computer-vision-systems", "arXiv Computer Vision Systems", "Recent arXiv records about applied computer-vision systems.", "\"computer vision\"", ["arxiv", "computer-vision"]],
  ["arxiv-reinforcement-learning", "arXiv Reinforcement Learning", "Recent arXiv records about reinforcement learning.", "\"reinforcement learning\"", ["arxiv", "reinforcement-learning"]],
  ["arxiv-bioinformatics", "arXiv Bioinformatics", "Recent arXiv records about bioinformatics.", "bioinformatics", ["arxiv", "bioinformatics"]],
  ["arxiv-computational-biology", "arXiv Computational Biology", "Recent arXiv records about computational biology.", "\"computational biology\"", ["arxiv", "computational-biology"]],
  ["arxiv-climate-modelling", "arXiv Climate Modelling", "Recent arXiv records about climate modelling.", "\"climate modeling\" OR \"climate modelling\"", ["arxiv", "climate-modelling"]],
  ["arxiv-optimisation", "arXiv Optimisation", "Recent arXiv records about optimisation.", "optimization OR optimisation", ["arxiv", "optimisation"]],
  ["arxiv-statistics", "arXiv Statistics", "Recent arXiv records about statistics.", "statistics", ["arxiv", "statistics"]],
  ["arxiv-information-retrieval", "arXiv Information Retrieval", "Recent arXiv records about information retrieval.", "\"information retrieval\"", ["arxiv", "information-retrieval"]],
  ["arxiv-speech-recognition", "arXiv Speech Recognition", "Recent arXiv records about speech recognition.", "\"speech recognition\"", ["arxiv", "speech-recognition"]],
  ["arxiv-astrophysics", "arXiv Astrophysics", "Recent arXiv records about astrophysics.", "astrophysics", ["arxiv", "astrophysics"]],
  ["arxiv-high-energy-physics", "arXiv High Energy Physics", "Recent arXiv records about high-energy physics.", "\"high energy physics\"", ["arxiv", "high-energy-physics"]],
  ["arxiv-condensed-matter", "arXiv Condensed Matter", "Recent arXiv records about condensed matter.", "\"condensed matter\"", ["arxiv", "condensed-matter"]],
  ["arxiv-cryptography", "arXiv Cryptography", "Recent arXiv records about cryptography.", "cryptography", ["arxiv", "cryptography"]],
  ["arxiv-network-science", "arXiv Network Science", "Recent arXiv records about network science.", "\"network science\"", ["arxiv", "network-science"]],
  ["arxiv-geospatial-analysis", "arXiv Geospatial Analysis", "Recent arXiv records about geospatial analysis.", "\"geospatial analysis\"", ["arxiv", "geospatial-analysis"]],
  ["arxiv-human-computer-interaction", "arXiv Human Computer Interaction", "Recent arXiv records about human-computer interaction.", "\"human computer interaction\" OR HCI", ["arxiv", "human-computer-interaction"]],
  ["arxiv-fairness-in-ai", "arXiv Fairness In AI", "Recent arXiv records about fairness in AI.", "\"fairness in AI\"", ["arxiv", "fairness-in-ai"]],
  ["arxiv-edge-computing", "arXiv Edge Computing", "Recent arXiv records about edge computing.", "\"edge computing\"", ["arxiv", "edge-computing"]],
  ["arxiv-computer-graphics", "arXiv Computer Graphics", "Recent arXiv records about computer graphics.", "\"computer graphics\"", ["arxiv", "computer-graphics"]],
  ["arxiv-medical-ai", "arXiv Medical AI", "Recent arXiv records about medical AI.", "\"medical AI\" OR \"artificial intelligence in healthcare\"", ["arxiv", "medical-ai"]],
  ["arxiv-energy-systems", "arXiv Energy Systems", "Recent arXiv records about energy systems.", "\"energy systems\"", ["arxiv", "energy-systems"]],
  ["arxiv-smart-grids", "arXiv Smart Grids", "Recent arXiv records about smart grids.", "\"smart grid\" OR \"smart grids\"", ["arxiv", "smart-grids"]],
  ["arxiv-earth-observation", "arXiv Earth Observation", "Recent arXiv records about earth observation.", "\"earth observation\"", ["arxiv", "earth-observation"]],
  ["arxiv-scientific-computing", "arXiv Scientific Computing", "Recent arXiv records about scientific computing.", "\"scientific computing\"", ["arxiv", "scientific-computing"]],
] as const;

const arxivExpansionPack = topics.map(([id, name, description, query, defaultTags]) =>
  createArxivScraper({
    id,
    name,
    category: "academic",
    description,
    homepage: "https://arxiv.org/",
    sourceName: "arXiv",
    query,
    defaultTags: [...defaultTags],
    defaults: {
      query,
    },
    params: [
      {
        key: "query",
        description: "arXiv query override.",
        example: query.replaceAll("\"", ""),
      },
    ],
  }),
);

export default arxivExpansionPack;
