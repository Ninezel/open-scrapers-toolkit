import { Buffer } from "node:buffer";

import { fetchJson } from "./http.js";
import type { ScrapeResult, ScrapedRecord, ScraperContext } from "./types.js";
import {
  buildStableId,
  cleanText,
  parseBoolean,
  parseOptionalPositiveInteger,
  toIsoDate,
} from "./utils.js";

export type RedditSort = "hot" | "new" | "rising" | "top";
export type RedditTimeWindow = "all" | "day" | "hour" | "month" | "week" | "year";

/**
 * Options for the Reddit image helper used by the Discord-oriented subreddit scraper.
 * Pass a subreddit name and optionally control sorting, NSFW behaviour, and sample size.
 */
export interface RedditRandomImageOptions {
  allowNsfw?: boolean;
  category?: ScrapeResult["category"];
  random?: () => number;
  sampleSize?: number | string;
  sort?: RedditSort | string;
  sourceName?: string;
  subreddit: string;
  timeWindow?: RedditTimeWindow | string;
}

interface RedditTokenResponse {
  access_token?: string;
  token_type?: string;
}

interface RedditListingResponse {
  data?: {
    children?: Array<{
      data?: RedditPost;
    }>;
  };
}

interface RedditPostPreviewImage {
  source?: {
    url?: string;
  };
}

interface RedditPostPreview {
  images?: RedditPostPreviewImage[];
}

interface RedditPost {
  author?: string;
  created_utc?: number;
  id?: string;
  name?: string;
  num_comments?: number;
  over_18?: boolean;
  permalink?: string;
  post_hint?: string;
  preview?: RedditPostPreview;
  score?: number;
  spoiler?: boolean;
  subreddit?: string;
  title?: string;
  url?: string;
  url_overridden_by_dest?: string;
}

export interface RedditImageFetchResult {
  endpoint: string;
  listingSize: number;
  records: ScrapedRecord[];
  sort: RedditSort;
  subreddit: string;
  timeWindow: RedditTimeWindow;
}

const DEFAULT_REDDIT_SAMPLE_SIZE = 25;

function decodeRedditUrl(value: string | undefined): string | undefined {
  return value?.replace(/&amp;/giu, "&");
}

function isImageUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  return /\.(gif|jpe?g|png|webp)(\?.*)?$/iu.test(url);
}

function normalizeSort(value: string | undefined): RedditSort {
  switch (value?.trim().toLowerCase()) {
    case "new":
      return "new";
    case "rising":
      return "rising";
    case "top":
      return "top";
    default:
      return "hot";
  }
}

function normalizeTimeWindow(value: string | undefined): RedditTimeWindow {
  switch (value?.trim().toLowerCase()) {
    case "hour":
      return "hour";
    case "week":
      return "week";
    case "month":
      return "month";
    case "year":
      return "year";
    case "all":
      return "all";
    default:
      return "day";
  }
}

function resolveSampleSize(value: number | string | undefined): number {
  return Math.min(100, parseOptionalPositiveInteger(String(value ?? ""), DEFAULT_REDDIT_SAMPLE_SIZE));
}

function resolveRedditUserAgent(fallback?: string): string {
  return (
    process.env.REDDIT_USER_AGENT?.trim() ||
    fallback?.trim() ||
    process.env.SCRAPERS_USER_AGENT?.trim() ||
    "OpenScrapersReddit/0.3.0"
  );
}

async function resolveRedditAccessToken(context: ScraperContext): Promise<string> {
  const directToken = process.env.REDDIT_ACCESS_TOKEN?.trim();

  if (directToken) {
    return directToken;
  }

  const clientId = process.env.REDDIT_CLIENT_ID?.trim();
  const clientSecret = process.env.REDDIT_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "Reddit image scraping requires REDDIT_ACCESS_TOKEN or both REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET.",
    );
  }

  const payload = new URLSearchParams({
    grant_type: "client_credentials",
  });
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenResponse = await fetchJson<RedditTokenResponse>(
    {
      ...context,
      userAgent: resolveRedditUserAgent(context.userAgent),
    },
    "https://www.reddit.com/api/v1/access_token",
    {
      body: payload.toString(),
      headers: {
        accept: "application/json",
        authorization: `Basic ${basicAuth}`,
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": resolveRedditUserAgent(context.userAgent),
      },
      method: "POST",
    },
  );

  if (!tokenResponse.access_token || tokenResponse.token_type?.toLowerCase() !== "bearer") {
    throw new Error("Could not resolve a Reddit OAuth access token.");
  }

  return tokenResponse.access_token;
}

