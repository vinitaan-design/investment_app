import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { safeNextPath } from "@/lib/auth/safe-next";
import { getProfile, hasCompletedOnboarding, homeFor, requireSession } from "@/lib/auth/session";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Welcome — InvestKea" };

export default function OnboardingPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <header className="space-y-2">
        <h1 className="type-h1 text-fg">Welcome to InvestKea</h1>
        <p className="type-body-lg text-fg-secondary">Two quick confirmations before you start.</p>
      </header>
      <Suspense fallback={<div className="h-80 rounded-lg bg-surface shadow-1" aria-hidden />}>
        <Onboarding searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Onboarding({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next: rawNext } = await searchParams;
  const session = await requireSession("/onboarding");
  const profile = await getProfile(session);
  const next = safeNextPath(rawNext, homeFor(profile.role));
  if (hasCompletedOnboarding(profile)) redirect(next);
  return <OnboardingForm defaultName={profile.full_name ?? ""} next={next} />;
}
