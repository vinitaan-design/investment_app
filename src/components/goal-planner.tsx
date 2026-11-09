"use client";

import { useId, useState } from "react";
import { GoalInputError, formatINR, planGoal, type GoalResult } from "@/lib/goal-calculator";

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

function compute(f: FieldState): { result?: GoalResult; error?: string } {
  try {
    return {
      result: planGoal({
        presentCost: Number(f.presentCost),
        years: Number(f.years),
        inflationRate: Number(f.inflation) / 100,
        expectedAnnualReturn: Number(f.growth) / 100,
        currentSavings: Number(f.currentSavings || 0),
      }),
    };
  } catch (e) {
    if (e instanceof GoalInputError) return { error: e.message };
    throw e;
  }
}

function Field(props: {
  label: string;
  hint?: string;
  value: string;
  suffix?: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {props.label}
      </label>
      <div className="flex items-center rounded-xl border border-border bg-surface focus-within:border-primary">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className="w-full rounded-xl bg-transparent px-3 py-2 outline-none"
        />
        {props.suffix && <span className="pr-3 text-sm text-muted">{props.suffix}</span>}
      </div>
      {props.hint && <p className="text-xs text-muted">{props.hint}</p>}
    </div>
  );
}

export function GoalPlanner() {
  const [fields, setFields] = useState<FieldState>(initial);
  const set = (key: keyof FieldState) => (v: string) => setFields((f) => ({ ...f, [key]: v }));
  const { result, error } = compute(fields);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form
        className="space-y-4 rounded-2xl border border-border bg-surface p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <Field label="Goal cost today" suffix="₹" value={fields.presentCost} onChange={set("presentCost")} />
        <Field label="Years until goal" value={fields.years} onChange={set("years")} />
        <Field
          label="Expected inflation"
          suffix="% / yr"
          hint="Education and healthcare often rise faster than general prices."
          value={fields.inflation}
          onChange={set("inflation")}
        />
        <Field
          label="Expected growth of your savings"
          suffix="% / yr"
          hint="Your own assumption. Use 0 if the money will sit in a savings account."
          value={fields.growth}
          onChange={set("growth")}
        />
        <Field
          label="Already saved for this goal"
          suffix="₹"
          value={fields.currentSavings}
          onChange={set("currentSavings")}
        />
      </form>

      <section aria-live="polite" className="space-y-4 rounded-2xl bg-primary-soft p-6">
        {error ? (
          <p role="alert" className="text-error">
            {error}
          </p>
        ) : result ? (
          <>
            <div>
              <p className="text-sm text-muted">Estimated cost in {fields.years} years</p>
              <p className="font-display text-3xl">{formatINR(result.futureCost)}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Set aside each month</p>
              <p className="font-display text-3xl text-primary" data-testid="monthly-saving">
                {formatINR(result.monthlySaving)}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted">Your savings could grow to</dt>
              <dd className="text-right">{formatINR(result.futureValueOfSavings)}</dd>
              <dt className="text-muted">Gap to close</dt>
              <dd className="text-right">{formatINR(result.shortfall)}</dd>
            </dl>
            <p className="text-xs text-muted">
              Estimates only, based on the rates you entered. Actual inflation and growth will differ.
            </p>
          </>
        ) : null}
      </section>
    </div>
  );
}
