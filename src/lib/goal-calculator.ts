/**
 * Inflation-adjusted goal planner.
 *
 * Pure functions only — no I/O — so they are cheap to unit test.
 * All rates are annual decimals (0.06 = 6%). The user supplies every rate;
 * the app never assumes a return for a specific financial product.
 */

export interface GoalInput {
  /** Cost of the goal in today's money (₹). */
  presentCost: number;
  /** Years until the goal. */
  years: number;
  /** Expected annual inflation for this goal, e.g. 0.06. */
  inflationRate: number;
  /** User's own assumption for annual growth of their savings, e.g. 0.08. */
  expectedAnnualReturn: number;
  /** Amount already saved towards this goal (₹). */
  currentSavings?: number;
}

export interface GoalResult {
  /** What the goal will cost in the target year. */
  futureCost: number;
  /** What current savings grow to by the target year. */
  futureValueOfSavings: number;
  /** Remaining gap after current savings. Never negative. */
  shortfall: number;
  /** Monthly amount to set aside from now to close the gap. */
  monthlySaving: number;
}

export class GoalInputError extends Error {}

function assertValid(input: GoalInput): void {
  const { presentCost, years, inflationRate, expectedAnnualReturn } = input;
  const currentSavings = input.currentSavings ?? 0;
  const numbers = [presentCost, years, inflationRate, expectedAnnualReturn, currentSavings];
  if (numbers.some((n) => !Number.isFinite(n))) {
    throw new GoalInputError("All values must be numbers.");
  }
  if (presentCost <= 0) throw new GoalInputError("Goal cost must be greater than 0.");
  if (years <= 0 || years > 60) throw new GoalInputError("Years must be between 0 and 60.");
  if (currentSavings < 0) throw new GoalInputError("Current savings cannot be negative.");
  if (inflationRate < 0 || inflationRate > 0.3) {
    throw new GoalInputError("Inflation must be between 0% and 30%.");
  }
  if (expectedAnnualReturn < 0 || expectedAnnualReturn > 0.3) {
    throw new GoalInputError("Expected growth must be between 0% and 30%.");
  }
}

/** Cost of something in the future, given today's price and inflation. */
export function inflate(presentCost: number, inflationRate: number, years: number): number {
  return presentCost * Math.pow(1 + inflationRate, years);
}

/**
 * Monthly contribution needed to reach `target` in `months`,
 * growing at an effective monthly rate equivalent to `annualRate`.
 * Contributions are made at the end of each month.
 */
export function monthlyContribution(target: number, annualRate: number, months: number): number {
  if (target <= 0) return 0;
  if (annualRate === 0) return target / months;
  const r = Math.pow(1 + annualRate, 1 / 12) - 1;
  return (target * r) / (Math.pow(1 + r, months) - 1);
}

export function planGoal(input: GoalInput): GoalResult {
  assertValid(input);
  const currentSavings = input.currentSavings ?? 0;
  const futureCost = inflate(input.presentCost, input.inflationRate, input.years);
  const futureValueOfSavings = currentSavings * Math.pow(1 + input.expectedAnnualReturn, input.years);
  const shortfall = Math.max(0, futureCost - futureValueOfSavings);
  const monthlySaving = monthlyContribution(
    shortfall,
    input.expectedAnnualReturn,
    Math.round(input.years * 12),
  );
  return { futureCost, futureValueOfSavings, shortfall, monthlySaving };
}

/** Format rupees in Indian digit grouping, no decimals. */
export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
