import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "./alert";
import { Badge } from "./badge";
import { BookingStatusBadge } from "./booking-status-badge";
import { ProgressBar } from "./progress-bar";
import { Skeleton } from "./skeleton";
import { EmptyState } from "./empty-state";
import { Button } from "./button";
import { CalendarX } from "lucide-react";

const meta: Meta = { title: "Feedback", parameters: { layout: "padded" } };
export default meta;

export const Alerts: StoryObj = {
  render: () => (
    <div className="max-w-lg space-y-3">
      <Alert tone="info" title="We couldn't connect to your bank">
        Your data is safe. Try again in a minute.
      </Alert>
      <Alert tone="success" title="Booking confirmed">
        Asha will see you on 14 Nov at 4:00 pm.
      </Alert>
      <Alert tone="warning" title="This plan has higher risk">
        Here's what that means for you, in plain words.
      </Alert>
      <Alert tone="danger" title="We couldn't save your goal">
        Check the highlighted fields and try again.
      </Alert>
    </div>
  ),
};

export const Badges: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["neutral", "brand", "success", "warning", "danger", "info"] as const).map((tone) => (
        <Badge key={tone} tone={tone}>
          {tone[0].toUpperCase() + tone.slice(1)}
        </Badge>
      ))}
    </div>
  ),
};

export const BookingStatuses: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["requested", "confirmed", "completed", "cancelled"] as const).map((s) => (
        <BookingStatusBadge key={s} status={s} />
      ))}
    </div>
  ),
};

export const Progress: StoryObj = {
  render: () => (
    <div className="max-w-sm space-y-4">
      <ProgressBar value={0} max={100} label="Not started" />
      <ProgressBar value={63} max={100} label="Emergency fund progress" />
      <ProgressBar value={100} max={100} label="Complete" />
    </div>
  ),
};

export const Skeletons: StoryObj = {
  render: () => (
    <section aria-busy="true" aria-label="Loading transactions" className="max-w-md space-y-6">
      <Skeleton />
      <Skeleton variant="row" />
      <Skeleton variant="card" />
    </section>
  ),
};

export const Empty: StoryObj = {
  render: () => (
    <EmptyState
      icon={<CalendarX className="size-6" />}
      title="No bookings yet"
      description="When you book time with a consultant, it will show up here."
      action={<Button>Find a consultant</Button>}
    />
  ),
};
