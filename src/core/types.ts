export type ScraperCategory = "academic" | "news" | "reports" | "weather";

export interface ScraperParameter {
  key: string;
  description: string;
  example?: string;
  required?: boolean;
}

export interface ScrapedRecord {
  id: string;
  source: string;
  title: string;
  url?: string;
  summary?: string;
  publishedAt?: string;
  authors?: string[];
  tags?: string[];
  location?: string;
  metadata?: Record<string, unknown>;
}

export interface ScrapeResult {
  scraperId: string;
  scraperName: string;
  category: ScraperCategory;
  source: string;
  fetchedAt: string;
  records: ScrapedRecord[];
  meta?: Record<string, unknown>;
}

export interface ScraperContext {
  limit: number;
  outputDir: string;
  params: Record<string, string>;
  userAgent: string;
  contactEmail?: string;
  cacheTtlMs?: number;
  now: Date;
  retryCount?: number;
  retryDelayMs?: number;
}

export interface ScraperDefinition {
  id: string;
  name: string;
  category: ScraperCategory;
  description: string;
  homepage: string;
  sourceName?: string;
  defaults?: Record<string, string>;
  params?: ScraperParameter[];
  run: (context: ScraperContext) => Promise<ScrapeResult>;
}
