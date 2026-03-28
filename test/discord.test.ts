import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildDiscordScraperSlashCommandDefinition,
  buildDiscordChannelContext,
  buildDiscordScraperChoices,
  buildDiscordScheduleProfile,
  nextDiscordScheduledRunAt,
  parseDiscordChannelIdList,
  runScraperPromptToDiscordMessages,
  shouldRunDiscordSchedule,
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

const weatherResult: ScrapeResult = {
  scraperId: "open-meteo-city-forecast",
  scraperName: "Open-Meteo City Forecast",
  category: "weather",
  source: "Open-Meteo",
  fetchedAt: "2026-03-28T08:30:00.000Z",
  meta: {
    label: "London",
    timezone: "Europe/London",
  },
  records: [
    {
      id: "wx-1",
      source: "Open-Meteo",
      title: "Forecast for London at 2026-03-28T09:00",
      publishedAt: "2026-03-28T09:00:00.000Z",
      location: "London",
      metadata: {
        apparentTemperature: 7.9,
        isDay: true,
        precipitationProbability: 15,
        relativeHumidity: 91,
        sunrise: "2026-03-28T08:03:00.000Z",
        sunset: "2026-03-28T15:52:00.000Z",
        temperature: 9.8,
        timezone: "Europe/London",
        weatherCode: 2,
        windSpeed10m: 8.1,
      },
    },
    {
      id: "wx-2",
      source: "Open-Meteo",
      title: "Forecast for London at 2026-03-28T10:00",
      publishedAt: "2026-03-28T10:00:00.000Z",
      location: "London",
      metadata: {
        apparentTemperature: 8.4,
        isDay: true,
        precipitationProbability: 10,
        relativeHumidity: 84,
        sunrise: "2026-03-28T08:03:00.000Z",
        sunset: "2026-03-28T15:52:00.000Z",
        temperature: 10.1,
        timezone: "Europe/London",
        weatherCode: 1,
        windSpeed10m: 9.2,
      },
    },
    {
      id: "wx-3",
      source: "Open-Meteo",
      title: "Forecast for London at 2026-03-28T12:00",
      publishedAt: "2026-03-28T12:00:00.000Z",
      location: "London",
      metadata: {
        apparentTemperature: 10.4,
        isDay: true,
        precipitationProbability: 25,
        relativeHumidity: 75,
        sunrise: "2026-03-28T08:03:00.000Z",
        sunset: "2026-03-28T15:52:00.000Z",
        temperature: 12.3,
        timezone: "Europe/London",
        weatherCode: 3,
        windSpeed10m: 12.5,
      },
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

test("resultToDiscordMessages filters NSFW records unless the channel is explicitly allowed", () => {
  const result: ScrapeResult = {
    ...sampleResult,
    records: [
      {
        ...sampleResult.records[0]!,
        metadata: {
          imageUrl: "https://example.com/safe.jpg",
          nsfw: false,
        },
      },
      {
        ...sampleResult.records[1]!,
        title: "NSFW image post",
        metadata: {
          imageUrl: "https://example.com/nsfw.jpg",
          nsfw: true,
        },
      },
    ],
  };

  const messages = resultToDiscordMessages(result, {
    channel: {
      allowNsfw: false,
      isNsfw: false,
      name: "general",
    },
    includeImages: true,
  });

  assert.equal(messages.length, 1);
  assert.equal(messages[0]?.embeds.length, 1);
  assert.match(messages[0]?.content ?? "", /Filtered 1 unsafe record/);
});

test("resultToDiscordMessages renders weather cards with cadence-aware selection", () => {
  const messages = resultToDiscordMessages(weatherResult, {
    maxRecords: 2,
    style: "auto",
    weatherCadenceHours: 3,
  });

  assert.equal(messages.length, 1);
  assert.match(messages[0]?.content ?? "", /every 3 hours/);
  assert.equal(messages[0]?.embeds.length, 2);
  assert.match(messages[0]?.embeds[0]?.title ?? "", /Weather Update/);
  assert.ok(messages[0]?.embeds[0]?.fields?.some((field) => field.name === "Temperature"));
});

test("schedule helpers support hourly and three-hour runs", () => {
  const nextRun = nextDiscordScheduledRunAt(
    {
      intervalHours: 3,
    },
    new Date("2026-03-28T10:15:00.000Z"),
  );

  assert.equal(nextRun.toISOString(), "2026-03-28T12:00:00.000Z");
  assert.equal(
    shouldRunDiscordSchedule(
      "2026-03-28T09:00:00.000Z",
      {
        intervalHours: 1,
      },
      new Date("2026-03-28T09:45:00.000Z"),
    ),
    false,
  );
  assert.equal(
    shouldRunDiscordSchedule(
      "2026-03-28T09:00:00.000Z",
      {
        intervalHours: 1,
      },
      new Date("2026-03-28T10:00:00.000Z"),
    ),
    true,
  );
});

test("channel policy helpers only allow NSFW posts in validated NSFW channels", () => {
  const allowedChannel = buildDiscordChannelContext(
    {
      id: "123",
      name: "art-lounge",
      nsfw: true,
    },
    {
      nsfwEnabledChannelIds: ["123", "456"],
    },
  );
  const blockedChannel = buildDiscordChannelContext(
    {
      id: "999",
      name: "random",
      nsfw: true,
    },
    {
      nsfwEnabledChannelIds: ["123", "456"],
    },
  );

  assert.equal(allowedChannel.allowNsfw, true);
  assert.equal(blockedChannel.allowNsfw, false);
  assert.deepEqual(parseDiscordChannelIdList("123, 456, 123"), ["123", "456"]);
});

test("schedule profiles cover on-demand, hourly, and custom workflows", () => {
  const onDemand = buildDiscordScheduleProfile("on-demand");
  const hourly = buildDiscordScheduleProfile("hourly");
  const everyThreeHours = buildDiscordScheduleProfile("every-3-hours");
  const custom = buildDiscordScheduleProfile("custom", {
    intervalHours: 6,
    offsetMinutes: 15,
  });

  assert.equal(onDemand.schedule, undefined);
  assert.equal(onDemand.weatherCadenceHours, 1);
  assert.equal(hourly.schedule?.intervalHours, 1);
  assert.equal(everyThreeHours.schedule?.intervalHours, 3);
  assert.equal(custom.schedule?.intervalHours, 6);
  assert.equal(custom.schedule?.offsetMinutes, 15);
  assert.equal(custom.weatherCadenceHours, 6);
});

test("buildDiscordScraperChoices creates slash-command friendly choices", () => {
  const choices = buildDiscordScraperChoices({
    maxChoices: 5,
    search: "weather",
  });

  assert.ok(choices.length > 0);
  assert.ok(choices.length <= 5);
  assert.ok(choices.every((choice) => choice.name.length <= 100));
});

test("buildDiscordScraperSlashCommandDefinition returns a clean Discord API payload", () => {
  const command = buildDiscordScraperSlashCommandDefinition();

  assert.equal(command.name, "scraper");
  assert.equal(command.type, 1);
  assert.equal(command.options[0]?.name, "question");
  assert.equal(command.options[0]?.type, 3);
  assert.equal(command.options[1]?.name, "limit");
  assert.equal(command.options[1]?.type, 4);
});

test("runScraperPromptToDiscordMessages resolves a prompt and formats Discord payloads", async () => {
  const execution = await runScraperPromptToDiscordMessages("Show me BBC world news", {
    limit: 1,
  });

  assert.equal(execution.resolution.scraperId, "bbc-world-news");
  assert.equal(execution.messages.length, 1);
  assert.equal(execution.messages[0]?.embeds.length, 1);
});
