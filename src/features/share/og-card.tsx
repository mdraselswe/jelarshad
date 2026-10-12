import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

import { shapeLine, wrapLines, type FontKey, type ShapedLine } from "./shape";

// Share cards (every page has its own OG image, Bangla text included). The card is one SVG made of
// shaped glyph outlines (see shape.ts), shown through next/og as an image, so Bangla letters join
// correctly. Colours are fixed: there are no CSS variables in an image (docs/06-design-system.md §2).

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const INK = "#16161D";
const MUTED = "#5E5E6E";
const PRIMARY = "#4F46E5";
const GOLD = "#F59E0B";
const PAD = 72;
const MAX_WIDTH = OG_SIZE.width - PAD * 2;

type CardInput = {
  /** Small line above the title ("বগুড়া-এর বিখ্যাত"). */
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
};

const num = (value: number) => Math.round(value * 100) / 100;

function drawLine(line: ShapedLine, x: number, baseline: number, fill: string): string {
  const paths = line.glyphs
    .map(
      (glyph) =>
        `<path transform="translate(${num(x + glyph.x)} ${num(baseline + glyph.y)}) scale(${num(line.scale * 1000) / 1000} ${-num(line.scale * 1000) / 1000})" d="${glyph.path}"/>`,
    )
    .join("");
  return `<g fill="${fill}">${paths}</g>`;
}

export async function ogCard({ eyebrow, title, subtitle }: CardInput): Promise<ImageResponse> {
  const parts: string[] = [];
  parts.push(`<rect width="${OG_SIZE.width}" height="${OG_SIZE.height}" fill="#F6F6F8"/>`);

  // Brand row: the logo mark and the name.
  parts.push(
    `<g transform="translate(${PAD} ${PAD}) scale(1.125)"><path fill="${PRIMARY}" fill-rule="evenodd" d="M32 4a28 28 0 1 1-16.4 50.7L5 59l3.6-10.7A28 28 0 0 1 32 4zM19 31h26a13 13 0 0 1-26 0z"/><rect x="23" y="22" width="18" height="3.6" rx="1.8" fill="${GOLD}"/></g>`,
  );
  parts.push(drawLine(await shapeLine(siteConfig.name, "display", 46), PAD + 92, PAD + 52, INK));

  // Text block: eyebrow, title (up to two lines), subtitle (up to two lines).
  const titleSize = title.length > 22 ? 80 : 112;
  const titleLines = await wrapLines(title, "display", titleSize, MAX_WIDTH, 2);
  const subtitleLines = subtitle ? await wrapLines(subtitle, "text", 38, MAX_WIDTH, 2) : [];
  let y = 250;
  if (eyebrow) {
    parts.push(drawLine(await shapeLine(eyebrow, "text", 38), PAD, y, PRIMARY));
    y += 38;
  }
  y += titleSize * 0.95;
  for (const line of titleLines) {
    parts.push(drawLine(line, PAD, y, INK));
    y += titleSize * 1.2;
  }
  y += -titleSize * 0.2 + 22;
  for (const line of subtitleLines) {
    parts.push(drawLine(line, PAD, y, MUTED));
    y += 52;
  }
  parts.push(
    drawLine(await shapeLine(new URL(siteConfig.url).host, "text" as FontKey, 30), PAD, 580, MUTED),
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_SIZE.width}" height="${OG_SIZE.height}" viewBox="0 0 ${OG_SIZE.width} ${OG_SIZE.height}">${parts.join("")}</svg>`;
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not shown in a page
    <img src={src} width={OG_SIZE.width} height={OG_SIZE.height} alt="" />,
    OG_SIZE,
  );
}
