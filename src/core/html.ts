import { type Cheerio, type CheerioAPI, load } from "cheerio";
import type { AnyNode } from "domhandler";

import { cleanText, toIsoDate, truncateText } from "./utils.js";

export interface ExtractedPage {
  author?: string;
  description?: string;
  excerpt?: string;
  language?: string;
  publishedAt?: string;
  siteName?: string;
  text: string;
  title?: string;
  wordCount: number;
}

function readMetaContent(
  $: CheerioAPI,
  selectors: string[],
): string | undefined {
  for (const selector of selectors) {
    const value = cleanText($(selector).attr("content") ?? $(selector).attr("datetime"));

    if (value) {
      return value;
    }
  }

  return undefined;
}

function removeNoise($: CheerioAPI): void {
  $(
    [
      "script",
      "style",
      "noscript",
      "svg",
      "iframe",
      "canvas",
      "header nav",
      "footer",
      "aside",
      ".newsletter",
      ".subscribe",
      ".advertisement",
      ".ads",
      ".social-share",
      ".related",
      ".recommendations",
      "[aria-hidden='true']",
    ].join(", "),
  ).remove();
}

function collectTextBlocks(
  $: CheerioAPI,
  $root: Cheerio<AnyNode>,
): string[] {
  const blocks = $root
    .find("h1, h2, h3, p, li, blockquote")
    .toArray()
    .map((element) => cleanText($(element).text()))
    .filter((value): value is string => Boolean(value))
    .filter((value) => value.length >= 24);

  if (blocks.length > 0) {
    return blocks;
  }

  const bodyText = cleanText($root.text());
  return bodyText ? [bodyText] : [];
}

export function extractReadablePage(html: string): ExtractedPage {
  const $ = load(html);
  removeNoise($);

  const title =
    readMetaContent($, [
      "meta[property='og:title']",
      "meta[name='twitter:title']",
    ]) ?? cleanText($("title").first().text()) ?? cleanText($("h1").first().text());

  const description = readMetaContent($, [
    "meta[name='description']",
    "meta[property='og:description']",
    "meta[name='twitter:description']",
  ]);

  const siteName = readMetaContent($, [
    "meta[property='og:site_name']",
    "meta[name='application-name']",
  ]);

  const author = readMetaContent($, [
    "meta[name='author']",
    "meta[property='article:author']",
  ]);

  const publishedAt =
    toIsoDate(
      readMetaContent($, [
        "meta[property='article:published_time']",
        "meta[name='article:published_time']",
        "meta[name='publishdate']",
        "meta[name='pubdate']",
        "time[datetime]",
      ]),
    ) ??
    toIsoDate(cleanText($("time[datetime]").first().attr("datetime")));

  const language = $("html").attr("lang")?.trim();
  const root =
    $("article").first().length > 0
      ? $("article").first()
      : $("main").first().length > 0
        ? $("main").first()
        : $("body").first();
  const blocks = collectTextBlocks($, root);
  const text = blocks.join("\n\n").trim();
  const excerpt = description ?? truncateText(blocks.slice(0, 3).join(" "), 320);
  const wordCount = text ? text.split(/\s+/u).length : 0;

  return {
    author,
    description,
    excerpt,
    language,
    publishedAt,
    siteName,
    text,
    title,
    wordCount,
  };
}
