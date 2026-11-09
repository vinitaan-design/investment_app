import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./checkbox";
import { RadioGroup } from "./radio-group";
import { Select } from "./select";
import { Switch } from "./switch";

const meta: Meta = {
  title: "Form/Controls",
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
};
export default meta;

export const CheckboxStates: StoryObj = {
  name: "Checkbox",
  render: () => (
    <div className="space-y-1">
      <Checkbox label="I agree to the privacy notice" />
      <Checkbox label="Send me booking reminders" defaultChecked />
      <Checkbox label="Accept the terms" error="Accept the terms to continue." />
      <Checkbox label="Not available" disabled />
    </div>
  ),
};

export const Radio: StoryObj = {
  name: "Radio group",
  render: () => (
    <RadioGroup
      legend="If your savings dropped 10% in a month, you would…"
      defaultValue="wait"
      options={[
        { value: "sell", label: "Move everything to cash" },
        { value: "wait", label: "Wait and see", description: "Most people choose this" },
        { value: "add", label: "Add more while prices are low" },
      ]}
    />
  ),
};

export const RadioError: StoryObj = {
  name: "Radio group — error",
  render: () => (
    <RadioGroup
      legend="How long until you need this money?"
      error="Choose one option to continue."
      options={[
        { value: "short", label: "Less than 3 years" },
        { value: "long", label: "3 years or more" },
      ]}
    />
  ),
};

export const SwitchStates: StoryObj = {
  name: "Switch",
  render: () => (
    <div className="divide-y divide-line">
      <Switch label="Booking reminders" description="A reminder the day before" defaultChecked />
      <Switch label="Monthly summary email" />
      <Switch label="Share data with advisors" disabled />
    </div>
  ),
};

export const SelectStates: StoryObj = {
  name: "Select",
  render: () => (
    <div className="space-y-5">
      <Select
        label="Preferred language"
        placeholder="Choose a language"
        defaultValue=""
        options={[
          { value: "en", label: "English" },
          { value: "hi", label: "Hindi" },
          { value: "ml", label: "Malayalam" },
        ]}
      />
      <Select
        label="Consultant"
        options={[]}
        placeholder="Choose a consultant"
        defaultValue=""
        error="Choose a consultant to continue."
      />
      <Select label="Disabled" options={[{ value: "a", label: "Option" }]} disabled />
    </div>
  ),
};
