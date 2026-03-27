import { fetchJson } from "../core/http.js";
import type {
  ScrapedRecord,
  ScrapeResult,
  ScraperDefinition,
} from "../core/types.js";
import { buildStableId, cleanText, take, toIsoDate } from "../core/utils.js";

interface NwsFeature {
  id?: string;
  properties?: {
    id?: string;
    event?: string;
    severity?: string;
    areaDesc?: string;
    headline?: string | null;
    description?: string | null;
    instruction?: string | null;
    sent?: string;
    effective?: string;
    ends?: string | null;
    web?: string | null;
  };
}

interface NwsResponse {
  features?: NwsFeature[];
  title?: string;
}

const scraper: ScraperDefinition = {
  id: "nws-active-alerts",
  name: "NWS Active Alerts",
  category: "weather",
  description: "Active US weather alerts from the National Weather Service API.",
  homepage: "https://www.weather.gov/documentation/services-web-api",
  defaults: {
    area: "",
    event: "",
    severity: "",
  },
  params: [
    {
      key: "area",
      description: "Optional case-insensitive area filter applied locally.",
      example: "Texas",
    },
    {
      key: "event",
      description: "Optional case-insensitive event filter applied locally.",
      example: "Flood",
    },
    {
      key: "severity",
      description: "Optional case-insensitive severity filter applied locally.",
      example: "Severe",
    },
  ],
  async run(context): Promise<ScrapeResult> {
    const response = await fetchJson<NwsResponse>(
      context,
      "https://api.weather.gov/alerts/active",
      {
        headers: {
          accept: "application/geo+json",
        },
      },
    );

    const areaFilter = context.params.area.toLowerCase();
    const eventFilter = context.params.event.toLowerCase();
    const severityFilter = context.params.severity.toLowerCase();

    const filtered = (response.features ?? []).filter((feature) => {
      const area = feature.properties?.areaDesc?.toLowerCase() ?? "";
      const event = feature.properties?.event?.toLowerCase() ?? "";
      const severity = feature.properties?.severity?.toLowerCase() ?? "";

      return (
        (!areaFilter || area.includes(areaFilter)) &&
        (!eventFilter || event.includes(eventFilter)) &&
        (!severityFilter || severity.includes(severityFilter))
      );
    });

    const records = take(filtered, context.limit).map<ScrapedRecord>((feature) => ({
      id: buildStableId(
        "nws-active-alerts",
        feature.id,
        feature.properties?.id,
        feature.properties?.headline ?? feature.properties?.event,
      ),
      source: "National Weather Service",
      title: feature.properties?.headline ?? feature.properties?.event ?? "Untitled alert",
      url: feature.properties?.web ?? undefined,
      summary: cleanText(
        feature.properties?.description ?? feature.properties?.instruction ?? undefined,
      ),
      publishedAt:
        toIsoDate(feature.properties?.sent) ??
        toIsoDate(feature.properties?.effective) ??
        undefined,
      tags: [
        "weather",
        "alerts",
        ...(feature.properties?.severity ? [feature.properties.severity] : []),
      ],
      location: feature.properties?.areaDesc ?? undefined,
      metadata: {
        event: feature.properties?.event,
        severity: feature.properties?.severity,
        ends: feature.properties?.ends ?? undefined,
      },
    }));

    return {
      scraperId: scraper.id,
      scraperName: scraper.name,
      category: scraper.category,
      source: "National Weather Service",
      fetchedAt: context.now.toISOString(),
      records,
      meta: {
        endpoint: "https://api.weather.gov/alerts/active",
        totalAlerts: response.features?.length ?? 0,
      },
    };
  },
};

export default scraper;
