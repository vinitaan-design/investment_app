// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Alert, Badge, Button, GoalCard, Input, ProgressBar, toPercent } from "@/components/ui";

describe("Button", () => {
  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("calls onClick when enabled", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled and busy while loading, and ignores clicks", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("uses disabled styling instead of the variant colour when disabled", () => {
    render(
      <Button variant="danger" disabled>
        Delete
      </Button>,
    );
    const cls = screen.getByRole("button").className;
    expect(cls).toContain("bg-disabled");
    expect(cls).not.toContain("bg-danger-subtle");
  });

  it.each([
    ["lg", "h-13"],
    ["md", "h-11"],
  ] as const)("size %s meets the 44px+ touch target (%s)", (size, cls) => {
    render(<Button size={size}>Go</Button>);
    expect(screen.getByRole("button").className).toContain(cls);
  });
});

describe("Input", () => {
  it("links the visible label to the field", () => {
    render(<Input label="Goal cost today" />);
    expect(screen.getByLabelText("Goal cost today")).toBeInTheDocument();
  });

  it("announces helper text as the description", () => {
    render(<Input label="Inflation" helper="Your own assumption." />);
    expect(screen.getByLabelText("Inflation")).toHaveAccessibleDescription("Your own assumption.");
  });

  it("marks the field invalid and replaces helper with the error", () => {
    render(<Input label="Years" helper="How long until the goal." error="Enter a number above 0." />);
    const field = screen.getByLabelText("Years");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Enter a number above 0.");
    expect(screen.queryByText("How long until the goal.")).not.toBeInTheDocument();
  });

  it("has no description or invalid state when neither helper nor error is set", () => {
    render(<Input label="Name" />);
    const field = screen.getByLabelText("Name");
    expect(field).not.toHaveAttribute("aria-describedby");
    expect(field).not.toHaveAttribute("aria-invalid");
  });

  it("keeps ids unique across instances", () => {
    render(
      <>
        <Input label="A" helper="a" />
        <Input label="B" helper="b" />
      </>,
    );
    expect(screen.getByLabelText("A").id).not.toBe(screen.getByLabelText("B").id);
  });

  it("hides decorative prefix/suffix from assistive tech", () => {
    render(<Input label="Cost" prefix="₹" suffix="% a year" />);
    expect(screen.getByText("₹")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("% a year")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("Badge", () => {
  it("renders its text label", () => {
    render(<Badge tone="success">On track</Badge>);
    expect(screen.getByText("On track")).toBeInTheDocument();
  });
});

describe("Alert", () => {
  it.each([
    ["danger", "alert"],
    ["warning", "alert"],
    ["info", "status"],
    ["success", "status"],
  ] as const)("%s alerts use role=%s", (tone, role) => {
    render(<Alert tone={tone} title="Title" />);
    expect(screen.getByRole(role)).toHaveTextContent("Title");
  });

  it("renders title and body", () => {
    render(
      <Alert tone="info" title="We couldn't connect">
        Your data is safe. Try again in a minute.
      </Alert>,
    );
    expect(screen.getByText("We couldn't connect")).toBeInTheDocument();
    expect(screen.getByText("Your data is safe. Try again in a minute.")).toBeInTheDocument();
  });
});

describe("toPercent", () => {
  it.each([
    [50, 100, 50],
    [150, 100, 100],
    [-5, 100, 0],
    [10, 0, 0],
    [10, -1, 0],
    [Number.NaN, 100, 0],
    [1, 3, 33],
  ])("toPercent(%s, %s) = %s", (value, max, expected) => {
    expect(toPercent(value, max)).toBe(expected);
  });
});

describe("ProgressBar", () => {
  it("exposes an accessible name and clamped value", () => {
    render(<ProgressBar value={120} max={100} label="Emergency fund progress" />);
    const bar = screen.getByRole("progressbar", { name: "Emergency fund progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "100");
  });
});

describe("GoalCard", () => {
  it("shows saved vs target, percent, status and on-track date", () => {
    render(
      <GoalCard
        title="Emergency fund"
        saved={188000}
        target={300000}
        status="on-track"
        onTrackDate={new Date(2027, 5, 1)}
      />,
    );
    expect(screen.getByRole("heading", { name: "Emergency fund" })).toBeInTheDocument();
    expect(screen.getByText(/1,88,000/)).toBeInTheDocument();
    expect(screen.getByText(/3,00,000/)).toBeInTheDocument();
    expect(screen.getByText("63%")).toBeInTheDocument();
    expect(screen.getByText("On track")).toBeInTheDocument();
    expect(screen.getByText(/On track for Jun 2027/)).toBeInTheDocument();
  });

  it("hides the on-track date once the goal is reached", () => {
    render(
      <GoalCard title="Laptop" saved={90000} target={80000} status="achieved" onTrackDate={new Date()} />,
    );
    expect(screen.getByText("Reached")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.queryByText(/On track for/)).not.toBeInTheDocument();
  });

  it("ignores an invalid date instead of rendering 'Invalid Date'", () => {
    render(
      <GoalCard title="Trip" saved={1} target={10} status="behind" onTrackDate={new Date("not a date")} />,
    );
    expect(screen.queryByText(/On track for/)).not.toBeInTheDocument();
    expect(screen.getByText("Needs attention")).toBeInTheDocument();
  });
});
