import { cleanText, splitCommaList } from "./utils.js";

interface OpenAiResponseContent {
  text?: string;
  type?: string;
}

interface OpenAiResponseOutputItem {
  content?: OpenAiResponseContent[];
  type?: string;
}

interface OpenAiResponsePayload {
  output?: OpenAiResponseOutputItem[];
  output_text?: string;
}

export interface PageAiEnrichment {
  contentType?: string;
  readingTimeMinutes?: number;
  summary: string;
  tags: string[];
}

export interface PageAiRequest {
  excerpt?: string;
  model?: string;
  text: string;
  title?: string;
  url: string;
}

const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";

export function hasOpenAiConfiguration(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim() && process.env.OPENAI_MODEL?.trim());
}

function resolveOpenAiOutput(payload: OpenAiResponsePayload): string {
  const topLevel = cleanText(payload.output_text);

  if (topLevel) {
    return topLevel;
  }

  const parts =
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .map((part) => cleanText(part.text))
      .filter((value): value is string => Boolean(value)) ?? [];

  if (parts.length === 0) {
    throw new Error("OpenAI returned no text output.");
  }

  return parts.join("\n");
}

function parseAiJson(text: string): PageAiEnrichment {
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const summary = cleanText(typeof parsed.summary === "string" ? parsed.summary : undefined);

  if (!summary) {
    throw new Error("OpenAI enrichment response did not include a usable summary.");
  }

  const tags = Array.isArray(parsed.tags)
    ? parsed.tags
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    : splitCommaList(typeof parsed.tags === "string" ? parsed.tags : undefined);

  return {
    contentType:
      typeof parsed.contentType === "string" ? cleanText(parsed.contentType) : undefined,
    readingTimeMinutes:
      typeof parsed.readingTimeMinutes === "number"
        ? parsed.readingTimeMinutes
        : undefined,
    summary,
    tags,
  };
}

export async function enrichPageWithOpenAi(
  request: PageAiRequest,
): Promise<PageAiEnrichment> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = request.model?.trim() || process.env.OPENAI_MODEL?.trim();

  if (!apiKey || !model) {
    throw new Error(
      "AI enrichment requires OPENAI_API_KEY and OPENAI_MODEL to be configured.",
    );
  }

  const baseUrl = (process.env.OPENAI_BASE_URL?.trim() || DEFAULT_OPENAI_BASE_URL).replace(
    /\/+$/u,
    "",
  );

  const response = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "You are helping an open-source scraping toolkit normalise web pages.",
                "Return strict JSON with keys summary, tags, contentType, readingTimeMinutes.",
                "Summary must be under 90 words.",
                "Tags must be an array of up to 6 short lowercase tags.",
                "contentType should be a short label such as article, report, announcement, reference, or blog.",
                "readingTimeMinutes should be a whole number estimate.",
              ].join(" "),
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                excerpt: request.excerpt ?? "",
                text: request.text,
                title: request.title ?? "",
                url: request.url,
              }),
            },
          ],
        },
      ],
      temperature: 0.2,
      text: {
        format: {
          type: "text",
        },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `OpenAI request failed with ${response.status} ${response.statusText}: ${body.slice(0, 200)}`,
    );
  }

  const payload = (await response.json()) as OpenAiResponsePayload;
  return parseAiJson(resolveOpenAiOutput(payload));
}
