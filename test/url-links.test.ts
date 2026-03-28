import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { mkdtemp, writeFile } from "node:fs/promises";
import http from "node:http";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import websiteLinksAiDigest from "../src/scrapers/website-links-ai-digest.js";

test("website-links-ai-digest reads URLs from a file and extracts page content", async () => {
  const server = http.createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(`
      <html lang="en">
        <head>
          <title>Example News Story</title>
          <meta name="description" content="Short article summary for the reader." />
          <meta property="article:published_time" content="2026-03-28T09:00:00Z" />
          <meta name="author" content="Jamie Example" />
        </head>
        <body>
          <main>
            <article>
              <h1>Example News Story</h1>
              <p>This is the first paragraph of the sample article used in automated tests.</p>
              <p>This is the second paragraph with enough content to exercise text extraction.</p>
            </article>
          </main>
        </body>
      </html>
    `);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  try {
    const address = server.address() as AddressInfo | null;
    if (!address) {
      throw new Error("Test server address was not available.");
    }

    const directory = await mkdtemp(join(tmpdir(), "open-scrapers-links-"));
    const linksPath = join(directory, "links.txt");
    await writeFile(linksPath, `http://127.0.0.1:${address.port}/story\n`, "utf8");

    const result = await websiteLinksAiDigest.run({
      contactEmail: "tests@example.com",
      limit: 5,
      now: new Date("2026-03-28T12:00:00.000Z"),
      outputDir: directory,
      params: {
        file: linksPath,
        maxChars: "2000",
        sourceLabel: "Test Links",
        useAi: "false",
      },
      userAgent: "OpenScrapersTests/1.0",
    });

    assert.equal(result.records.length, 1);
    assert.equal(result.source, "Test Links");
    assert.equal(result.records[0]?.title, "Example News Story");
    assert.equal(result.records[0]?.authors?.[0], "Jamie Example");
    assert.match(result.records[0]?.summary ?? "", /Short article summary/);
  } finally {
    server.close();
  }
});
