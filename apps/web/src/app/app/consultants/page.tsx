import type { Metadata } from "next";
import { Suspense } from "react";
import { ConsultantCard, EmptyState } from "@investkea/ui";
import { PageLoading } from "@/components/page-loading";
import { requireUser } from "@/lib/auth/session";
import { listVerifiedAdvisors } from "@/lib/data/advisors";
import { RequestSessionButton } from "./request-session";

export const metadata: Metadata = { title: "Consultants — InvestKea" };

export default function ConsultantsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="type-h1 text-fg">Consultants</h1>
        <p className="type-body-lg text-fg-secondary">
          Every consultant listed here has had their registration checked by InvestKea. Fees are agreed
          directly with them.
        </p>
      </header>
      <Suspense fallback={<PageLoading label="Loading consultants" />}>
        <Consultants />
      </Suspense>
    </div>
  );
}

async function Consultants() {
  const { supabase, userId } = await requireUser("/app/consultants");
  const advisors = (await listVerifiedAdvisors(supabase)).filter((a) => a.id !== userId);
  if (advisors.length === 0) {
    return (
      <EmptyState
        title="No consultants yet"
        description="Verified consultants will appear here as they join. Check back soon."
      />
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {advisors.map((a) => (
        <ConsultantCard
          key={a.id}
          headingLevel={2}
          name={a.display_name}
          credentialType={a.credential_type}
          registrationNumber={a.registration_number}
          languages={a.languages}
          bio={a.bio}
          verified
          action={<RequestSessionButton advisorId={a.id} advisorName={a.display_name} />}
        />
      ))}
    </div>
  );
}
