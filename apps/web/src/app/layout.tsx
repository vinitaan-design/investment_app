import type { Metadata } from "next";
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
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-10 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
