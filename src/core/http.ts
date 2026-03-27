import type { ScraperContext } from "./types.js";

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

export async function fetchText(
  context: ScraperContext,
  url: string,
  init?: RequestInit,
): Promise<string> {
  const response = await fetch(url, {
    ...init,
    headers: mergeHeaders(context, init?.headers),
  });

  return handleResponse(response, (currentResponse) => currentResponse.text());
}

export async function fetchJson<T>(
  context: ScraperContext,
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: mergeHeaders(context, init?.headers),
  });

  return handleResponse(
    response,
    (currentResponse) => currentResponse.json() as Promise<T>,
  );
}
