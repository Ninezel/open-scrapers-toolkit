import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveScraperPrompt, runScraperPrompt } from "../src/prompt-router.js";

const stubLocationResolver = async (query: string) => ({
  label: query === "London" ? "London, England, United Kingdom" : query,
  latitude: "51.5072",
  longitude: "-0.1276",
  timezone: "Europe/London",
});

test("resolveScraperPrompt routes weather questions through Open-Meteo", async () => {
  const resolution = await resolveScraperPrompt("What is the weather in London?", {
    locationResolver: stubLocationResolver,
  });

  assert.equal(resolution.scraperId, "open-meteo-city-forecast");
  assert.equal(resolution.category, "weather");
  assert.equal(resolution.renderStyle, "weather-card");
  assert.equal(resolution.params.label, "London, England, United Kingdom");
});

test("resolveScraperPrompt routes health research to Europe PMC", async () => {
  const resolution = await resolveScraperPrompt(
    "Give me academic records on maternal health",
  );

  assert.equal(resolution.scraperId, "europepmc-academic-search");
  assert.equal(resolution.params.query, "maternal health");
});

test("resolveScraperPrompt routes broad academic questions to Crossref", async () => {
  const resolution = await resolveScraperPrompt(
    "Give me academic records of Vatican Church",
  );

  assert.equal(resolution.scraperId, "crossref-academic-search");
  assert.equal(resolution.params.query, "Vatican Church");
});

test("resolveScraperPrompt can fall back to a catalogue match", async () => {
  const resolution = await resolveScraperPrompt("Show me BBC science news");

  assert.equal(resolution.scraperId, "bbc-science-environment-news");
  assert.equal(resolution.intent, "catalogue-match");
});

test("runScraperPrompt returns both the routing decision and the scraper result", async () => {
  const execution = await runScraperPrompt("Show me BBC world news", {
    limit: 1,
  });

  assert.equal(execution.resolution.scraperId, "bbc-world-news");
  assert.equal(execution.result.scraperId, "bbc-world-news");
  assert.ok(execution.result.records.length <= 1);
});
