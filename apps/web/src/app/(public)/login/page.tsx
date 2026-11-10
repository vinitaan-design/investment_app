import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in — InvestKea" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <header className="space-y-2">
        <h1 className="type-h1 text-fg">Sign in</h1>
        <p className="type-body-lg text-fg-secondary">
          Save your goals and book time with a verified consultant. New here? Signing in creates your account.
        </p>
      </header>
      {/* The form reads ?next= and ?error= from the URL, which is request-time data. */}
      <Suspense fallback={<div className="h-72 rounded-lg bg-surface shadow-1" aria-hidden />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
