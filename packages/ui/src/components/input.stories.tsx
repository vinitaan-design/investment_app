import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input";

const meta = {
  title: "Form/Input",
  component: Input,
  args: { label: "Goal cost today", prefix: "₹", defaultValue: "500000" },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: "Label always visible above the field. Error text says what to do next. Height 52px.",
      },
    },
  },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHelper: Story = {
  args: {
    label: "Expected inflation",
    prefix: undefined,
    suffix: "% a year",
    defaultValue: "6",
    helper: "Education costs often rise faster than general prices.",
  },
};
export const Error: Story = {
  args: {
    label: "Years until goal",
    prefix: undefined,
    defaultValue: "0",
    error: "Enter a number of years above 0, up to 60.",
  },
};
export const Disabled: Story = { args: { disabled: true } };
