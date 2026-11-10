"use client";

import { Alert, Button, Checkbox, Input } from "@investkea/ui";
import Link from "next/link";
import { useActionState } from "react";
import { idle } from "@/lib/actions";
import { completeOnboarding } from "./actions";

export function OnboardingForm({ defaultName, next }: { defaultName: string; next: string }) {
  const [state, action, pending] = useActionState(completeOnboarding, idle);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form
      action={action}
      noValidate
      className="space-y-5 rounded-lg border border-line bg-surface p-6 shadow-1"
    >
      {state.status === "error" && !state.fieldErrors && (
        <Alert tone="danger" title="We couldn't save that">
          {state.message}
        </Alert>
      )}
      <input type="hidden" name="next" value={next} />
      <Input
        label="Your name"
        name="fullName"
        autoComplete="name"
        defaultValue={defaultName}
        error={errors.fullName}
      />
      <Checkbox name="adult" label="I am 18 or older" error={errors.adult} />
      <Checkbox
        name="privacy"
        error={errors.privacy}
        label={
          <>
            I have read the{" "}
            <Link href="/privacy" target="_blank" className="text-fg-brand underline underline-offset-2">
              privacy notice
            </Link>{" "}
            and agree to InvestKea storing the information I enter
          </>
        }
      />
      <Button type="submit" className="w-full" loading={pending}>
        Continue
      </Button>
    </form>
  );
}
