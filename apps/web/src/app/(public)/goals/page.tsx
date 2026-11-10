import type { Metadata } from "next";
import { GoalPlanner } from "@/components/goal-planner";

export const metadata: Metadata = { title: "Goal planner — InvestKea" };

export default function GoalsPage() {
  return (
    <div className="space-y-8">
      <header className="max-w-2xl space-y-2">
        <h1 className="type-h1 text-fg">Goal planner</h1>
        <p className="type-body-lg text-fg-secondary">
          Enter a goal in today&apos;s money. You&apos;ll see what it may cost in the future and a monthly
          amount that could get you there. Every rate is your own assumption.
        </p>
      </header>
      <GoalPlanner />
    </div>
  );
}
