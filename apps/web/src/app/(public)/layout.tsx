import Link from "next/link";
import { Suspense } from "react";
import { HeaderAccount } from "@/components/header-account";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="border-b border-line bg-surface">
        <nav
          aria-label="Main"
          className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 md:px-6"
        >
          <Link href="/" className="type-h3 text-fg-brand">
            InvestKea
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/goals" className="type-label text-fg-secondary hover:text-fg-brand">
              Goal planner
            </Link>
            {/* Reading the session is request-time work, so it streams in after the static shell. */}
            <Suspense fallback={<span className="inline-block h-11 w-20" aria-hidden />}>
              <HeaderAccount />
            </Suspense>
          </div>
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-5 py-10 md:px-6">
        {children}
      </main>
      <footer className="mx-auto max-w-5xl space-y-2 px-5 pb-10 md:px-6">
        <p className="type-body-sm text-fg-secondary">
          InvestKea provides general information and planning tools only. It does not recommend or sell any
          financial product and is not investment advice.
        </p>
        <Link href="/privacy" className="type-body-sm text-fg-brand underline underline-offset-2">
          Privacy notice
        </Link>
      </footer>
    </>
  );
}
