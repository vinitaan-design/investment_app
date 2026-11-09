import { describe, expect, it } from "vitest";
import { GoalInputError, formatINR, inflate, monthlyContribution, planGoal } from "./goal-calculator";

describe("inflate", () => {
  it("compounds annually", () => {
    expect(inflate(100, 0.1, 2)).toBeCloseTo(121, 6);
  });

  it("returns the same cost with zero inflation", () => {
    expect(inflate(500000, 0, 10)).toBe(500000);
  });
});

describe("monthlyContribution", () => {
  it("splits evenly when growth is zero", () => {
    expect(monthlyContribution(120000, 0, 12)).toBe(10000);
  });

  it("needs less per month when savings grow", () => {
    expect(monthlyContribution(120000, 0.08, 12)).toBeLessThan(10000);
  });

  it("reaches the target when compounded forward", () => {
    const target = 1_000_000;
    const months = 60;
    const annual = 0.08;
    const pmt = monthlyContribution(target, annual, months);
    const r = Math.pow(1 + annual, 1 / 12) - 1;
    let balance = 0;
    for (let m = 0; m < months; m++) balance = balance * (1 + r) + pmt;
    expect(balance).toBeCloseTo(target, 2);
  });

  it("returns 0 when nothing is needed", () => {
    expect(monthlyContribution(0, 0.08, 12)).toBe(0);
  });
});

describe("planGoal", () => {
  // Given a ₹10L goal in 10 years at 6% inflation
  // When the user has no savings and assumes 0% growth
  // Then the future cost is ~₹17.9L and monthly saving is future cost / 120
  it("handles the zero-growth case", () => {
    const result = planGoal({
      presentCost: 1_000_000,
      years: 10,
      inflationRate: 0.06,
      expectedAnnualReturn: 0,
    });
    expect(result.futureCost).toBeCloseTo(1_790_847.7, 0);
    expect(result.shortfall).toBeCloseTo(result.futureCost, 6);
    expect(result.monthlySaving).toBeCloseTo(result.futureCost / 120, 6);
  });

  it("reports no shortfall when savings already cover the goal", () => {
    const result = planGoal({
      presentCost: 100_000,
      years: 5,
      inflationRate: 0.05,
      expectedAnnualReturn: 0.07,
      currentSavings: 200_000,
    });
    expect(result.shortfall).toBe(0);
    expect(result.monthlySaving).toBe(0);
  });

  it.each([
    [{ presentCost: 0 }],
    [{ years: 0 }],
    [{ years: 61 }],
    [{ inflationRate: -0.01 }],
    [{ expectedAnnualReturn: 0.5 }],
    [{ currentSavings: -1 }],
    [{ presentCost: Number.NaN }],
  ])("rejects invalid input %o", (override) => {
    const base = { presentCost: 100_000, years: 5, inflationRate: 0.06, expectedAnnualReturn: 0.08 };
    expect(() => planGoal({ ...base, ...override })).toThrow(GoalInputError);
  });
});

describe("GoalInputError", () => {
  it("names the field that failed", () => {
    try {
      planGoal({ presentCost: 100, years: 5, inflationRate: 0.4, expectedAnnualReturn: 0.05 });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(GoalInputError);
      expect((e as GoalInputError).field).toBe("inflationRate");
    }
  });
});

describe("formatINR", () => {
  it("uses Indian digit grouping", () => {
    expect(formatINR(1234567)).toContain("12,34,567");
  });
});
