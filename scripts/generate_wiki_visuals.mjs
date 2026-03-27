import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = join(ROOT, "docs", "wiki", "images");
const TSX_CLI = join(ROOT, "node_modules", "tsx", "dist", "cli.mjs");

mkdirSync(OUT_DIR, { recursive: true });

function runCli(args) {
  return execFileSync(process.execPath, [TSX_CLI, "src/cli.ts", ...args], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trimEnd();
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrapLine(line, width = 92) {
  if (line.length <= width) {
    return [line];
  }

  const chunks = [];
  let remaining = line;

  while (remaining.length > width) {
    const slice = remaining.slice(0, width + 1);
    const splitAt = Math.max(slice.lastIndexOf(" "), 40);
    chunks.push(remaining.slice(0, splitAt).trimEnd());
    remaining = remaining.slice(splitAt).trimStart();
  }

  if (remaining.length > 0) {
    chunks.push(remaining);
  }

  return chunks;
}

function terminalSvg({ title, subtitle, lines, outputPath }) {
  const paddedLines = lines.flatMap((line) => wrapLine(line));
  const width = 1480;
  const headerHeight = 86;
  const paddingX = 46;
  const lineHeight = 28;
  const bodyPaddingY = 38;
  const height =
    headerHeight + bodyPaddingY * 2 + Math.max(paddedLines.length, 10) * lineHeight;

  const text = paddedLines
    .map((line, index) => {
      const y = headerHeight + bodyPaddingY + index * lineHeight;
      return `<text x="${paddingX}" y="${y}" fill="#d8f2f2" font-size="18" font-family="'Cascadia Mono', Consolas, monospace">${escapeXml(line)}</text>`;
    })
    .join("\n");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="terminalBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#13232f"/>
      <stop offset="100%" stop-color="#0d151c"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="24" fill="url(#terminalBg)"/>
  <rect x="22" y="22" width="${width - 44}" height="${headerHeight - 16}" rx="18" fill="#10202a"/>
  <circle cx="62" cy="57" r="9" fill="#f28b82"/>
  <circle cx="92" cy="57" r="9" fill="#fdd663"/>
  <circle cx="122" cy="57" r="9" fill="#81c995"/>
  <text x="160" y="52" fill="#fff8eb" font-size="26" font-weight="700" font-family="'Segoe UI', sans-serif">${escapeXml(title)}</text>
  <text x="160" y="77" fill="#95aeb4" font-size="16" font-family="'Segoe UI', sans-serif">${escapeXml(subtitle)}</text>
  ${text}
</svg>`;

  writeFileSync(outputPath, svg, "utf8");
}

function dashboardSvg({ catalog, outputPath }) {
  const counts = new Map();
  for (const item of catalog) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }

  const cards = [
    { key: "news", label: "News", color: "#d16939" },
    { key: "weather", label: "Weather", color: "#1d6b73" },
    { key: "reports", label: "Reports", color: "#4f6d5a" },
    { key: "academic", label: "Academic", color: "#8b5a8c" },
  ];

  const width = 1480;
  const height = 760;
  const cardWidth = 320;
  const cardHeight = 172;
  const cardY = 250;
  const startX = 68;
  const gap = 26;

  const cardMarkup = cards
    .map((card, index) => {
      const x = startX + index * (cardWidth + gap);
      const count = counts.get(card.key) ?? 0;
      return `
  <rect x="${x}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" rx="24" fill="#fffaf1"/>
  <rect x="${x}" y="${cardY}" width="${cardWidth}" height="18" rx="24" fill="${card.color}"/>
  <text x="${x + 26}" y="${cardY + 70}" fill="#4f5c67" font-size="20" font-family="'Segoe UI', sans-serif">${card.label}</text>
  <text x="${x + 26}" y="${cardY + 128}" fill="#10202a" font-size="46" font-weight="700" font-family="'Segoe UI', sans-serif">${count}</text>
  <text x="${x + 110}" y="${cardY + 126}" fill="#72818d" font-size="20" font-family="'Segoe UI', sans-serif">starter scrapers</text>`;
    })
    .join("\n");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="heroBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f4efe6"/>
      <stop offset="100%" stop-color="#e9dcc8"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="30" fill="url(#heroBg)"/>
  <rect x="52" y="52" width="${width - 104}" height="${height - 104}" rx="28" fill="#fffdf8" opacity="0.92"/>
  <text x="86" y="128" fill="#10202a" font-size="48" font-weight="700" font-family="'Segoe UI', sans-serif">Open Scrapers Toolkit</text>
  <text x="86" y="176" fill="#52626d" font-size="24" font-family="'Segoe UI', sans-serif">Starter catalog coverage across news, weather, reports, and academic sources.</text>
  <text x="86" y="214" fill="#7a6f63" font-size="18" font-family="'Segoe UI', sans-serif">Generated from the live CLI catalog so the wiki artwork stays in sync with the real project.</text>
  ${cardMarkup}
  <rect x="86" y="490" width="1308" height="188" rx="24" fill="#10202a"/>
  <text x="122" y="548" fill="#fff8eb" font-size="26" font-weight="700" font-family="'Segoe UI', sans-serif">${catalog.length} scrapers ship in the current toolkit build</text>
  <text x="122" y="590" fill="#9fb7bc" font-size="20" font-family="'Segoe UI', sans-serif">Use npx tsx src/cli.ts list --format json for machine-readable catalog output.</text>
  <text x="122" y="628" fill="#d8f2f2" font-size="18" font-family="'Cascadia Mono', Consolas, monospace">npx tsx src/cli.ts run-all --category weather --limit 6 --out-dir output/weather</text>
</svg>`;

  writeFileSync(outputPath, svg, "utf8");
}

function main() {
  const catalog = JSON.parse(runCli(["list", "--format", "json"]));
  const runPreview = runCli(["run", "nasa-breaking-news", "--limit", "4"]);

  dashboardSvg({
    catalog,
    outputPath: join(OUT_DIR, "toolkit-catalog-overview.svg"),
  });

  terminalSvg({
    title: "CLI Run Preview",
    subtitle: "Live output from nasa-breaking-news --limit 4",
    lines: runPreview.split(/\r?\n/),
    outputPath: join(OUT_DIR, "toolkit-cli-run-preview.svg"),
  });
}

main();
