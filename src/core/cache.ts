import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import type { FetchTextResponse } from "./http.js";
import type { ScraperContext } from "./types.js";
import { buildStableId } from "./utils.js";

export const DEFAULT_CACHE_TTL_MS = 0;

interface CachedHttpPayload extends FetchTextResponse {
  cachedAt: string;
}

export function resolveCacheTtlMs(
  value = process.env.SCRAPERS_CACHE_TTL_MS,
): number {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_CACHE_TTL_MS;
  }

  return parsed;
}

function cacheDirectory(context: ScraperContext): string {
  return resolve(context.outputDir, ".cache", "http");
}

function cachePath(context: ScraperContext, url: string): string {
  return join(cacheDirectory(context), `${buildStableId(url, context.userAgent)}.json`);
}

export async function readHttpCache(
  context: ScraperContext,
  url: string,
): Promise<FetchTextResponse | undefined> {
  const ttlMs = context.cacheTtlMs ?? resolveCacheTtlMs();

  if (ttlMs <= 0) {
    return undefined;
  }

  const target = cachePath(context, url);

  try {
    const [fileInfo, payloadText] = await Promise.all([
      stat(target),
      readFile(target, "utf8"),
    ]);
    const ageMs = Date.now() - fileInfo.mtimeMs;

    if (ageMs > ttlMs) {
      return undefined;
    }

    const payload = JSON.parse(payloadText) as CachedHttpPayload;
    return {
      contentType: payload.contentType,
      finalUrl: payload.finalUrl,
      status: payload.status,
      text: payload.text,
    };
  } catch {
    return undefined;
  }
}

export async function writeHttpCache(
  context: ScraperContext,
  url: string,
  payload: FetchTextResponse,
): Promise<void> {
  const ttlMs = context.cacheTtlMs ?? resolveCacheTtlMs();

  if (ttlMs <= 0) {
    return;
  }

  const target = cachePath(context, url);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(
    target,
    `${JSON.stringify(
      {
        ...payload,
        cachedAt: new Date().toISOString(),
      } satisfies CachedHttpPayload,
      null,
      2,
    )}\n`,
    "utf8",
  );
}
