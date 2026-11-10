import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { EmptyState, buttonClasses } from "@investkea/ui";
import { PageLoading } from "@/components/page-loading";
import { requireUser } from "@/lib/auth/session";
import { listUserBookings } from "@/lib/data/bookings";
import { activeShareAdvisorIds } from "@/lib/data/shares";
import { SharingToggle } from "./sharing-toggle";

export const metadata: Metadata = { title: "Data sharing — InvestKea" };

export default function SharingPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="type-h1 text-fg">Data sharing</h1>
        <p className="type-body-lg text-fg-secondary">
          Choose which consultants can see your goals, cash flow and holdings. They can only view, never
          change. Turning sharing off takes effect immediately.
        </p>
      </header>
      <Suspense fallback={<PageLoading label="Loading sharing settings" />}>
        <Sharing />
      </Suspense>
    </div>
  );
}

async function Sharing() {
  const { supabase, userId } = await requireUser("/app/sharing");
  const [bookings, shared] = await Promise.all([
    listUserBookings(supabase, userId),
    activeShareAdvisorIds(supabase, userId),
  ]);
  // Consultants you've booked; each listed once.
  const advisors = Array.from(
    new Map(bookings.filter((b) => b.advisor.id).map((b) => [b.advisor.id, b.advisor])).values(),
  );

  if (advisors.length === 0) {
    return (
      <EmptyState
        title="Nobody to share with yet"
        description="You can share your data with consultants you've booked a session with."
        action={
          <Link href="/app/consultants" className={buttonClasses("primary", "md")}>
            Find a consultant
          </Link>
        }
      />
    );
  }
  return (
    <div className="divide-y divide-line rounded-lg border border-line bg-surface px-4 shadow-1">
      {advisors.map((a) => (
        <SharingToggle
          key={a.id}
          advisorId={a.id}
          advisorName={a.name}
          credential={a.credential}
          shared={shared.has(a.id)}
        />
      ))}
    </div>
  );
}
