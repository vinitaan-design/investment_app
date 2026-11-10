import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Alert, BookingStatusBadge, List, ListRow, StatCard, buttonClasses } from "@investkea/ui";
import { PageLoading } from "@/components/page-loading";
import { requireAdvisor } from "@/lib/auth/advisor";
import { listAdvisorBookings } from "@/lib/data/bookings";
import { activeShareClientIds } from "@/lib/data/shares";
import { upcomingSessions } from "@/lib/bookings-view";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Advisor dashboard — InvestKea" };

export default function AdvisorDashboardPage() {
  return (
    <Suspense fallback={<PageLoading label="Loading your dashboard" />}>
      <Dashboard />
    </Suspense>
  );
}

const statusMessages = {
  pending: {
    tone: "info" as const,
    title: "Your application is being checked",
    body: "We're verifying your registration. You'll appear to users once it's approved; there's nothing else you need to do.",
  },
  rejected: {
    tone: "warning" as const,
    title: "We couldn't verify your registration",
    body: "Check that your credential and registration number are correct, then contact us to try again.",
  },
  suspended: {
    tone: "warning" as const,
    title: "Your profile is paused",
    body: "You're hidden from users and can't take new requests. Contact us to resolve this.",
  },
};

async function Dashboard() {
  const { supabase, userId, advisor } = await requireAdvisor("/advisor", { verified: false });

  if (advisor.status !== "verified") {
    const m = statusMessages[advisor.status];
    return (
      <div className="max-w-xl space-y-6">
        <h1 className="type-h1 text-fg">Advisor portal</h1>
        <Alert tone={m.tone} title={m.title}>
          {m.body}
        </Alert>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 type-body">
          <dt className="text-fg-secondary">Name</dt>
          <dd className="text-fg">{advisor.display_name}</dd>
          <dt className="text-fg-secondary">Credential</dt>
          <dd className="text-fg">{advisor.credential_type}</dd>
          <dt className="text-fg-secondary">Registration no.</dt>
          <dd className="text-fg tabular-nums">{advisor.registration_number}</dd>
        </dl>
      </div>
    );
  }

  const [bookings, sharing] = await Promise.all([
    listAdvisorBookings(supabase, userId),
    activeShareClientIds(supabase, userId),
  ]);
  const open = bookings.filter((b) => b.status === "requested");
  const upcoming = upcomingSessions(bookings, new Date());
  const clientCount = new Set(bookings.map((b) => b.client.id)).size;

  return (
    <div className="space-y-8">
      <h1 className="type-h1 text-fg">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open requests" value={String(open.length)} context="Waiting for your reply" />
        <StatCard
          label="Upcoming sessions"
          value={String(upcoming.length)}
          context="Confirmed, not yet held"
        />
        <StatCard
          label="Clients"
          value={String(clientCount)}
          context={`${sharing.size} sharing their data`}
        />
      </div>

      <section aria-labelledby="next-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="next-heading" className="type-h2 text-fg">
            Next sessions
          </h2>
          {open.length > 0 && (
            <Link href="/advisor/requests" className={buttonClasses("primary", "md")}>
              Reply to {open.length} {open.length === 1 ? "request" : "requests"}
            </Link>
          )}
        </div>
        {upcoming.length === 0 ? (
          <p className="type-body text-fg-secondary">No confirmed sessions coming up.</p>
        ) : (
          <div className="rounded-lg border border-line bg-surface px-4 shadow-1">
            <List label="Next sessions">
              {upcoming.slice(0, 5).map((b) => (
                <ListRow
                  key={b.id}
                  title={b.client.name}
                  subtitle={`${b.topic ?? "Session"} · ${formatDateTime(b.startsAt)}`}
                  trailing={<BookingStatusBadge status={b.status} />}
                />
              ))}
            </List>
          </div>
        )}
      </section>
    </div>
  );
}
