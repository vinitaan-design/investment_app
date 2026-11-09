/**
 * Renders every Storybook story and runs axe-core accessibility checks on it.
 * Colour contrast is excluded here because jsdom has no layout or computed colours;
 * contrast is enforced token-by-token in src/tokens/tokens.test.ts.
 */
import { composeStories } from "@storybook/react-vite";
import { render } from "@testing-library/react";
import axe from "axe-core";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";
import preview from "../../.storybook/preview";

type StoryModule = Parameters<typeof composeStories>[0];

const modules = import.meta.glob<StoryModule>("../**/*.stories.tsx", { eager: true });

const cases = Object.entries(modules).flatMap(([file, mod]) =>
  Object.entries(composeStories(mod, preview)).map(
    ([name, Story]) => [`${file.replace("../", "")} › ${name}`, Story as ComponentType] as const,
  ),
);

describe("every story passes axe", () => {
  it("finds stories", () => {
    expect(cases.length).toBeGreaterThan(20);
  });

  it.each(cases)("%s", async (_name, Story) => {
    const { container } = render(<Story />);
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
    });
    const summary = results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`);
    expect(summary).toEqual([]);
  });
});
