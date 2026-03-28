import { fetchJson } from "../core/http.js";
import { describeOpenMeteoWeather } from "../core/weather.js";
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
    apparent_temperature?: number;
    is_day?: number;
    relative_humidity_2m?: number;
    time?: string;
    temperature_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    sunrise?: string[];
    sunset?: string[];
  };
  hourly?: {
    apparent_temperature?: number[];
    relative_humidity_2m?: number[];
    time?: string[];
    temperature_2m?: number[];
    precipitation_probability?: number[];
    weather_code?: number[];
    wind_speed_10m?: number[];
  };
}

const defaultLatitude = process.env.DEFAULT_WEATHER_LATITUDE ?? "51.5072";
const defaultLongitude = process.env.DEFAULT_WEATHER_LONGITUDE ?? "-0.1276";
const defaultLabel = process.env.DEFAULT_WEATHER_LABEL ?? "London";

function resolveStartIndex(times: string[], currentTime: string | undefined): number {
  const reference = toIsoDate(currentTime);

  if (!reference) {
    return 0;
  }

  const referenceMs = new Date(reference).getTime();
  const match = times.findIndex((time) => {
    const parsed = toIsoDate(time);
    return parsed ? new Date(parsed).getTime() >= referenceMs : false;
  });

  return match >= 0 ? match : 0;
}

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
      "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,is_day",
    );
    endpoint.searchParams.set(
      "hourly",
      "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,wind_speed_10m,weather_code",
    );
    endpoint.searchParams.set("daily", "sunrise,sunset");

    const response = await fetchJson<OpenMeteoResponse>(context, endpoint.toString(), {
      headers: {
        accept: "application/json",
      },
    });

    const label = context.params.label;
    const times = response.hourly?.time ?? [];
    const temperatures = response.hourly?.temperature_2m ?? [];
    const apparentTemperatures = response.hourly?.apparent_temperature ?? [];
    const relativeHumidity = response.hourly?.relative_humidity_2m ?? [];
    const precipitationProbabilities =
      response.hourly?.precipitation_probability ?? [];
    const weatherCodes = response.hourly?.weather_code ?? [];
    const windSpeeds = response.hourly?.wind_speed_10m ?? [];
    const sunrise = response.daily?.sunrise?.[0];
    const sunset = response.daily?.sunset?.[0];
    const startIndex = resolveStartIndex(times, response.current?.time);

    const records = take(times.slice(startIndex), context.limit).map<ScrapedRecord>((time, index) => {
      const sourceIndex = startIndex + index;

      return {
        id: buildStableId("open-meteo-city-forecast", label, time),
        source: "Open-Meteo",
        title: `Forecast for ${label} at ${time}`,
        summary: `${describeOpenMeteoWeather(weatherCodes[sourceIndex], response.current?.is_day !== 0).label}, ${temperatures[sourceIndex] ?? "n/a"} C, feels like ${apparentTemperatures[sourceIndex] ?? "n/a"} C, humidity ${relativeHumidity[sourceIndex] ?? response.current?.relative_humidity_2m ?? "n/a"}%, precipitation probability ${precipitationProbabilities[sourceIndex] ?? "n/a"}%, wind ${windSpeeds[sourceIndex] ?? "n/a"} km/h.`,
        publishedAt: toIsoDate(time),
        location: label,
        tags: ["weather", "forecast", response.timezone ?? "timezone-unknown"],
        metadata: {
          apparentTemperature: apparentTemperatures[sourceIndex],
          currentApparentTemperature: response.current?.apparent_temperature,
          currentTemperature: response.current?.temperature_2m,
          currentTime: response.current?.time,
          currentWeatherCode: response.current?.weather_code,
          isDay: response.current?.is_day !== 0,
          latitude: response.latitude,
          longitude: response.longitude,
          precipitationProbability: precipitationProbabilities[sourceIndex],
          relativeHumidity:
            relativeHumidity[sourceIndex] ?? response.current?.relative_humidity_2m,
          sunrise,
          sunset,
          temperature: temperatures[sourceIndex],
          timezone: response.timezone,
          weatherCode: weatherCodes[sourceIndex],
          windSpeed10m: windSpeeds[sourceIndex],
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
        current: response.current,
        daily: response.daily,
        timezone: response.timezone,
      },
    };
  },
};

export default scraper;
