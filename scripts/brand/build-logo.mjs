import { readdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { Resvg } from "@resvg/resvg-js";

import { outline } from "./outline.mjs";

// Rebuilds the logo files for the current name. The symbol (brand/react/logo.tsx MARK) stays; the
// wordmark, tagline and labels are redrawn from the font outlines in src/features/share/fonts.
//   node scripts/brand/build-logo.mjs

const NAME = "জেলার স্বাদ";
const NAME_LATIN = "Jelar Shad";
const TAGLINE = "জেলায় জেলায় আসল স্বাদের খোঁজ";
const WORDMARK_SIZE = 44;
const TAGLINE_SIZE = 13;

const ROOT = process.cwd();
const LOGO_DIR = join(ROOT, "brand/logo");
const PUBLIC_DIR = join(ROOT, "public/brand");

const [wordmark, tagline, latin] = await Promise.all([
  outline(NAME, "display", WORDMARK_SIZE),
  outline(TAGLINE, "text", TAGLINE_SIZE),
  outline(NAME_LATIN, "text", TAGLINE_SIZE),
]);

/** Replaces the `d` of the <path> that has this transform. */
function setPath(svg, transform, d) {
  const pattern = new RegExp(`(<path transform="${transform.replace(/[()]/g, "\\$&")}" d=")[^"]*(")`);
  if (!pattern.test(svg)) throw new Error(`no path with transform ${transform}`);
  return svg.replace(pattern, (_, start, end) => `${start}${d}${end}`);
}

function rebuild(file, svg) {
  let out = svg
    .replace(/<metadata>[\s\S]*?<\/metadata>/g, "")
    .replace(/ xmlns:c2pa="[^"]*"/g, "")
    .replace(/<title>[^<]*<\/title>/, `<title>${NAME}</title>`)
    .replace(/aria-label="[^"]*"/, `aria-label="${NAME}"`);
  const isEn = file.startsWith("lockup-en");
  if (out.includes('transform="translate(78 38)"')) out = setPath(out, "translate(78 38)", wordmark.d);
  if (out.includes('transform="translate(78 46)"')) out = setPath(out, "translate(78 46)", wordmark.d);
  if (out.includes('transform="translate(79 58)"')) {
    out = setPath(out, "translate(79 58)", isEn ? latin.d : tagline.d);
  }
  return out;
}

const written = [];
for (const file of (await readdir(LOGO_DIR)).filter((name) => name.endsWith(".svg"))) {
  const path = join(LOGO_DIR, file);
  const next = rebuild(file, await readFile(path, "utf8"));
  await writeFile(path, next);
  written.push(file);
  if (existsSync(join(PUBLIC_DIR, file))) await copyFile(path, join(PUBLIC_DIR, file));
}

// The adaptive favicon the app serves.
const appIcon = join(ROOT, "src/app/icon.svg");
await writeFile(appIcon, rebuild("icon.svg", await readFile(appIcon, "utf8")));

// Share image: brand/logo/og-default.svg → PNG (also used as the app's fallback share image).
const og = await readFile(join(LOGO_DIR, "og-default.svg"), "utf8");
const png = new Resvg(og, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
await writeFile(join(LOGO_DIR, "og-default.png"), png);
await writeFile(join(ROOT, "src/app/opengraph-image.png"), png);

// The React logo: keep the symbol, swap the wordmark and tagline.
for (const file of ["brand/react/logo.tsx", "src/components/brand/logo.tsx"]) {
  const path = join(ROOT, file);
  let source = await readFile(path, "utf8");
  source = source
    .replace(/const WORDMARK = '[^']*';/, `const WORDMARK = '${wordmark.d}';`)
    .replace(/const TAGLINE = '[^']*';/, `const TAGLINE = '${tagline.d}';`)
    .replaceAll("সোজাসাপ্টা", NAME)
    .replace("ShojaShapta logo", "জেলার স্বাদ logo");
  await writeFile(path, source);
}

console.log(`rebuilt ${written.length} svgs, og png ${png.length} bytes`);
