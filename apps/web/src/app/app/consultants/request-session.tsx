"use client";

import { Alert, Button, Dialog, Input } from "@investkea/ui";
import { useActionState, useState } from "react";
import { idle } from "@/lib/actions";
import { requestSession } from "../actions";

export function RequestSessionButton({ advisorId, advisorName }: { advisorId: string; advisorName: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(requestSession, idle);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const done = state.status === "success";

  return (
    <>
      {done ? (
        <Alert tone="success" title="Request sent">
          {state.message}
        </Alert>
      ) : (
        <Button size="md" onClick={() => setOpen(true)}>
          Request a session
        </Button>
      )}
      <Dialog
        open={open && !done}
        onClose={() => setOpen(false)}
        title={`Request a session with ${advisorName}`}
        description="They'll see your name, topic and note, and confirm a time. Your financial data stays private unless you turn on sharing."
      >
        <form action={action} noValidate className="space-y-4">
          {state.status === "error" && !state.fieldErrors && (
            <Alert tone="danger" title="We couldn't send that">
              {state.message}
            </Alert>
          )}
          <input type="hidden" name="advisorId" value={advisorId} />
          <Input name="topic" label="What would you like to discuss?" maxLength={200} error={errors.topic} />
          <Input
            name="note"
            label="Anything they should know first (optional)"
            maxLength={2000}
            error={errors.note}
          />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="md" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="md" loading={pending}>
              Send request
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
