import type { ScraperContext } from "./types.js";

export const DEFAULT_HTTP_TIMEOUT_MS = 30_000;

export interface FetchTextResponse {
  contentType: string;
  finalUrl: string;
  status: number;
  text: string;
}

export function resolveHttpTimeoutMs(
  value = process.env.SCRAPERS_HTTP_TIMEOUT_MS,
): number {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_HTTP_TIMEOUT_MS;
  }

  return parsed;
}

function mergeHeaders(
  context: ScraperContext,
  headers: HeadersInit | undefined,
): Headers {
  const merged = new Headers(headers);

  if (!merged.has("user-agent")) {
    merged.set("user-agent", context.userAgent);
  }

  if (!merged.has("accept")) {
    merged.set("accept", "*/*");
  }

  return merged;
}

async function handleResponse<T>(
  response: Response,
  parser: (response: Response) => Promise<T>,
): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Request failed with ${response.status} ${response.statusText}: ${body.slice(0, 200)}`,
    );
  }

  return parser(response);
}

async function performRequest(
  context: ScraperContext,
  url: string,
  init: RequestInit | undefined,
): Promise<Response> {
  const timeoutMs = resolveHttpTimeoutMs();

  try {
    return await fetch(url, {
      ...init,
      headers: mergeHeaders(context, init?.headers),
      signal: init?.signal ?? AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TimeoutError") {
        throw new Error(`Request timed out after ${timeoutMs}ms for ${url}`);
      }

      if (error.name === "AbortError") {
        throw new Error(`Request was aborted for ${url}`);
      }

      throw new Error(`Request failed for ${url}: ${error.message}`);
    }

    throw new Error(`Request failed for ${url}: ${String(error)}`);
  }
}

export async function fetchText(
  context: ScraperContext,
  url: string,
  init?: RequestInit,
): Promise<string> {
  const response = await fetchTextResponse(context, url, init);
  return response.text;
}

export async function fetchTextResponse(
  context: ScraperContext,
  url: string,
  init?: RequestInit,
): Promise<FetchTextResponse> {
  const response = await performRequest(context, url, init);
  return handleResponse(response, async (currentResponse) => ({
    contentType: currentResponse.headers.get("content-type") ?? "",
    finalUrl: currentResponse.url || url,
    status: currentResponse.status,
    text: await currentResponse.text(),
  }));
}

export async function fetchJson<T>(
  context: ScraperContext,
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await performRequest(context, url, init);

  return handleResponse(
    response,
    (currentResponse) => currentResponse.json() as Promise<T>,
  );
}
