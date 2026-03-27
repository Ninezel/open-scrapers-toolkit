import { scrapers } from "../scrapers/index.js";
import type { ScraperDefinition } from "./types.js";

export function getAllScrapers(): ScraperDefinition[] {
  return [...scrapers].sort((left, right) => left.id.localeCompare(right.id));
}

export function getScraperById(id: string): ScraperDefinition | undefined {
  return getAllScrapers().find((scraper) => scraper.id === id);
}
