import type { Preview } from "@storybook/react-vite";
import "./storybook.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
    backgrounds: {
      options: {
        canvas: { name: "Canvas (sand/50)", value: "#F7F5F0" },
        surface: { name: "Surface (white)", value: "#FFFFFF" },
      },
    },
    a11y: { test: "error" },
    controls: { expanded: true },
  },
  initialGlobals: { backgrounds: { value: "canvas" } },
  tags: ["autodocs"],
};

export default preview;
