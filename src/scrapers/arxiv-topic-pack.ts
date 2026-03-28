import { createArxivScraper } from "../core/factories.js";

const arxivTopicScrapers = [
  { id: "arxiv-computer-vision", name: "arXiv Computer Vision", description: "Recent arXiv records about computer vision.", query: "\"computer vision\"", defaultTags: ["arxiv", "computer-vision"] },
  { id: "arxiv-cybersecurity", name: "arXiv Cybersecurity", description: "Recent arXiv records about cybersecurity.", query: "cybersecurity", defaultTags: ["arxiv", "cybersecurity"] },
  { id: "arxiv-data-science", name: "arXiv Data Science", description: "Recent arXiv records about data science.", query: "\"data science\"", defaultTags: ["arxiv", "data-science"] },
  { id: "arxiv-disaster-response", name: "arXiv Disaster Response", description: "Recent arXiv records about disaster response.", query: "\"disaster response\"", defaultTags: ["arxiv", "disaster-response"] },
  { id: "arxiv-medical-imaging", name: "arXiv Medical Imaging", description: "Recent arXiv records about medical imaging.", query: "\"medical imaging\"", defaultTags: ["arxiv", "medical-imaging"] },
  { id: "arxiv-natural-language-processing", name: "arXiv Natural Language Processing", description: "Recent arXiv records about natural language processing.", query: "\"natural language processing\"", defaultTags: ["arxiv", "nlp"] },
  { id: "arxiv-quantum-computing", name: "arXiv Quantum Computing", description: "Recent arXiv records about quantum computing.", query: "\"quantum computing\"", defaultTags: ["arxiv", "quantum-computing"] },
  { id: "arxiv-remote-sensing", name: "arXiv Remote Sensing", description: "Recent arXiv records about remote sensing.", query: "\"remote sensing\"", defaultTags: ["arxiv", "remote-sensing"] },
  { id: "arxiv-renewable-energy-systems", name: "arXiv Renewable Energy Systems", description: "Recent arXiv records about renewable energy systems.", query: "\"renewable energy\"", defaultTags: ["arxiv", "renewable-energy"] },
  { id: "arxiv-robotics", name: "arXiv Robotics", description: "Recent arXiv records about robotics.", query: "robotics", defaultTags: ["arxiv", "robotics"] },
].map(({ id, name, description, query, defaultTags }) =>
  createArxivScraper({
    id,
    name,
    category: "academic",
    description,
    homepage: "https://arxiv.org/",
    sourceName: "arXiv",
    query,
    defaultTags: defaultTags as string[],
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

export default arxivTopicScrapers;