function extractImageUrl(post: RedditPost): string | undefined {
  const preview = decodeRedditUrl(post.preview?.images?.[0]?.source?.url);
  const direct = decodeRedditUrl(post.url_overridden_by_dest);
  const fallback = decodeRedditUrl(post.url);

  if (preview) {
    return preview;
  }

  if (post.post_hint === "image" && direct) {
    return direct;
  }

  if (isImageUrl(direct)) {
    return direct;
  }

  if (isImageUrl(fallback)) {
    return fallback;
  }

  return undefined;
}

function buildRedditRecord(
  post: RedditPost,
  imageUrl: string,
  sourceName: string,
): ScrapedRecord {
  const subreddit = post.subreddit ?? "unknown-subreddit";
  const permalink = post.permalink ? `https://www.reddit.com${post.permalink}` : undefined;
  const publishedAt = post.created_utc
    ? new Date(post.created_utc * 1000).toISOString()
    : undefined;
  const nsfw = Boolean(post.over_18);

  return {
    id: buildStableId("reddit-image", subreddit, post.id, post.name, imageUrl),
    source: sourceName,
    title: cleanText(post.title) ?? `Image from r/${subreddit}`,
    url: permalink ?? imageUrl,
    summary: `Random image post from r/${subreddit}${post.author ? ` by u/${post.author}` : ""}.`,
    publishedAt: toIsoDate(publishedAt),
    authors: post.author ? [post.author] : undefined,
    tags: [
      "reddit",
      "image",
      subreddit,
      nsfw ? "nsfw" : "sfw",
      ...(post.spoiler ? ["spoiler"] : []),
    ],
    metadata: {
      imageUrl,
      nsfw,
      permalink,
      postHint: post.post_hint,
      score: post.score,
      spoiler: Boolean(post.spoiler),
      subreddit,
      comments: post.num_comments,
      thumbnailUrl: imageUrl,
    },
  };
}

function pickRandomItems<T>(
  values: T[],
  limit: number,
  random: () => number,
): T[] {
  const pool = [...values];
  const selected: T[] = [];

  while (pool.length > 0 && selected.length < Math.max(1, limit)) {
    const index = Math.floor(random() * pool.length);
    selected.push(pool.splice(index, 1)[0]!);
  }

  return selected;
}

/**
 * Fetches a listing from Reddit's OAuth API, filters it down to image posts,
 * applies the NSFW policy, and returns randomly selected normalised records.
 */
export async function fetchRandomSubredditImageRecords(
  context: ScraperContext,
  options: RedditRandomImageOptions,
): Promise<RedditImageFetchResult> {
  const subreddit = options.subreddit.trim().replace(/^r\//iu, "");

  if (!subreddit) {
    throw new Error("A subreddit name is required for Reddit image scraping.");
  }

  const allowNsfw = parseBoolean(String(options.allowNsfw ?? false), false);
  const sort = normalizeSort(options.sort);
  const timeWindow = normalizeTimeWindow(options.timeWindow);
  const sampleSize = resolveSampleSize(options.sampleSize);
  const token = await resolveRedditAccessToken(context);
  const endpoint = new URL(`https://oauth.reddit.com/r/${subreddit}/${sort}`);
  endpoint.searchParams.set("limit", String(sampleSize));
  endpoint.searchParams.set("raw_json", "1");
  if (sort === "top") {
    endpoint.searchParams.set("t", timeWindow);
  }

  const listing = await fetchJson<RedditListingResponse>(
    {
      ...context,
      userAgent: resolveRedditUserAgent(context.userAgent),
    },
    endpoint.toString(),
    {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
        "user-agent": resolveRedditUserAgent(context.userAgent),
      },
    },
  );

  const posts = (listing.data?.children ?? [])
    .map((child) => child.data)
    .filter((post): post is RedditPost => Boolean(post));

  const filtered = posts
    .map((post) => ({
      imageUrl: extractImageUrl(post),
      post,
    }))
    .filter((entry) => Boolean(entry.imageUrl))
    .filter((entry) => allowNsfw || !entry.post.over_18);

  const picked = pickRandomItems(
    filtered,
    context.limit,
    options.random ?? Math.random,
  ).map((entry) => buildRedditRecord(entry.post, entry.imageUrl!, options.sourceName ?? "Reddit"));

  return {
    endpoint: endpoint.toString(),
    listingSize: posts.length,
    records: picked,
    sort,
    subreddit,
    timeWindow,
  };
}
