import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Avatar,
  BookingStatusBadge,
  Button,
  Card,
  Checkbox,
  Dialog,
  EmptyState,
  RadioGroup,
  Select,
  Skeleton,
  StatCard,
  Switch,
  Tabs,
  formatINR,
  initials,
} from "../index";

describe("formatINR", () => {
  it("uses Indian digit grouping", () => {
    expect(formatINR(1234567)).toBe("₹12,34,567");
  });
});

describe("Card", () => {
  it("renders the requested element", () => {
    render(<Card as="article">Hello</Card>);
    expect(screen.getByRole("article")).toHaveTextContent("Hello");
  });
});

describe("Checkbox", () => {
  it("toggles via its label (whole row is the hit area)", async () => {
    render(<Checkbox label="I agree to the privacy notice" />);
    const box = screen.getByRole("checkbox", { name: "I agree to the privacy notice" });
    await userEvent.click(screen.getByText("I agree to the privacy notice"));
    expect(box).toBeChecked();
  });

  it("shows an error tied to the field", () => {
    render(<Checkbox label="Accept terms" error="Accept the terms to continue." />);
    const box = screen.getByRole("checkbox");
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box).toHaveAccessibleDescription("Accept the terms to continue.");
  });

  it("does not toggle when disabled", async () => {
    render(<Checkbox label="Locked" disabled />);
    await userEvent.click(screen.getByText("Locked"));
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });
});

