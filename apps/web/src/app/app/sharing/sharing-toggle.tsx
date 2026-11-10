"use client";

import { Alert, Switch } from "@investkea/ui";
import { useActionState, useOptimistic, startTransition } from "react";
import { idle } from "@/lib/actions";
import { setSharing } from "../actions";

export function SharingToggle({
  advisorId,
  advisorName,
  credential,
  shared,
}: {
  advisorId: string;
  advisorName: string;
  credential: string;
  shared: boolean;
}) {
  const [state, action, pending] = useActionState(setSharing, idle);
  const [optimistic, setOptimistic] = useOptimistic(shared);

  const onChange = (next: boolean) => {
    const form = new FormData();
    form.set("advisorId", advisorId);
    if (next) form.set("share", "on");
    startTransition(() => {
      setOptimistic(next);
      action(form);
    });
  };

  return (
    <div className="py-2">
      <Switch
        label={`Share with ${advisorName}`}
        description={
          credential
            ? `${credential} · ${optimistic ? "Can see your data" : "Can't see your data"}`
            : undefined
        }
        checked={optimistic}
        onChange={onChange}
        disabled={pending}
      />
      <div aria-live="polite">
        {state.status === "error" && (
          <Alert tone="danger" title="We couldn't change sharing">
            {state.message}
          </Alert>
        )}
        {state.status === "success" && <p className="pb-2 type-body-sm text-fg-success">{state.message}</p>}
      </div>
    </div>
  );
}
