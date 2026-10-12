import { readFile } from "node:fs/promises";
import { join } from "node:path";

import * as hb from "harfbuzzjs";

// Turns a line of text into one SVG path made of font outlines (no font needed to draw it), baseline at
// y = 0 and y growing downwards. Used by build-logo.mjs for the wordmark and tagline of the logo.

const FONT_DIR = join(process.cwd(), "src/features/share/fonts");
const FACES = {
  display: { bengali: "anek-bangla-700.ttf", latin: "noto-latin-600.ttf" },
  text: { bengali: "noto-bengali-600.ttf", latin: "noto-latin-600.ttf" },
};
const cache = new Map();

async function load(file) {
  let loaded = cache.get(file);
  if (!loaded) {
    const bytes = await readFile(join(FONT_DIR, file));
    const blob = new hb.Blob(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    const face = new hb.Face(blob);
    loaded = { font: new hb.Font(face), upem: face.upem };
    cache.set(file, loaded);
  }
  return loaded;
}

const isBengali = (char) => {
  const code = char.codePointAt(0) ?? 0;
  return (code >= 0x0980 && code <= 0x09ff) || code === 0x0964 || code === 0x0965 || code === 0x200c || code === 0x200d;
};

function runs(text) {
  const out = [];
  for (const char of text) {
    const bengali = isBengali(char);
    const last = out.at(-1);
    if (last && (last.bengali === bengali || (char === " " && last.bengali))) last.text += char;
    else out.push({ text: char, bengali });
  }
  return out;
}

const num = (value) => String(Math.round(value * 1000) / 1000);

function transformPath(path, scale, dx, dy) {
  // HarfBuzz emits absolute M / L / Q / C / Z only.
  const out = [];
  const parts = path.match(/[MLQCZ]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let isX = true;
  for (const part of parts) {
    if (/[MLQCZ]/.test(part)) {
      out.push(part);
      isX = true;
      continue;
    }
    const value = Number(part);
    out.push(isX ? num(value * scale + dx) : num(-value * scale + dy));
    isX = !isX;
  }
  return out.join(" ").replace(/ ?([MLQCZ]) ?/g, "$1");
}

/** @returns {Promise<{ d: string, width: number }>} */
export async function outline(text, key, size) {
  const files = FACES[key];
  let cursor = 0;
  const paths = [];
  for (const run of runs(text)) {
    const { font, upem } = await load(run.bengali ? files.bengali : files.latin);
    const scale = size / upem;
    const buffer = new hb.Buffer();
    buffer.addText(run.text);
    buffer.guessSegmentProperties();
    hb.shape(font, buffer);
    const infos = buffer.getGlyphInfos();
    const positions = buffer.getGlyphPositions();
    infos.forEach((info, index) => {
      const position = positions[index];
      if (!position) return;
      const path = font.glyphToPath(info.codepoint);
      if (path) {
        paths.push(
          transformPath(path, scale, cursor + position.xOffset * scale, -position.yOffset * scale),
        );
      }
      cursor += position.xAdvance * scale;
    });
  }
  return { d: paths.join(""), width: cursor };
}
