import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageLoading } from "@/components/page-loading";
import { requireUser } from "@/lib/auth/session";
import { getOwnAdvisor } from "@/lib/data/advisors";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = { title: "Become a consultant — InvestKea" };

export default function BecomeConsultantPage() {
  return (
    <div className="max-w-xl space-y-6">
      <header className="space-y-2">
        <h1 className="type-h1 text-fg">Offer sessions on InvestKea</h1>
        <p className="type-body-lg text-fg-secondary">
          We check every registration before you appear to users. Clients see your credential and registration
          number on your profile.
        </p>
      </header>
      <Suspense fallback={<PageLoading label="Loading" />}>
        <Apply />
      </Suspense>
    </div>
  );
}

async function Apply() {
  const { supabase, userId, profile } = await requireUser("/app/become-a-consultant");
  const existing = await getOwnAdvisor(supabase, userId);
  if (existing) redirect("/advisor");
  return <ApplyForm defaultName={profile.full_name ?? ""} />;
}
