import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "InvestKea — calm, clear money planning",
  description:
    "Plan your financial goals with inflation in mind, track your money, and talk to a verified consultant.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <header className="border-b border-line bg-surface">
          <nav
            aria-label="Main"
            className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-6"
          >
            <Link href="/" className="type-h3 text-fg-brand">
              InvestKea
            </Link>
            <Link href="/goals" className="type-label text-fg-secondary hover:text-fg-brand">
              Goal planner
            </Link>
          </nav>
        </header>
        <main id="main" className="mx-auto max-w-5xl px-5 py-10 md:px-6">
          {children}
        </main>
        <footer className="mx-auto max-w-5xl px-5 pb-10 md:px-6">
          <p className="type-body-sm text-fg-secondary">
            InvestKea provides general information and planning tools only. It does not recommend or sell any
            financial product and is not investment advice.
          </p>
        </footer>
      </body>
    </html>
  );
}
