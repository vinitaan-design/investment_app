"use client";

import { useState } from "react";
import { Alert, Input, formatINR } from "@investkea/ui";
import { GoalInputError, planGoal, type GoalInput, type GoalResult } from "@/lib/goal-calculator";

interface FieldState {
  presentCost: string;
  years: string;
  inflation: string;
  growth: string;
  currentSavings: string;
}

// Starting values are examples for the form, not recommendations.
const initial: FieldState = {
  presentCost: "1000000",
  years: "10",
  inflation: "6",
  growth: "7",
  currentSavings: "0",
};

/** Maps calculator fields to form fields so errors land on the right input. */
const fieldFor: Record<keyof GoalInput, keyof FieldState> = {
  presentCost: "presentCost",
  years: "years",
  inflationRate: "inflation",
  expectedAnnualReturn: "growth",
  currentSavings: "currentSavings",
};

/** Empty input becomes NaN (not 0) so the user is told the field is missing. */
function parse(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

type Outcome = { result: GoalResult } | { error: { field: keyof FieldState; message: string } };

export function compute(f: FieldState): Outcome {
  try {
    return {
      result: planGoal({
        presentCost: parse(f.presentCost),
        years: parse(f.years),
        inflationRate: parse(f.inflation) / 100,
        expectedAnnualReturn: parse(f.growth) / 100,
        currentSavings: f.currentSavings.trim() === "" ? 0 : Number(f.currentSavings),
      }),
    };
  } catch (e) {
    if (e instanceof GoalInputError) {
      return { error: { field: fieldFor[e.field], message: e.message } };
    }
    throw e;
  }
}

export function GoalPlanner() {
  const [fields, setFields] = useState<FieldState>(initial);
  const set = (key: keyof FieldState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const outcome = compute(fields);
  const errorFor = (key: keyof FieldState) =>
    "error" in outcome && outcome.error.field === key ? outcome.error.message : undefined;

  const numberProps = { type: "number", inputMode: "decimal" as const, min: 0 };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form
        noValidate
        aria-label="Goal details"
        className="space-y-5 rounded-lg border border-line bg-surface p-6 shadow-1"
        onSubmit={(e) => e.preventDefault()}
      >
        <Input
          {...numberProps}
          label="Goal cost today"
          prefix="₹"
          value={fields.presentCost}
          onChange={set("presentCost")}
          error={errorFor("presentCost")}
        />
        <Input
          {...numberProps}
          label="Years until goal"
          value={fields.years}
          onChange={set("years")}
          error={errorFor("years")}
        />
        <Input
          {...numberProps}
          label="Expected inflation"
          suffix="% a year"
          helper="Education and healthcare costs often rise faster than general prices."
          value={fields.inflation}
          onChange={set("inflation")}
          error={errorFor("inflation")}
        />
        <Input
          {...numberProps}
          label="Expected growth of your savings"
          suffix="% a year"
          helper="Your own assumption. Use 0 if the money will stay in a savings account."
          value={fields.growth}
          onChange={set("growth")}
          error={errorFor("growth")}
        />
        <Input
          {...numberProps}
          label="Already saved for this goal"
          prefix="₹"
          value={fields.currentSavings}
          onChange={set("currentSavings")}
          error={errorFor("currentSavings")}
        />
      </form>

      <section aria-live="polite" aria-label="Your plan" className="space-y-5 rounded-lg bg-brand-subtle p-6">
        {"error" in outcome ? (
          <Alert tone="info" title="We need one more detail">
            {outcome.error.message} Your plan will update as soon as you do.
          </Alert>
        ) : (
          <>
            <div className="space-y-1">
              <p className="type-body-sm text-fg-secondary">Estimated cost in {fields.years} years</p>
              <p className="type-numeric-hero text-fg">{formatINR(outcome.result.futureCost)}</p>
            </div>
            <div className="space-y-1">
              <p className="type-body-sm text-fg-secondary">Set aside each month</p>
              <p className="type-numeric-hero text-fg-brand" data-testid="monthly-saving">
                {formatINR(outcome.result.monthlySaving)}
              </p>
            </div>
            <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 type-body">
              <dt className="text-fg-secondary">Your savings could grow to</dt>
              <dd className="text-right tabular-nums">{formatINR(outcome.result.futureValueOfSavings)}</dd>
              <dt className="text-fg-secondary">Gap to close</dt>
              <dd className="text-right tabular-nums">{formatINR(outcome.result.shortfall)}</dd>
            </dl>
            <p className="type-caption text-fg-tertiary">
              Estimates only, based on the rates you entered. Actual inflation and growth will differ.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
