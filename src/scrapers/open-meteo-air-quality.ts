import { fetchJson } from "../core/http.js";
import type { ScrapedRecord, ScrapeResult, ScraperDefinition } from "../core/types.js";
import { buildStableId, take, toIsoDate } from "../core/utils.js";

interface OpenMeteoAirQualityResponse {
  hourly?: {
    pm10?: number[];
    pm2_5?: number[];
    time?: string[];
    us_aqi?: number[];
    uv_index?: number[];
  };
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

const defaultLatitude = process.env.DEFAULT_WEATHER_LATITUDE ?? "51.5072";
const defaultLongitude = process.env.DEFAULT_WEATHER_LONGITUDE ?? "-0.1276";
const defaultLabel = process.env.DEFAULT_WEATHER_LABEL ?? "London";

function resolveStartIndex(times: string[], currentTime: Date): number {
  const referenceMs = currentTime.getTime();
  const match = times.findIndex((time) => {
    const parsed = toIsoDate(time);
    return parsed ? new Date(parsed).getTime() >= referenceMs : false;
  });

  return match >= 0 ? match : 0;
}

const scraper: ScraperDefinition = {
  id: "open-meteo-air-quality",
  name: "Open-Meteo Air Quality",
  category: "weather",
  description: "Air-quality and UV forecast snapshots from the Open-Meteo air-quality API.",
  homepage: "https://open-meteo.com/en/docs/air-quality-api",
  sourceName: "Open-Meteo",
  defaults: {
    latitude: defaultLatitude,
    longitude: defaultLongitude,
    label: defaultLabel,
    timezone: "auto",
  },
  params: [
    {
      key: "latitude",
      description: "Latitude for the air-quality request.",
      example: "51.5072",
    },
    {
      key: "longitude",
      description: "Longitude for the air-quality request.",
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
  ],
  async run(context): Promise<ScrapeResult> {
    const endpoint = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
    endpoint.searchParams.set("latitude", context.params.latitude);
    endpoint.searchParams.set("longitude", context.params.longitude);
    endpoint.searchParams.set("timezone", context.params.timezone);
    endpoint.searchParams.set("hourly", "pm10,pm2_5,us_aqi,uv_index");

    const response = await fetchJson<OpenMeteoAirQualityResponse>(context, endpoint.toString(), {
      headers: {
        accept: "application/json",
      },
    });

    const label = context.params.label;
    const times = response.hourly?.time ?? [];
    const pm10 = response.hourly?.pm10 ?? [];
    const pm25 = response.hourly?.pm2_5 ?? [];
    const usAqi = response.hourly?.us_aqi ?? [];
    const uvIndex = response.hourly?.uv_index ?? [];
    const startIndex = resolveStartIndex(times, context.now);

    const records = take(times.slice(startIndex), context.limit).map<ScrapedRecord>((time, index) => {
      const sourceIndex = startIndex + index;

      return {
        id: buildStableId(scraper.id, label, time),
        source: "Open-Meteo",
        title: `Air quality for ${label} at ${time}`,
        summary: `US AQI ${usAqi[sourceIndex] ?? "n/a"}, PM2.5 ${pm25[sourceIndex] ?? "n/a"} ug/m3, PM10 ${pm10[sourceIndex] ?? "n/a"} ug/m3, UV index ${uvIndex[sourceIndex] ?? "n/a"}.`,
        publishedAt: toIsoDate(time),
        location: label,
        tags: ["weather", "air-quality", response.timezone ?? "timezone-unknown"],
        metadata: {
          latitude: response.latitude,
          longitude: response.longitude,
          pm10: pm10[sourceIndex],
          pm25: pm25[sourceIndex],
          timezone: response.timezone,
          usAqi: usAqi[sourceIndex],
          uvIndex: uvIndex[sourceIndex],
        },
      };
    });

    return {
      scraperId: scraper.id,
      scraperName: scraper.name,
      category: scraper.category,
      source: "Open-Meteo",
      fetchedAt: context.now.toISOString(),
      records,
      meta: {
        endpoint: endpoint.toString(),
        label,
      },
    };
  },
};

export default scraper;
