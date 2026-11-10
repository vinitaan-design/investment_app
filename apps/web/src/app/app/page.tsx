import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  BookingStatusBadge,
  DataTable,
  EmptyState,
  List,
  ListRow,
  buttonClasses,
  formatINR,
} from "@investkea/ui";
import { PageLoading } from "@/components/page-loading";
import { requireUser } from "@/lib/auth/session";
import { listUserBookings } from "@/lib/data/bookings";
import { listGoals } from "@/lib/data/finances";
import { formatDateTime } from "@/lib/format";
import { planGoal } from "@/lib/goal-calculator";

export const metadata: Metadata = { title: "Overview — InvestKea" };

export default function OverviewPage() {
  return (
    <Suspense fallback={<PageLoading label="Loading your overview" />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const { supabase, userId, profile } = await requireUser("/app");
  const [goals, bookings] = await Promise.all([
    listGoals(supabase, userId),
    listUserBookings(supabase, userId),
  ]);
  const upcoming = bookings.filter((b) => b.status === "requested" || b.status === "confirmed").slice(0, 3);
  const thisYear = new Date().getFullYear();

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="type-h1 text-fg">
          Hello{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="type-body-lg text-fg-secondary">Here&apos;s where your plans stand.</p>
      </header>

      <section aria-labelledby="goals-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="goals-heading" className="type-h2 text-fg">
            Your goals
          </h2>
          <Link href="/goals" className={buttonClasses("secondary", "md")}>
            Plan a new goal
          </Link>
        </div>
        <DataTable
          caption="Saved goals"
          hideCaption
          rows={goals}
          rowKey={(g) => g.id}
          empty={
            <EmptyState
              headingLevel={3}
              title="No goals saved yet"
              description="Use the goal planner to see what a goal will really cost, then save it here."
              action={
                <Link href="/goals" className={buttonClasses("primary", "md")}>
                  Open the goal planner
                </Link>
              }
            />
          }
          columns={[
            { key: "name", header: "Goal", cell: (g) => g.name, isRowHeader: true },
            { key: "year", header: "Target year", cell: (g) => g.target_year, align: "end" },
            { key: "cost", header: "Cost today", cell: (g) => formatINR(g.present_cost), align: "end" },
            {
              key: "monthly",
              header: "Set aside monthly",
              align: "end",
              cell: (g) => {
                const years = g.target_year - thisYear;
                if (years <= 0) return "Target year reached";
                return formatINR(
                  planGoal({
                    presentCost: g.present_cost,
                    years,
                    inflationRate: g.inflation_rate,
                    expectedAnnualReturn: g.expected_return,
                    currentSavings: g.current_savings,
                  }).monthlySaving,
                );
              },
            },
          ]}
        />
      </section>

      <section aria-labelledby="sessions-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="sessions-heading" className="type-h2 text-fg">
            Upcoming sessions
          </h2>
          <Link href="/app/consultants" className={buttonClasses("secondary", "md")}>
            Find a consultant
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="type-body text-fg-secondary">No sessions booked.</p>
        ) : (
          <div className="rounded-lg border border-line bg-surface px-4 shadow-1">
            <List label="Upcoming sessions">
              {upcoming.map((b) => (
                <ListRow
                  key={b.id}
                  title={b.advisor.name}
                  subtitle={`${b.topic ?? "Session"} · ${formatDateTime(b.startsAt)}`}
                  trailing={<BookingStatusBadge status={b.status} />}
                />
              ))}
            </List>
          </div>
        )}
      </section>

      {profile.role === "user" && (
        <p className="type-body-sm text-fg-secondary">
          Are you a registered consultant?{" "}
          <Link href="/app/become-a-consultant" className="text-fg-brand underline underline-offset-2">
            Apply to offer sessions
          </Link>
        </p>
      )}
    </div>
  );
}
