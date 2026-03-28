import { fetchRandomSubredditImageRecords } from "../core/reddit.js";
import type { ScrapeResult, ScraperDefinition } from "../core/types.js";
import { parseBoolean } from "../core/utils.js";

const scraper: ScraperDefinition = {
  id: "reddit-random-subreddit-image",
  name: "Reddit Random Subreddit Image",
  category: "news",
  description:
    "Random image posts from a subreddit using Reddit's OAuth-protected data API. Best suited for Discord bots and community update commands.",
  homepage: "https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki",
  sourceName: "Reddit",
  defaults: {
    allowNsfw: "false",
    sampleSize: "25",
    sort: "hot",
    timeWindow: "day",
  },
  params: [
    {
      key: "subreddit",
      description: "Subreddit name without the leading r/.",
      example: "wallpapers",
      required: true,
    },
    {
      key: "sort",
      description: "Subreddit listing to sample from.",
      example: "top",
    },
    {
      key: "timeWindow",
      description: "Time window for top posts.",
      example: "week",
    },
    {
      key: "allowNsfw",
      description: "Set to true only when your bot has an explicit NSFW-safe channel workflow.",
      example: "false",
    },
    {
      key: "sampleSize",
      description: "How many posts to sample before choosing a random image.",
      example: "50",
    },
  ],
  async run(context): Promise<ScrapeResult> {
    const subreddit = context.params.subreddit?.trim();

    if (!subreddit) {
      throw new Error("The reddit-random-subreddit-image scraper requires --param subreddit=<name>.");
    }

    const fetched = await fetchRandomSubredditImageRecords(context, {
      allowNsfw: parseBoolean(context.params.allowNsfw, false),
      category: scraper.category,
      sampleSize: context.params.sampleSize,
      sort: context.params.sort,
      sourceName: scraper.sourceName,
      subreddit,
      timeWindow: context.params.timeWindow,
    });

    return {
      scraperId: scraper.id,
      scraperName: scraper.name,
      category: scraper.category,
      source: scraper.sourceName ?? "Reddit",
      fetchedAt: context.now.toISOString(),
      records: fetched.records,
      meta: {
        endpoint: fetched.endpoint,
        listingSize: fetched.listingSize,
        sort: fetched.sort,
        subreddit: fetched.subreddit,
        timeWindow: fetched.timeWindow,
      },
    };
  },
};

export default scraper;
