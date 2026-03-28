import assert from "node:assert/strict";
import { test } from "node:test";

import { fetchRandomSubredditImageRecords } from "../src/core/reddit.js";
import type { ScraperContext } from "../src/core/types.js";

const sampleContext: ScraperContext = {
  limit: 1,
  now: new Date("2026-03-28T12:00:00.000Z"),
  outputDir: "output",
  params: {},
  userAgent: "OpenScrapersTest/0.3.0",
};

test("fetchRandomSubredditImageRecords filters posts to images and respects the NSFW flag", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCount = 0;

  globalThis.fetch = async (input, init) => {
    fetchCount += 1;
    const url = String(input);

    if (url.includes("/api/v1/access_token")) {
      return new Response(
        JSON.stringify({
          access_token: "reddit-access-token",
          token_type: "bearer",
        }),
        {
          headers: {
            "content-type": "application/json",
          },
          status: 200,
        },
      );
    }

    assert.match(String(init?.headers instanceof Headers ? init.headers.get("authorization") : ""), /Bearer/);

    return new Response(
      JSON.stringify({
        data: {
          children: [
            {
              data: {
                author: "safe-user",
                created_utc: 1_742_000_000,
                id: "safe-post",
                name: "t3_safe",
                over_18: false,
                permalink: "/r/pics/comments/safe-post",
                post_hint: "image",
                subreddit: "pics",
                title: "Safe image",
                url_overridden_by_dest: "https://i.redd.it/safe-image.jpg",
              },
            },
            {
              data: {
                author: "nsfw-user",
                created_utc: 1_742_000_100,
                id: "nsfw-post",
                name: "t3_nsfw",
                over_18: true,
                permalink: "/r/pics/comments/nsfw-post",
                post_hint: "image",
                subreddit: "pics",
                title: "NSFW image",
                url_overridden_by_dest: "https://i.redd.it/nsfw-image.jpg",
              },
            },
            {
              data: {
                author: "text-user",
                created_utc: 1_742_000_200,
                id: "text-post",
                name: "t3_text",
                over_18: false,
                post_hint: "self",
                subreddit: "pics",
                title: "Text post",
              },
            },
          ],
        },
      }),
      {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      },
    );
  };

  process.env.REDDIT_CLIENT_ID = "client-id";
  process.env.REDDIT_CLIENT_SECRET = "client-secret";

  try {
    const result = await fetchRandomSubredditImageRecords(sampleContext, {
      random: () => 0,
      subreddit: "pics",
    });

    assert.equal(fetchCount, 2);
    assert.equal(result.records.length, 1);
    assert.equal(result.records[0]?.title, "Safe image");
    assert.equal((result.records[0]?.metadata as { nsfw?: boolean } | undefined)?.nsfw, false);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.REDDIT_CLIENT_ID;
    delete process.env.REDDIT_CLIENT_SECRET;
  }
});