describe("RadioGroup", () => {
  const options = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium", description: "Some ups and downs are fine" },
    { value: "high", label: "High", disabled: true },
  ];

  it("groups radios under the legend", () => {
    render(<RadioGroup legend="How much risk feels okay?" options={options} />);
    expect(screen.getByRole("group", { name: "How much risk feels okay?" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("selects one option at a time and reports changes", async () => {
    const onChange = vi.fn();
    render(<RadioGroup legend="Risk" options={options} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("Low"));
    await userEvent.click(screen.getByLabelText("Medium"));
    expect(screen.getByLabelText("Medium")).toBeChecked();
    expect(screen.getByLabelText("Low")).not.toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith("medium");
  });

  it("links option descriptions", () => {
    render(<RadioGroup legend="Risk" options={options} />);
    expect(screen.getByLabelText("Medium")).toHaveAccessibleDescription("Some ups and downs are fine");
  });

  it("respects controlled value", async () => {
    render(<RadioGroup legend="Risk" options={options} value="low" />);
    await userEvent.click(screen.getByLabelText("Medium"));
    expect(screen.getByLabelText("Low")).toBeChecked();
  });

  it("keeps disabled options unselectable", async () => {
    render(<RadioGroup legend="Risk" options={options} />);
    expect(screen.getByLabelText("High")).toBeDisabled();
  });
});

describe("Switch", () => {
  it("exposes role=switch with its label and toggles", async () => {
    const onChange = vi.fn();
    render(<Switch label="Booking reminders" onChange={onChange} />);
    const sw = screen.getByRole("switch", { name: "Booking reminders" });
    expect(sw).toHaveAttribute("aria-checked", "false");
    await userEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByText("On")).toBeInTheDocument();
  });

  it("does nothing when disabled", async () => {
    const onChange = vi.fn();
    render(<Switch label="Email" disabled onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("stays on the controlled value", async () => {
    render(<Switch label="Email" checked={false} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });
});

describe("Select", () => {
  it("labels the native select and shows a placeholder", () => {
    render(
      <Select
        label="Language"
        placeholder="Choose a language"
        defaultValue=""
        options={[
          { value: "en", label: "English" },
          { value: "ml", label: "Malayalam" },
        ]}
      />,
    );
    const select = screen.getByRole("combobox", { name: "Language" });
    expect(select).toHaveValue("");
    expect(screen.getByRole("option", { name: "Choose a language" })).toBeDisabled();
  });

  it("marks errors", () => {
    render(<Select label="Advisor" options={[]} error="Choose an advisor to continue." />);
    expect(screen.getByRole("combobox")).toHaveAccessibleDescription("Choose an advisor to continue.");
  });
});

describe("Tabs", () => {
  const items = [
    { id: "week", label: "Week", content: "Week view" },
    { id: "month", label: "Month", content: "Month view" },
    { id: "year", label: "Year", content: "Year view", disabled: true },
    { id: "all", label: "All time", content: "All view" },
  ];

  it("shows the first tab's panel and links tab ↔ panel", () => {
    render(<Tabs label="Period" items={items} />);
    const tab = screen.getByRole("tab", { name: "Week" });
    expect(tab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Week" })).toHaveTextContent("Week view");
  });

  it("uses a single tab stop (roving tabindex)", () => {
    render(<Tabs label="Period" items={items} />);
    const tabIndexes = screen.getAllByRole("tab").map((t) => t.getAttribute("tabindex"));
    expect(tabIndexes).toEqual(["0", "-1", "-1", "-1"]);
  });

  it("moves with arrow keys, skips disabled tabs, wraps, and supports Home/End", () => {
    render(<Tabs label="Period" items={items} />);
    const week = screen.getByRole("tab", { name: "Week" });
    week.focus();
    fireEvent.keyDown(week, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Month" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "All time" })).toHaveFocus(); // skipped disabled "Year"
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(week).toHaveFocus(); // wrapped
    fireEvent.keyDown(week, { key: "End" });
    expect(screen.getByRole("tab", { name: "All time" })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(week).toHaveAttribute("aria-selected", "true");
  });

  it("ignores unrelated keys", () => {
    render(<Tabs label="Period" items={items} />);
    const week = screen.getByRole("tab", { name: "Week" });
    fireEvent.keyDown(week, { key: "a" });
    expect(week).toHaveAttribute("aria-selected", "true");
  });
});

describe("Avatar", () => {
  it.each([
    ["Asha K. Menon", "AM"],
    ["ravi", "R"],
    ["  ", "?"],
  ])("initials(%j) = %s", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });

  it("is an image named after the person, or hidden when decorative", () => {
    const { rerender } = render(<Avatar name="Asha Menon" />);
    expect(screen.getByRole("img", { name: "Asha Menon" })).toHaveTextContent("AM");
    rerender(<Avatar name="Asha Menon" decorative />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

describe("StatCard", () => {
  it("shows the trend as words, with a decorative arrow", () => {
    render(
      <StatCard
        label="Spent this month"
        value="₹42,000"
        trend={{ direction: "down", text: "₹4,000 less than last month", sentiment: "positive" }}
      />,
    );
    expect(screen.getByText("₹4,000 less than last month")).toBeInTheDocument();
    expect(document.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("EmptyState", () => {
  it("renders heading at the requested level with one action", () => {
    render(
      <EmptyState
        title="No bookings yet"
        description="Book time with a consultant when you're ready."
        headingLevel={3}
        action={<Button>Find a consultant</Button>}
      />,
    );
    expect(screen.getByRole("heading", { level: 3, name: "No bookings yet" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Find a consultant" })).toBeInTheDocument();
  });
});

describe("Skeleton", () => {
  it("is hidden from assistive tech and renders the requested lines", () => {
    const { container } = render(<Skeleton lines={4} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild?.children).toHaveLength(4);
  });

  it("guards against invalid line counts", () => {
    const { container } = render(<Skeleton lines={-2} />);
    expect(container.firstElementChild?.children).toHaveLength(1);
  });
});

describe("BookingStatusBadge", () => {
  it.each([
    ["requested", "Requested"],
    ["confirmed", "Confirmed"],
    ["completed", "Completed"],
    ["cancelled", "Cancelled"],
  ] as const)("%s shows the word %s", (status, label) => {
    render(<BookingStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe("Dialog", () => {
  function Harness({ onClose = () => {} }: { onClose?: () => void }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Cancel booking</Button>
        <Dialog
          open={open}
          onClose={() => {
            onClose();
            setOpen(false);
          }}
          title="Cancel this booking?"
          description="Your consultant will be told. You can book again anytime."
          actions={<Button onClick={() => setOpen(false)}>Keep booking</Button>}
        />
      </>
    );
  }

  it("opens labelled by its title and described by its description", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel booking" }));
    const dialog = screen.getByRole("dialog", { name: "Cancel this booking?" });
    expect(dialog).toHaveAccessibleDescription("Your consultant will be told. You can book again anytime.");
  });

  it("closes on Esc (cancel event) and returns focus to the trigger", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const trigger = screen.getByRole("button", { name: "Cancel booking" });
    await userEvent.click(trigger);
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes from the labelled close button", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel booking" }));
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
