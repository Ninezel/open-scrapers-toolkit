import { fetchJson } from "../core/http.js";
import type {
  ScrapedRecord,
  ScrapeResult,
  ScraperDefinition,
} from "../core/types.js";
import { buildStableId, take, toIsoDate } from "../core/utils.js";

interface OpenMeteoResponse {
  latitude?: number;
  longitude?: number;
  timezone?: string;
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    apparent_temperature?: number[];
    precipitation_probability?: number[];
    wind_speed_10m?: number[];
  };
}

const defaultLatitude = process.env.DEFAULT_WEATHER_LATITUDE ?? "51.5072";
const defaultLongitude = process.env.DEFAULT_WEATHER_LONGITUDE ?? "-0.1276";
const defaultLabel = process.env.DEFAULT_WEATHER_LABEL ?? "London";

const scraper: ScraperDefinition = {
  id: "open-meteo-city-forecast",
  name: "Open-Meteo City Forecast",
  category: "weather",
  description: "Forecast snapshot from the Open-Meteo public API.",
  homepage: "https://open-meteo.com/en/docs",
  sourceName: "Open-Meteo",
  defaults: {
    latitude: defaultLatitude,
    longitude: defaultLongitude,
    label: defaultLabel,
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
  async run(context): Promise<ScrapeResult> {
    const endpoint = new URL("https://api.open-meteo.com/v1/forecast");
    endpoint.searchParams.set("latitude", context.params.latitude);
    endpoint.searchParams.set("longitude", context.params.longitude);
    endpoint.searchParams.set("timezone", context.params.timezone);
    endpoint.searchParams.set("forecast_days", context.params.days);
    endpoint.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,wind_speed_10m",
    );
    endpoint.searchParams.set(
      "hourly",
      "temperature_2m,apparent_temperature,precipitation_probability,wind_speed_10m",
    );

    const response = await fetchJson<OpenMeteoResponse>(context, endpoint.toString(), {
      headers: {
        accept: "application/json",
      },
    });

    const label = context.params.label;
    const times = response.hourly?.time ?? [];
    const temperatures = response.hourly?.temperature_2m ?? [];
    const apparentTemperatures = response.hourly?.apparent_temperature ?? [];
    const precipitationProbabilities =
      response.hourly?.precipitation_probability ?? [];
    const windSpeeds = response.hourly?.wind_speed_10m ?? [];

    const records = take(times, context.limit).map<ScrapedRecord>((time, index) => ({
      id: buildStableId("open-meteo-city-forecast", label, time),
      source: "Open-Meteo",
      title: `Forecast for ${label} at ${time}`,
      summary: `${temperatures[index] ?? "n/a"} C, feels like ${apparentTemperatures[index] ?? "n/a"} C, precipitation probability ${precipitationProbabilities[index] ?? "n/a"}%, wind ${windSpeeds[index] ?? "n/a"} km/h.`,
      publishedAt: toIsoDate(time),
      location: label,
      tags: ["weather", "forecast", response.timezone ?? "timezone-unknown"],
      metadata: {
        latitude: response.latitude,
        longitude: response.longitude,
        apparentTemperature: apparentTemperatures[index],
        precipitationProbability: precipitationProbabilities[index],
        windSpeed10m: windSpeeds[index],
      },
    }));

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
        current: response.current,
      },
    };
  },
};

export default scraper;
