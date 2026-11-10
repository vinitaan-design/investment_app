"use client";

import { Alert, Button, Dialog } from "@investkea/ui";
import { useActionState, useState } from "react";
import { idle } from "@/lib/actions";
import { cancelBooking } from "../actions";

/** Cancelling is confirmed in a dialog: it notifies the consultant and can't be undone. */
export function CancelBookingButton({ bookingId, advisorName }: { bookingId: string; advisorName: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(cancelBooking, idle);
  return (
    <>
      <Button variant="danger" size="md" onClick={() => setOpen(true)}>
        Cancel
      </Button>
      <Dialog
        open={open && state.status !== "success"}
        onClose={() => setOpen(false)}
        title="Cancel this booking?"
        description={`${advisorName} will see it as cancelled. You can request a new session anytime.`}
      >
        <form action={action} className="space-y-4">
          {state.status === "error" && (
            <Alert tone="danger" title="We couldn't cancel it">
              {state.message}
            </Alert>
          )}
          <input type="hidden" name="bookingId" value={bookingId} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="md" onClick={() => setOpen(false)}>
              Keep booking
            </Button>
            <Button type="submit" variant="danger" size="md" loading={pending}>
              Yes, cancel
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
