import type { Meta, StoryObj } from "@storybook/react-vite";
import { colorTokens, elevations, radii, readToken, spacingScale, typeStyles } from "../tokens/tokens";

const meta: Meta = {
  title: "Foundations",
  tags: ["!autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

function Swatch({ cssVar }: { cssVar: `--${string}` }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="size-10 shrink-0 rounded-sm border border-line"
        style={{ background: `var(${cssVar})` }}
      />
      {/* The resolved value is read from the DOM after mount: tokens.css stays the only source. */}
      <code
        ref={(el) => {
          if (el) el.textContent = readToken(cssVar);
        }}
        className="type-caption text-fg-secondary"
      />
    </div>
  );
}

export const Colours: StoryObj = {
  render: () => (
    <table className="w-full border-collapse text-left">
      <caption className="mb-4 text-left type-h2 text-fg">Semantic colour tokens (light)</caption>
      <thead>
        <tr className="type-label-sm text-fg-secondary">
          <th scope="col" className="py-2">
            Figma token
          </th>
          <th scope="col">Value</th>
          <th scope="col">Tailwind</th>
          <th scope="col">Use for</th>
        </tr>
      </thead>
      <tbody>
        {colorTokens.map((t) => (
          <tr key={t.figma} className="border-t border-line type-body text-fg">
            <th scope="row" className="py-2 font-normal">
              {t.figma}
            </th>
            <td>
              <Swatch cssVar={t.cssVar} />
            </td>
            <td>
              <code className="type-body-sm">{t.utility}</code>
            </td>
            <td className="type-body-sm text-fg-secondary">{t.use}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

export const Typography: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <h2 className="type-h2 text-fg">Type scale</h2>
      {typeStyles.map((t) => (
        <div
          key={t.figma}
          className="grid grid-cols-[12rem_1fr] items-baseline gap-4 border-t border-line pt-4"
        >
          <div>
            <p className="type-label-sm text-fg">{t.figma}</p>
            <code className="type-caption text-fg-secondary">{t.utility}</code>
          </div>
          <p className={`${t.utility} text-fg`}>{t.figma.startsWith("Numeric") ? "₹12,34,567" : t.use}</p>
        </div>
      ))}
    </div>
  ),
};

export const SpacingRadiusElevation: StoryObj = {
  name: "Spacing, radius & elevation",
  render: () => (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="type-h2 text-fg">Spacing (4px grid)</h2>
        {spacingScale.map((px) => (
          <div key={px} className="flex items-center gap-4">
            <code className="w-12 type-caption text-fg-secondary">{px}px</code>
            <span aria-hidden className="h-3 rounded-full bg-brand" style={{ width: px }} />
          </div>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="type-h2 text-fg">Radius</h2>
        <div className="flex flex-wrap gap-6">
          {radii.map((r) => (
            <div key={r.figma} className="space-y-2 text-center">
              <div className={`size-20 border-2 border-line-brand bg-brand-subtle ${r.utility}`} />
              <p className="type-caption text-fg-secondary">{r.figma}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="type-h2 text-fg">Elevation</h2>
        <div className="flex flex-wrap gap-6">
          {elevations.map((e) => (
            <div key={e.figma} className={`w-48 rounded-lg bg-surface p-4 ${e.utility}`}>
              <p className="type-label text-fg">{e.figma}</p>
              <p className="type-body-sm text-fg-secondary">{e.use}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};
