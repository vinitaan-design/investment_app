/**
 * Guards the design tokens:
 *  - every text/background pair used in components meets WCAG 2.2 AA
 *  - input borders meet the 3:1 non-text contrast rule
 *  - both brand fonts ship the ₹ glyph in a subset the browser will load
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

// Strip comments so selectors mentioned in prose are not mistaken for blocks.
const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/** Collect `--name: value;` declarations from one CSS block. */
function declarations(block: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) map.set(m[1], m[2].trim());
  return map;
}

const rootBlock = css.slice(css.indexOf(":root"), css.indexOf('[data-theme="dark"]'));
const darkBlock = css.slice(css.indexOf('[data-theme="dark"]'));
const light = declarations(rootBlock);
const dark = new Map([...light, ...declarations(darkBlock)]);

function resolve(theme: Map<string, string>, token: string, depth = 0): string {
  const value = theme.get(token);
  if (!value) throw new Error(`Unknown token --${token}`);
  const ref = value.match(/^var\(--([\w-]+)\)$/);
  if (ref) {
    if (depth > 10) throw new Error(`Token cycle at --${token}`);
    return resolve(theme, ref[1], depth + 1);
  }
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`--${token} is not a hex colour: ${value}`);
  return value;
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [foreground token, background token] pairs actually used by the components and pages.
const textPairs: Array<[string, string]> = [
  ["color-text-primary", "color-bg-canvas"],
  ["color-text-primary", "color-bg-surface"],
  ["color-text-primary", "color-bg-brand-subtle"],
  ["color-text-secondary", "color-bg-canvas"],
  ["color-text-secondary", "color-bg-surface"],
  ["color-text-secondary", "color-bg-brand-subtle"],
  ["color-text-secondary", "color-bg-subtle"],
  ["color-text-tertiary", "color-bg-canvas"],
  ["color-text-tertiary", "color-bg-surface"],
  ["color-text-tertiary", "color-bg-brand-subtle"],
  ["color-text-on-brand", "color-bg-brand"],
  ["color-text-on-brand", "color-bg-brand-hover"],
  ["color-text-brand", "color-bg-canvas"],
  ["color-text-brand", "color-bg-surface"],
  ["color-text-brand", "color-bg-brand-subtle"],
  ["color-text-accent", "color-bg-accent-subtle"],
  ["color-text-success", "color-bg-success-subtle"],
  ["color-text-warning", "color-bg-warning-subtle"],
  ["color-text-danger", "color-bg-danger-subtle"],
  ["color-text-info", "color-bg-info-subtle"],
  ["color-text-primary", "color-bg-info-subtle"],
  ["color-text-primary", "color-bg-danger-subtle"],
];

const borderPairs: Array<[string, string]> = [
  ["color-border-strong", "color-bg-surface"],
  ["color-border-danger", "color-bg-surface"],
  ["color-border-focus", "color-bg-surface"],
];

describe.each([
  ["light", light],
  ["dark", dark],
])("%s theme", (_name, theme) => {
  it.each(textPairs)("%s on %s meets 4.5:1", (fg, bg) => {
    expect(contrast(resolve(theme, fg), resolve(theme, bg))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(borderPairs)("%s on %s meets 3:1", (fg, bg) => {
    expect(contrast(resolve(theme, fg), resolve(theme, bg))).toBeGreaterThanOrEqual(3);
  });
});

describe("contrast()", () => {
  it("matches known reference values", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });
});

describe("₹ glyph coverage", () => {
  const require = createRequire(import.meta.url);
  const RUPEE = 0x20b9;

  /** True if any @font-face block's unicode-range includes the code point. */
  function rangeCovers(fontCss: string, cp: number): boolean {
    for (const m of fontCss.matchAll(/unicode-range:\s*([^;]+);/g)) {
      for (const part of m[1].split(",")) {
        const [a, b] = part.trim().replace(/^U\+/i, "").split("-");
        const lo = parseInt(a, 16);
        const hi = b ? parseInt(b, 16) : lo;
        if (cp >= lo && cp <= hi) return true;
      }
    }
    return false;
  }

  it.each(["@fontsource-variable/inter", "@fontsource-variable/plus-jakarta-sans"])(
    "%s serves ₹ from one of its subsets",
    (pkg) => {
      const fontCss = readFileSync(require.resolve(`${pkg}/index.css`), "utf8");
      expect(rangeCovers(fontCss, RUPEE)).toBe(true);
    },
  );
});
