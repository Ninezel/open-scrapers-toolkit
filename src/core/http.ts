import { readHttpCache, writeHttpCache } from "./cache.js";
import type { ScraperContext } from "./types.js";

export const DEFAULT_HTTP_TIMEOUT_MS = 30_000;
export const DEFAULT_HTTP_RETRY_COUNT = 1;
export const DEFAULT_HTTP_RETRY_DELAY_MS = 750;

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

export function resolveHttpRetryCount(
  value = process.env.SCRAPERS_HTTP_RETRIES,
): number {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_HTTP_RETRY_COUNT;
  }

  return parsed;
}

export function resolveHttpRetryDelayMs(
  value = process.env.SCRAPERS_HTTP_RETRY_DELAY_MS,
): number {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_HTTP_RETRY_DELAY_MS;
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

function shouldRetryStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function shouldRetryError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.name === "AbortError" || error.name === "TimeoutError" || error.name === "TypeError";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeRequestError(error: unknown, url: string, timeoutMs: number): Error {
  if (error instanceof Error) {
    if (error.name === "TimeoutError") {
      return new Error(`Request timed out after ${timeoutMs}ms for ${url}`);
    }

    if (error.name === "AbortError") {
      return new Error(`Request was aborted for ${url}`);
    }

    return new Error(`Request failed for ${url}: ${error.message}`);
  }

  return new Error(`Request failed for ${url}: ${String(error)}`);
}

async function performRequest(
  context: ScraperContext,
  url: string,
  init: RequestInit | undefined,
): Promise<FetchTextResponse> {
  const timeoutMs = resolveHttpTimeoutMs();
  const retryCount = context.retryCount ?? resolveHttpRetryCount();
  const retryDelayMs = context.retryDelayMs ?? resolveHttpRetryDelayMs();
  const method = (init?.method ?? "GET").toUpperCase();
  let attempt = 0;

  while (true) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: mergeHeaders(context, init?.headers),
        signal: init?.signal ?? AbortSignal.timeout(timeoutMs),
      });
      const text = await response.text();

      if (!response.ok) {
        const error = new Error(
          `Request failed with ${response.status} ${response.statusText}: ${text.slice(0, 200)}`,
        );

        if (method === "GET" && attempt < retryCount && shouldRetryStatus(response.status)) {
          attempt += 1;
          await delay(retryDelayMs * attempt);
          continue;
        }

        throw error;
      }

      return {
        contentType: response.headers.get("content-type") ?? "",
        finalUrl: response.url || url,
        status: response.status,
        text,
      };
    } catch (error) {
      if (method === "GET" && attempt < retryCount && shouldRetryError(error)) {
        attempt += 1;
        await delay(retryDelayMs * attempt);
        continue;
      }

      throw normalizeRequestError(error, url, timeoutMs);
    }
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
  const method = (init?.method ?? "GET").toUpperCase();

  if (method === "GET") {
    const cached = await readHttpCache(context, url);

    if (cached) {
      return cached;
    }
  }

  const response = await performRequest(context, url, init);

  if (method === "GET") {
    await writeHttpCache(context, url, response);
  }

  return response;
}

export async function fetchJson<T>(
  context: ScraperContext,
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetchTextResponse(context, url, init);

  try {
    return JSON.parse(response.text) as T;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not parse JSON response from ${url}: ${detail}`);
  }
}
