"use client";

import { Alert, Button, Dialog, Input } from "@investkea/ui";
import { useActionState, useEffect, useState } from "react";
import { idle } from "@/lib/actions";
import { confirmBooking, updateBookingStatus } from "../actions";

/** "2026-11-14T16:00" typed in the advisor's browser → ISO in UTC, using the browser's timezone. */
export function localInputToIso(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function StatusChangeForm({
  bookingId,
  to,
  title,
  description,
  confirmLabel,
  variant,
  onDone,
}: {
  bookingId: string;
  to: "cancelled" | "completed";
  title: string;
  description: string;
  confirmLabel: string;
  variant: "primary" | "danger";
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState(updateBookingStatus, idle);
  // Close the dialog once the server confirms the change (after render, not during it).
  useEffect(() => {
    if (state.status === "success") onDone();
  }, [state, onDone]);
  return (
    <form action={action} aria-label={title} className="space-y-4">
      {state.status === "error" && (
        <Alert tone="danger" title="That didn't work">
          {state.message}
        </Alert>
      )}
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="to" value={to} />
      <p className="type-body text-fg-secondary">{description}</p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="submit" variant={variant} size="md" loading={pending}>
          {confirmLabel}
        </Button>
      </div>
    </form>
  );
}

export function RequestActions({ bookingId, clientName }: { bookingId: string; clientName: string }) {
  const [dialog, setDialog] = useState<"confirm" | "decline" | null>(null);
  const [localTime, setLocalTime] = useState("");
  const [state, action, pending] = useActionState(confirmBooking, idle);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const close = () => setDialog(null);

  return (
    <>
      <Button size="md" onClick={() => setDialog("confirm")}>
        Confirm
      </Button>
      <Button size="md" variant="ghost" onClick={() => setDialog("decline")}>
        Decline
      </Button>

      <Dialog
        open={dialog === "confirm" && state.status !== "success"}
        onClose={close}
        title={`Confirm a time with ${clientName}`}
        description="They'll see this time on their bookings page. Times are in your browser's timezone."
      >
        <form action={action} noValidate className="space-y-4">
          {state.status === "error" && !state.fieldErrors && (
            <Alert tone="danger" title="We couldn't confirm it">
              {state.message}
            </Alert>
          )}
          <input type="hidden" name="bookingId" value={bookingId} />
          <input type="hidden" name="startsAt" value={localInputToIso(localTime)} />
          <Input
            type="datetime-local"
            label="Session date and time"
            value={localTime}
            onChange={(e) => setLocalTime(e.target.value)}
            error={errors.startsAt}
          />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="md" onClick={close}>
              Not now
            </Button>
            <Button type="submit" size="md" loading={pending}>
              Confirm session
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={dialog === "decline"} onClose={close} title={`Decline ${clientName}'s request?`}>
        <StatusChangeForm
          bookingId={bookingId}
          to="cancelled"
          title="Decline request"
          description="They'll see the request as cancelled and can book someone else."
          confirmLabel="Decline request"
          variant="danger"
          onDone={close}
        />
      </Dialog>
    </>
  );
}

export function ConfirmedActions({ bookingId, clientName }: { bookingId: string; clientName: string }) {
  const [dialog, setDialog] = useState<"complete" | "cancel" | null>(null);
  const close = () => setDialog(null);
  return (
    <>
      <Button size="md" variant="secondary" onClick={() => setDialog("complete")}>
        Mark done
      </Button>
      <Button size="md" variant="ghost" onClick={() => setDialog("cancel")}>
        Cancel
      </Button>
      <Dialog
        open={dialog === "complete"}
        onClose={close}
        title={`Mark the session with ${clientName} as done?`}
      >
        <StatusChangeForm
          bookingId={bookingId}
          to="completed"
          title="Mark as done"
          description="It moves to Past. This can't be undone."
          confirmLabel="Mark as done"
          variant="primary"
          onDone={close}
        />
      </Dialog>
      <Dialog open={dialog === "cancel"} onClose={close} title={`Cancel the session with ${clientName}?`}>
        <StatusChangeForm
          bookingId={bookingId}
          to="cancelled"
          title="Cancel session"
          description="They'll see it as cancelled. This can't be undone."
          confirmLabel="Cancel session"
          variant="danger"
          onDone={close}
        />
      </Dialog>
    </>
  );
}
