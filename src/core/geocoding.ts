import { fetchJson } from "./http.js";
import type { ScraperContext } from "./types.js";
import { uniqueStrings } from "./utils.js";

interface OpenMeteoGeocodingResult {
  admin1?: string;
  country?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  timezone?: string;
}

interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[];
}

export interface GeocodedLocation {
  country?: string;
  countryCode?: string;
  label: string;
  latitude: string;
  longitude: string;
  timezone?: string;
}

function formatLocationLabel(result: OpenMeteoGeocodingResult): string {
  const parts = uniqueStrings(
    [result.name, result.admin1, result.country].filter(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    ),
  );

  return parts.join(", ");
}

/**
 * Resolves a place name through the Open-Meteo geocoding API so prompt-driven
 * weather helpers can turn natural-language locations into scraper params.
 */
export async function resolveOpenMeteoLocation(
  context: ScraperContext,
  query: string,
): Promise<GeocodedLocation | undefined> {
  const trimmed = query.trim();

  if (!trimmed) {
    return undefined;
  }

  const endpoint = new URL("https://geocoding-api.open-meteo.com/v1/search");
  endpoint.searchParams.set("name", trimmed);
  endpoint.searchParams.set("count", "1");
  endpoint.searchParams.set("language", "en");
  endpoint.searchParams.set("format", "json");

  const response = await fetchJson<OpenMeteoGeocodingResponse>(
    context,
    endpoint.toString(),
    {
      headers: {
        accept: "application/json",
      },
    },
  );
  const match = response.results?.[0];

  if (
    !match ||
    typeof match.latitude !== "number" ||
    typeof match.longitude !== "number" ||
    !Number.isFinite(match.latitude) ||
    !Number.isFinite(match.longitude)
  ) {
    return undefined;
  }

  return {
    country: match.country,
    countryCode: match.country_code,
    label: formatLocationLabel(match) || trimmed,
    latitude: String(match.latitude),
    longitude: String(match.longitude),
    timezone: match.timezone,
  };
}
