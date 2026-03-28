import assert from "node:assert/strict";
import { test } from "node:test";

import {
  recordToDiscordEmbed,
  resultToDiscordMessages,
} from "../src/integrations/discord.js";
import type { ScrapeResult } from "../src/core/types.js";

const sampleResult: ScrapeResult = {
  scraperId: "bbc-world-news",
  scraperName: "BBC World News",
  category: "news",
  source: "BBC News",
  fetchedAt: "2026-03-28T12:30:00.000Z",
  records: [
    {
      id: "bbc-1",
      source: "BBC News",
      title: "Sample headline one",
      url: "https://example.com/1",
      summary: "This is the first sample summary for Discord formatting.",
      publishedAt: "2026-03-28T10:00:00.000Z",
      authors: ["Example Reporter"],
      tags: ["world", "headline"],
      location: "London",
      metadata: {
        language: "en",
      },
    },
    {
      id: "bbc-2",
      source: "BBC News",
      title: "Sample headline two",
      url: "https://example.com/2",
      summary: "This is the second sample summary for Discord formatting.",
      publishedAt: "2026-03-28T11:00:00.000Z",
    },
  ],
};

test("recordToDiscordEmbed keeps the key record fields readable", () => {
  const embed = recordToDiscordEmbed(sampleResult, sampleResult.records[0]!, {
    includeMetadata: true,
    titlePrefix: "[News]",
  });

  assert.equal(embed.title, "[News] Sample headline one");
  assert.equal(embed.url, "https://example.com/1");
  assert.equal(embed.footer?.text, "BBC World News • BBC News");
  assert.ok(embed.fields?.some((field) => field.name === "Published"));
  assert.ok(embed.fields?.some((field) => field.name === "Metadata"));
});

test("resultToDiscordMessages chunks embeds and includes a summary message", () => {
  const messages = resultToDiscordMessages(sampleResult, {
    maxEmbedsPerMessage: 1,
    maxRecords: 2,
  });

  assert.equal(messages.length, 2);
  assert.match(messages[0]?.content ?? "", /BBC World News/);
  assert.equal(messages[0]?.embeds.length, 1);
  assert.equal(messages[1]?.embeds.length, 1);
});

test("resultToDiscordMessages returns a readable empty-state payload", () => {
  const messages = resultToDiscordMessages(
    {
      ...sampleResult,
      records: [],
    },
    {},
  );

  assert.equal(messages.length, 1);
  assert.match(messages[0]?.content ?? "", /returned no records/);
  assert.equal(messages[0]?.embeds.length, 0);
});
