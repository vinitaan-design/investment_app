/**
 * Token metadata for documentation and JavaScript use (e.g. charts).
 * Values live only in tokens.css; read them at runtime with `readToken` so there is
 * a single source of truth.
 */

export interface ColorTokenInfo {
  /** Figma token name, e.g. "bg/canvas". */
  figma: string;
  /** CSS variable, e.g. "--color-bg-canvas". */
  cssVar: `--${string}`;
  /** Tailwind utility to use in components. */
  utility: string;
  use: string;
}

export const colorTokens: ColorTokenInfo[] = [
  { figma: "bg/canvas", cssVar: "--color-bg-canvas", utility: "bg-canvas", use: "App background" },
  { figma: "bg/surface", cssVar: "--color-bg-surface", utility: "bg-surface", use: "Cards, sheets" },
  {
    figma: "bg/subtle",
    cssVar: "--color-bg-subtle",
    utility: "bg-subtle",
    use: "Subtle fills, progress track",
  },
  { figma: "bg/brand", cssVar: "--color-bg-brand", utility: "bg-brand", use: "Primary button" },
  {
    figma: "bg/brand-subtle",
    cssVar: "--color-bg-brand-subtle",
    utility: "bg-brand-subtle",
    use: "Highlight cards",
  },
  {
    figma: "bg/accent",
    cssVar: "--color-bg-accent",
    utility: "bg-accent",
    use: "Decoration only, never text",
  },
  {
    figma: "bg/accent-subtle",
    cssVar: "--color-bg-accent-subtle",
    utility: "bg-accent-subtle",
    use: "Celebrations, nudges",
  },
  {
    figma: "bg/success-subtle",
    cssVar: "--color-bg-success-subtle",
    utility: "bg-success-subtle",
    use: "Success alert/badge",
  },
  {
    figma: "bg/warning-subtle",
    cssVar: "--color-bg-warning-subtle",
    utility: "bg-warning-subtle",
    use: "Warning alert/badge",
  },
  {
    figma: "bg/danger-subtle",
    cssVar: "--color-bg-danger-subtle",
    utility: "bg-danger-subtle",
    use: "Danger alert/badge/button",
  },
  {
    figma: "bg/info-subtle",
    cssVar: "--color-bg-info-subtle",
    utility: "bg-info-subtle",
    use: "Info alert/badge",
  },
  { figma: "text/primary", cssVar: "--color-text-primary", utility: "text-fg", use: "Body & headings" },
  {
    figma: "text/secondary",
    cssVar: "--color-text-secondary",
    utility: "text-fg-secondary",
    use: "Supporting text",
  },
  {
    figma: "text/tertiary",
    cssVar: "--color-text-tertiary",
    utility: "text-fg-tertiary",
    use: "Captions, metadata",
  },
  {
    figma: "text/brand",
    cssVar: "--color-text-brand",
    utility: "text-fg-brand",
    use: "Links, secondary buttons",
  },
  {
    figma: "text/accent",
    cssVar: "--color-text-accent",
    utility: "text-fg-accent",
    use: "Friendly highlights",
  },
  { figma: "text/success", cssVar: "--color-text-success", utility: "text-fg-success", use: "Success text" },
  { figma: "text/warning", cssVar: "--color-text-warning", utility: "text-fg-warning", use: "Warning text" },
  { figma: "text/danger", cssVar: "--color-text-danger", utility: "text-fg-danger", use: "Error text" },
  { figma: "text/info", cssVar: "--color-text-info", utility: "text-fg-info", use: "Info text" },
  {
    figma: "border/default",
    cssVar: "--color-border-default",
    utility: "border-line",
    use: "Card & divider borders",
  },
  {
    figma: "border/strong",
    cssVar: "--color-border-strong",
    utility: "border-line-strong",
    use: "Input borders",
  },
  { figma: "border/focus", cssVar: "--color-border-focus", utility: "border-line-focus", use: "Focus state" },
];

export interface TypeStyleInfo {
  figma: string;
  utility: string;
  use: string;
}

export const typeStyles: TypeStyleInfo[] = [
  { figma: "Display/Large", utility: "type-display-lg", use: "Hero/marketing statements" },
  { figma: "Heading/H1", utility: "type-h1", use: "Screen titles, greeting" },
  { figma: "Heading/H2", utility: "type-h2", use: "Section titles" },
  { figma: "Heading/H3", utility: "type-h3", use: "Card titles" },
  { figma: "Heading/H4", utility: "type-h4", use: "Small titles" },
  { figma: "Numeric/Hero", utility: "type-numeric-hero", use: "Net worth, balances" },
  { figma: "Numeric/Default", utility: "type-numeric", use: "Amounts in cards" },
  { figma: "Body/Large", utility: "type-body-lg", use: "Lead paragraphs" },
  { figma: "Body/Default", utility: "type-body", use: "Default body (minimum body size)" },
  { figma: "Body/Strong", utility: "type-body-strong", use: "Input labels, emphasis" },
  { figma: "Body/Small", utility: "type-body-sm", use: "Helper text, disclaimers" },
  { figma: "Label/Default", utility: "type-label", use: "Button labels" },
  { figma: "Label/Small", utility: "type-label-sm", use: "Badges, tags" },
  { figma: "Caption", utility: "type-caption", use: "Metadata, timestamps (never smaller)" },
];

export const spacingScale = [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;

export const radii = [
  { figma: "radius/sm", utility: "rounded-sm", px: 8, use: "" },
  { figma: "radius/md", utility: "rounded-md", px: 12, use: "Inputs, buttons" },
  { figma: "radius/lg", utility: "rounded-lg", px: 16, use: "Cards, alerts" },
  { figma: "radius/xl", utility: "rounded-xl", px: 24, use: "Sheets, dialogs" },
  { figma: "radius/full", utility: "rounded-full", px: 999, use: "Chips, badges, progress bars" },
] as const;

export const elevations = [
  { figma: "Elevation/1 — Resting", utility: "shadow-1", use: "Cards, list groups" },
  { figma: "Elevation/2 — Raised", utility: "shadow-2", use: "Hovered cards, sticky bars" },
  { figma: "Elevation/3 — Overlay", utility: "shadow-3", use: "Sheets, dialogs, menus" },
] as const;

/**
 * Read a token's resolved value from the document, e.g. for chart colours.
 * Returns an empty string outside the browser.
 */
export function readToken(cssVar: `--${string}`, element?: Element): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(element ?? document.documentElement)
    .getPropertyValue(cssVar)
    .trim();
}
