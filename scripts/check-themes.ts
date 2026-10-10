/**
 * `pnpm test:themes` (docs/06-design-system.md §2b): every registered theme defines every token from
 * light.css, and the text/background pairs pass WCAG AA (4.5:1 text, 3:1 logo mark) in every theme.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { THEME_IDS } from "@/config/themes";

const THEMES_DIR = join(process.cwd(), "src/styles/themes");

type Declarations = Map<string, string>;

function parseDeclarations(body: string): Declarations {
  const result: Declarations = new Map();
  for (const line of body.split(";")) {
    const match = /^\s*(--[\w-]+)\s*:\s*([\s\S]+?)\s*$/.exec(line);
    if (match?.[1] && match[2]) result.set(match[1], match[2]);
  }
  return result;
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Token block whose selector list contains [data-theme="<id>"]. */
function themeBlock(css: string, id: string): Declarations {
  const blocks = stripComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g);
  for (const [, selector = "", body = ""] of blocks) {
    if (selector.includes(`[data-theme="${id}"]`)) return parseDeclarations(body);
  }
  throw new Error(`No [data-theme="${id}"] block in ${id}.css`);
}

/** The block applied when the OS is dark and the user chose "system". */
function systemDarkBlock(css: string): Declarations | undefined {
  const match = /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*([^{}]+)\{([^{}]*)\}\s*\}/.exec(
    stripComments(css),
  );
  return match?.[2] === undefined ? undefined : parseDeclarations(match[2]);
}

type Rgba = { r: number; g: number; b: number; a: number };

function parseColor(value: string): Rgba {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(value.trim());
  if (hex?.[1]) {
    const digits =
      hex[1].length === 3
        ? [...hex[1]].map((digit) => digit + digit).join("")
        : hex[1].padEnd(8, "f");
    const channel = (index: number) => parseInt(digits.slice(index, index + 2), 16);
    return { r: channel(0), g: channel(2), b: channel(4), a: channel(6) / 255 };
  }
  const rgb =
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[/,]\s*([\d.]+%?))?\s*\)$/i.exec(
      value.trim(),
    );
  if (rgb) {
    const alpha = rgb[4] ?? "1";
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
      a: alpha.endsWith("%") ? Number(alpha.slice(0, -1)) / 100 : Number(alpha),
    };
  }
  throw new Error(`Unsupported color: ${value}`);
}

/** Flattens a translucent color onto an opaque one (how it renders on the page). */
function over(top: Rgba, base: Rgba): Rgba {
  const mix = (a: number, b: number) => a * top.a + b * (1 - top.a);
  return { r: mix(top.r, base.r), g: mix(top.g, base.g), b: mix(top.b, base.b), a: 1 };
}

function luminance({ r, g, b }: Rgba): number {
  const linear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function contrastRatio(a: Rgba, b: Rgba): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

// [text token, background token, minimum ratio]. Backgrounds are flattened onto --card, then --background.
const PAIRS: ReadonlyArray<readonly [string, string, number]> = [
  ["--foreground", "--background", 4.5],
  ["--foreground", "--card", 4.5],
  ["--muted-foreground", "--card", 4.5],
  ["--muted-foreground", "--background", 4.5],
  ["--primary-foreground", "--primary", 4.5],
  ["--primary-text", "--background", 4.5],
  ["--primary-text", "--card", 4.5],
  ["--reward-foreground", "--reward", 4.5],
  ["--primary-soft-fg", "--primary-soft", 4.5],
  ["--reward-soft-fg", "--reward-soft", 4.5],
  ["--success-fg", "--success-soft", 4.5],
  ["--warning-fg", "--warning-soft", 4.5],
  ["--danger-fg", "--danger-soft", 4.5],
  ["--stale-fg", "--stale", 4.5],
  ["--toast-fg", "--toast", 4.5],
  ...["coral", "pink", "violet", "sky", "amber", "teal", "green"].map(
    (tone) => [`--cat-${tone}-fg`, `--cat-${tone}-soft`, 4.5] as const,
  ),
  ["--logo-mark", "--background", 3],
  ["--logo-mark", "--card", 3],
];

const read = (id: string) => readFileSync(join(THEMES_DIR, `${id}.css`), "utf8");
const referenceTokens = [...themeBlock(read("light"), "light").keys()];

describe.each(THEME_IDS)("theme %s", (id) => {
  const css = read(id);
  const tokens = themeBlock(css, id);

  it("defines every token", () => {
    const missing = referenceTokens.filter((token) => !tokens.has(token));
    expect(missing).toEqual([]);
  });

  it("system-dark block matches the theme block", () => {
    const system = systemDarkBlock(css);
    if (system) expect(Object.fromEntries(system)).toEqual(Object.fromEntries(tokens));
  });

  it.each(PAIRS)("%s on %s ≥ %s:1", (fg, bg, minimum) => {
    const color = (token: string) => {
      const value = tokens.get(token);
      if (!value) throw new Error(`${token} missing`);
      return parseColor(value);
    };
    const page = color("--background");
    const surface = over(color("--card"), page);
    const background = over(color(bg), surface);
    const text = over(color(fg), background);
    expect(contrastRatio(text, background)).toBeGreaterThanOrEqual(minimum);
  });
});
