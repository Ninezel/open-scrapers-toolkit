import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const TSX_CLI = join(ROOT, "node_modules", "tsx", "dist", "cli.mjs");

function runCli(args: string[]): string {
  return execFileSync(process.execPath, [TSX_CLI, "src/cli.ts", ...args], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
}

test("list supports category and search filters in json mode", () => {
  const output = runCli(["list", "--category", "weather", "--search", "forecast", "--format", "json"]);
  const payload = JSON.parse(output) as Array<{ id: string; category: string }>;

  assert.deepEqual(payload, [
    {
      id: "open-meteo-city-forecast",
      category: "weather",
      name: "Open-Meteo City Forecast",
      description: "Forecast snapshot from the Open-Meteo public API.",
      homepage: "https://open-meteo.com/en/docs",
      sourceName: "Open-Meteo",
      defaults: {
        latitude: process.env.DEFAULT_WEATHER_LATITUDE ?? "51.5072",
        longitude: process.env.DEFAULT_WEATHER_LONGITUDE ?? "-0.1276",
        label: process.env.DEFAULT_WEATHER_LABEL ?? "London",
        timezone: "auto",
        days: "2",
      },
      params: [
        {
          key: "latitude",
          description: "Latitude for the forecast request.",
          example: "51.5072",
        },
        {
          key: "longitude",
          description: "Longitude for the forecast request.",
          example: "-0.1276",
        },
        {
          key: "label",
          description: "Human-friendly place name used in titles.",
          example: "London",
        },
        {
          key: "timezone",
          description: "Open-Meteo timezone parameter.",
          example: "Europe/London",
        },
        {
          key: "days",
          description: "Forecast days to request from the API.",
          example: "3",
        },
      ],
    },
  ]);
});

test("describe prints machine-readable scraper metadata", () => {
  const output = runCli(["describe", "nws-active-alerts", "--format", "json"]);
  const payload = JSON.parse(output) as {
    id: string;
    sourceName?: string;
    defaults: Record<string, string>;
    params: Array<{ key: string }>;
  };

  assert.equal(payload.id, "nws-active-alerts");
  assert.equal(payload.sourceName, "National Weather Service");
  assert.equal(payload.defaults.area, "");
  assert.ok(payload.params.some((parameter) => parameter.key === "severity"));
});
