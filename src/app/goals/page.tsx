import type { Metadata } from "next";
import { GoalPlanner } from "@/components/goal-planner";

export const metadata: Metadata = { title: "Goal planner — InvestKea" };

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <header className="max-w-2xl space-y-2">
        <h1 className="font-display text-3xl">Goal planner</h1>
        <p className="text-muted">
          Enter a goal in today&apos;s money. We&apos;ll show what it may cost in the future and a monthly
          amount that could get you there. All rates are your own assumptions.
        </p>
      </header>
      <GoalPlanner />
    </div>
  );
}
