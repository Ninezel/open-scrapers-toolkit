import arxivClimateScience from "./arxiv-climate-science.js";
import arxivMachineLearning from "./arxiv-machine-learning.js";
import arxivPublicHealth from "./arxiv-public-health.js";
import arxivTopicPack from "./arxiv-topic-pack.js";
import bbcBusinessNews from "./bbc-business-news.js";
import bbcScienceEnvironmentNews from "./bbc-science-environment-news.js";
import bbcTechnologyNews from "./bbc-technology-news.js";
import bbcWorldNews from "./bbc-world-news.js";
import crossrefAiPapers from "./crossref-ai-papers.js";
import crossrefCybersecurityPapers from "./crossref-cybersecurity-papers.js";
import crossrefClimatePapers from "./crossref-climate-papers.js";
import crossrefRenewableEnergyPapers from "./crossref-renewable-energy-papers.js";
import crossrefTopicPack from "./crossref-topic-pack.js";
import europePmcInfectiousDisease from "./europepmc-infectious-disease.js";
import europePmcMentalHealth from "./europepmc-mental-health.js";
import europePmcOncology from "./europepmc-oncology.js";
import europePmcPublicHealth from "./europepmc-public-health.js";
import europePmcTopicPack from "./europepmc-topic-pack.js";
import nasaBreakingNews from "./nasa-breaking-news.js";
import nasaImageOfTheDay from "./nasa-image-of-the-day.js";
import natureTopicPack from "./nature-topic-pack.js";
import nwsActiveAlerts from "./nws-active-alerts.js";
import openMeteoAirQuality from "./open-meteo-air-quality.js";
import openMeteoCityForecast from "./open-meteo-city-forecast.js";
import redditRandomSubredditImage from "./reddit-random-subreddit-image.js";
import unNewsTopicPack from "./un-news-topic-pack.js";
import usgsEarthquakes from "./usgs-earthquakes.js";
import websiteLinksAiDigest from "./website-links-ai-digest.js";
import worldBankClimateDocuments from "./world-bank-climate-documents.js";
import worldBankEducationDocuments from "./world-bank-education-documents.js";
import worldBankExpansionPack from "./world-bank-expansion-pack.js";
import worldBankGdp from "./world-bank-gdp.js";
import worldBankHealthDocuments from "./world-bank-health-documents.js";
import worldBankPopulation from "./world-bank-population.js";
import worldBankWaterDocuments from "./world-bank-water-documents.js";
import whoAfroFeedPack from "./who-afro-feed-pack.js";

export const scrapers = [
  arxivClimateScience,
  arxivMachineLearning,
  arxivPublicHealth,
  ...arxivTopicPack,
  bbcBusinessNews,
  bbcScienceEnvironmentNews,
  bbcTechnologyNews,
  bbcWorldNews,
  crossrefAiPapers,
  crossrefCybersecurityPapers,
  crossrefClimatePapers,
  crossrefRenewableEnergyPapers,
  ...crossrefTopicPack,
  europePmcInfectiousDisease,
  europePmcMentalHealth,
  europePmcOncology,
  europePmcPublicHealth,
  ...europePmcTopicPack,
  nasaBreakingNews,
  nasaImageOfTheDay,
  ...natureTopicPack,
  nwsActiveAlerts,
  openMeteoAirQuality,
  openMeteoCityForecast,
  redditRandomSubredditImage,
  ...unNewsTopicPack,
  usgsEarthquakes,
  websiteLinksAiDigest,
  worldBankClimateDocuments,
  worldBankEducationDocuments,
  ...worldBankExpansionPack,
  worldBankGdp,
  worldBankHealthDocuments,
  worldBankPopulation,
  worldBankWaterDocuments,
  ...whoAfroFeedPack,
];
