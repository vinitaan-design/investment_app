import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "InvestKea — calm, clear money planning",
  description:
    "Plan your financial goals with inflation in mind, track your money, and talk to a certified consultant.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="border-b border-border bg-surface">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="font-display text-xl text-primary">
              InvestKea
            </Link>
            <div className="flex gap-6 text-sm text-muted">
              <Link href="/goals" className="hover:text-foreground">
                Goal planner
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-10 text-xs text-muted">
          InvestKea provides general information and planning tools only. It does not recommend or sell any
          financial product and is not investment advice.
        </footer>
      </body>
    </html>
  );
}
