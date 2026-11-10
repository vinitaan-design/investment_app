"use client";

import { Alert, Button, Input, Select } from "@investkea/ui";
import { useActionState } from "react";
import { idle } from "@/lib/actions";
import { applyAsAdvisor } from "./actions";

const credentials = ["SEBI RIA", "CFP", "IRDAI agent", "Other"].map((c) => ({ value: c, label: c }));

export function ApplyForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState(applyAsAdvisor, idle);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  return (
    <form
      action={action}
      noValidate
      className="space-y-5 rounded-lg border border-line bg-surface p-6 shadow-1"
    >
      {state.status === "error" && !state.fieldErrors && (
        <Alert tone="danger" title="We couldn't send your application">
          {state.message}
        </Alert>
      )}
      <Input
        name="displayName"
        label="Name shown to clients"
        defaultValue={defaultName}
        error={errors.displayName}
      />
      <Select
        name="credentialType"
        label="Credential"
        placeholder="Choose your credential"
        defaultValue=""
        options={credentials}
        error={errors.credentialType}
        helper="Only SEBI-registered investment advisers may give personalised investment advice for a fee."
      />
      <Input
        name="registrationNumber"
        label="Registration number"
        error={errors.registrationNumber}
        helper="For SEBI RIAs this looks like INA000012345."
      />
      <Input
        name="languages"
        label="Languages (optional)"
        helper="Separate with commas, e.g. English, Hindi"
        error={errors.languages}
      />
      <Input name="bio" label="About you (optional)" maxLength={2000} error={errors.bio} />
      <Button type="submit" className="w-full" loading={pending}>
        Send application
      </Button>
    </form>
  );
}
