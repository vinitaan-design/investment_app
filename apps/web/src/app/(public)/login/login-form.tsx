"use client";

import { Alert, Button, Input } from "@investkea/ui";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { safeNextPath } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/client";

const errorMessages: Record<string, { title: string; body: string }> = {
  cancelled: { title: "Sign-in was cancelled", body: "Nothing was changed. You can try again below." },
  expired: {
    title: "That sign-in link has expired",
    body: "Links work once and expire after a while. Ask for a new one below.",
  },
  missing_code: { title: "We couldn't finish signing you in", body: "Please try again below." },
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const urlError = errorMessages[params.get("error") ?? ""];

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [status, setStatus] = useState<"idle" | "google" | "sending" | "sent">("idle");
  const [failure, setFailure] = useState<string>();

  const callbackUrl = () => {
    const url = new URL("/auth/callback", window.location.origin);
    url.searchParams.set("next", next);
    return url.toString();
  };

  async function signInWithGoogle() {
    setFailure(undefined);
    setStatus("google");
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    // On success the browser leaves the page; we only get here on failure.
    if (error) {
      console.warn("[auth] google sign-in failed", { status: error.status });
      setFailure("We couldn't reach Google sign-in. Check your connection and try again.");
      setStatus("idle");
    }
  }

  async function sendEmailLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure(undefined);
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setEmailError("Enter an email address like name@example.com.");
      return;
    }
    setEmailError(undefined);
    setStatus("sending");
    const { error } = await createClient().auth.signInWithOtp({
      email: value,
      options: { emailRedirectTo: callbackUrl(), shouldCreateUser: true },
    });
    if (error) {
      console.warn("[auth] email link failed", { status: error.status, code: error.code });
      setFailure(
        error.status === 429
          ? "Too many sign-in emails were sent recently. Wait a few minutes, or use Google instead."
          : "We couldn't send the email. Check the address and try again.",
      );
      setStatus("idle");
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <Alert tone="success" title="Check your email">
        We sent a sign-in link to {email.trim()}. Open it on this device. It works once.
      </Alert>
    );
  }

  return (
    <div className="space-y-6 rounded-lg border border-line bg-surface p-6 shadow-1">
      {urlError && (
        <Alert tone="info" title={urlError.title}>
          {urlError.body}
        </Alert>
      )}
      {failure && (
        <Alert tone="danger" title="Something went wrong">
          {failure}
        </Alert>
      )}
      <Button
        className="w-full"
        onClick={signInWithGoogle}
        loading={status === "google"}
        disabled={status !== "idle"}
      >
        Continue with Google
      </Button>
      <div className="flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        <span className="type-caption text-fg-tertiary">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <form noValidate onSubmit={sendEmailLink} className="space-y-4" aria-label="Sign in with email">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          helper="We'll email you a one-time sign-in link. No password needed."
        />
        <Button
          type="submit"
          variant="secondary"
          className="w-full"
          loading={status === "sending"}
          disabled={status !== "idle"}
        >
          Email me a sign-in link
        </Button>
      </form>
    </div>
  );
}
