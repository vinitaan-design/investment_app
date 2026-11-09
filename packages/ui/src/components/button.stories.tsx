import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarPlus } from "lucide-react";
import { fn } from "storybook/test";
import { Button } from "./button";

const meta = {
  title: "Actions/Button",
  component: Button,
  args: { children: "Book a session", onClick: fn() },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "inline-radio", options: ["lg", "md"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "One Primary per screen. Danger is soft; pair it with a confirm step. Minimum touch target 44px.",
      },
    },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Danger: Story = { args: { variant: "danger", children: "Cancel booking" } };
export const Medium: Story = { args: { size: "md" } };
export const WithIcon: Story = { args: { icon: <CalendarPlus /> } };
export const Loading: Story = { args: { loading: true, children: "Saving" } };
export const Disabled: Story = { args: { disabled: true } };

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-[auto_repeat(3,auto)] items-center gap-4">
      {(["primary", "secondary", "ghost", "danger"] as const).map((variant) => (
        <div key={variant} className="contents">
          <span className="type-label-sm text-fg-secondary capitalize">{variant}</span>
          <Button variant={variant}>Large</Button>
          <Button variant={variant} size="md">
            Medium
          </Button>
          <Button variant={variant} disabled>
            Disabled
          </Button>
        </div>
      ))}
    </div>
  ),
};
