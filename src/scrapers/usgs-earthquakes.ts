import { fetchJson } from "../core/http.js";
import type {
  ScrapedRecord,
  ScrapeResult,
  ScraperDefinition,
} from "../core/types.js";
import { buildStableId, take } from "../core/utils.js";

interface UsgsFeature {
  id?: string;
  properties?: {
    mag?: number | null;
    place?: string;
    time?: number;
    updated?: number;
    url?: string;
    title?: string;
    tsunami?: number;
    felt?: number | null;
    sig?: number;
  };
  geometry?: {
    coordinates?: number[];
  };
}

interface UsgsResponse {
  features?: UsgsFeature[];
  metadata?: {
    title?: string;
    generated?: number;
  };
}

const scraper: ScraperDefinition = {
  id: "usgs-earthquakes",
  name: "USGS Earthquakes",
  category: "reports",
  description: "Recent earthquake events from the USGS GeoJSON feed.",
  homepage: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php",
  sourceName: "USGS Earthquake Hazards Program",
  defaults: {
    minimumMagnitude: "0",
    place: "",
  },
  params: [
    {
      key: "minimumMagnitude",
      description: "Client-side minimum magnitude filter.",
      example: "4.5",
    },
    {
      key: "place",
      description: "Client-side place substring filter.",
      example: "California",
    },
  ],
  async run(context): Promise<ScrapeResult> {
    const endpoint =
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
    const response = await fetchJson<UsgsResponse>(context, endpoint, {
      headers: {
        accept: "application/geo+json, application/json",
      },
    });

    const minimumMagnitude = Number.parseFloat(context.params.minimumMagnitude);
    const placeFilter = context.params.place.toLowerCase();

    const filtered = (response.features ?? []).filter((feature) => {
      const magnitude = feature.properties?.mag ?? -Infinity;
      const place = feature.properties?.place?.toLowerCase() ?? "";

      return (
        (Number.isNaN(minimumMagnitude) || magnitude >= minimumMagnitude) &&
        (!placeFilter || place.includes(placeFilter))
      );
    });

    const records = take(filtered, context.limit).map<ScrapedRecord>((feature) => ({
      id: buildStableId("usgs-earthquakes", feature.id, feature.properties?.title),
      source: "USGS Earthquake Hazards Program",
      title: feature.properties?.title ?? "Untitled earthquake event",
      url: feature.properties?.url ?? undefined,
      summary: `Magnitude ${feature.properties?.mag ?? "n/a"} earthquake reported near ${feature.properties?.place ?? "unknown location"}.`,
      publishedAt:
        typeof feature.properties?.time === "number"
          ? new Date(feature.properties.time).toISOString()
          : undefined,
      location: feature.properties?.place ?? undefined,
      tags: ["earthquake", "geology", "hazards"],
      metadata: {
        magnitude: feature.properties?.mag,
        feltReports: feature.properties?.felt ?? undefined,
        significance: feature.properties?.sig,
        tsunami: feature.properties?.tsunami,
        coordinates: feature.geometry?.coordinates,
        updatedAt:
          typeof feature.properties?.updated === "number"
            ? new Date(feature.properties.updated).toISOString()
            : undefined,
      },
    }));

    return {
      scraperId: scraper.id,
      scraperName: scraper.name,
      category: scraper.category,
      source: "USGS Earthquake Hazards Program",
      fetchedAt: context.now.toISOString(),
      records,
      meta: {
        endpoint,
        feedTitle: response.metadata?.title,
        generatedAt:
          typeof response.metadata?.generated === "number"
            ? new Date(response.metadata.generated).toISOString()
            : undefined,
      },
    };
  },
};

export default scraper;
