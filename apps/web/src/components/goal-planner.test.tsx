// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { GoalPlanner, compute } from "./goal-planner";

const valid = { presentCost: "1000000", years: "10", inflation: "6", growth: "0", currentSavings: "0" };

describe("compute", () => {
  it("returns a result for valid input", () => {
    const out = compute(valid);
    expect("result" in out && out.result.futureCost).toBeCloseTo(1_790_847.7, 0);
  });

  it("treats an empty required field as missing, not zero growth", () => {
    const out = compute({ ...valid, growth: "" });
    expect(out).toEqual({ error: { field: "growth", message: expect.stringContaining("growth rate") } });
  });

  it("treats empty savings as ₹0", () => {
    expect("result" in compute({ ...valid, currentSavings: "" })).toBe(true);
  });

  it("maps calculator field names to form field names", () => {
    const out = compute({ ...valid, inflation: "50" });
    expect("error" in out && out.error.field).toBe("inflation");
  });
});

describe("GoalPlanner", () => {
  it("shows the monthly amount for the default example", () => {
    render(<GoalPlanner />);
    expect(screen.getByTestId("monthly-saving").textContent).toMatch(/₹/);
  });

  // Given years = 0, When results update, Then the years field shows the error and no result.
  it("puts the error on the field that caused it", async () => {
    render(<GoalPlanner />);
    const years = screen.getByLabelText("Years until goal");
    await userEvent.clear(years);
    await userEvent.type(years, "0");

    expect(years).toHaveAttribute("aria-invalid", "true");
    expect(years).toHaveAccessibleDescription("Enter a number of years above 0, up to 60.");
    expect(screen.queryByTestId("monthly-saving")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Goal cost today")).not.toHaveAttribute("aria-invalid");
  });

  it("recovers when the input is fixed", async () => {
    render(<GoalPlanner />);
    const years = screen.getByLabelText("Years until goal");
    await userEvent.clear(years);
    await userEvent.type(years, "5");
    expect(years).not.toHaveAttribute("aria-invalid");
    expect(screen.getByTestId("monthly-saving")).toBeInTheDocument();
  });
});
