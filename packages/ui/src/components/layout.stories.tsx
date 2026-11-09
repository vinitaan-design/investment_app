import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Avatar } from "./avatar";
import { Button } from "./button";
import { Card } from "./card";
import { Dialog } from "./dialog";
import { GoalCard } from "./goal-card";
import { StatCard } from "./stat-card";
import { Tabs } from "./tabs";

const meta: Meta = { title: "Display & Navigation" };
export default meta;

export const Cards: StoryObj = {
  render: () => (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-3">
      <Card elevation="flat">
        <p className="type-body text-fg">Flat</p>
      </Card>
      <Card>
        <p className="type-body text-fg">Resting (default)</p>
      </Card>
      <Card elevation="raised">
        <p className="type-body text-fg">Raised</p>
      </Card>
    </div>
  ),
};

export const Goal: StoryObj = {
  render: () => (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-3">
      <GoalCard
        title="Emergency fund"
        saved={188000}
        target={300000}
        status="on-track"
        onTrackDate={new Date(2027, 5, 1)}
      />
      <GoalCard
        title="Child's education"
        saved={120000}
        target={1500000}
        status="behind"
        onTrackDate={new Date(2034, 3, 1)}
      />
      <GoalCard title="New laptop" saved={90000} target={80000} status="achieved" />
    </div>
  ),
};

export const Stats: StoryObj = {
  render: () => (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-3">
      <StatCard
        label="Spent this month"
        value="₹42,000"
        context="1–10 Nov"
        trend={{ direction: "down", text: "₹4,000 less than October", sentiment: "positive" }}
      />
      <StatCard
        label="Saved this month"
        value="₹18,500"
        trend={{ direction: "up", text: "₹2,500 more than October", sentiment: "positive" }}
      />
      <StatCard
        label="Open requests"
        value="3"
        context="Advisor portal"
        trend={{ direction: "flat", text: "Same as last week" }}
      />
    </div>
  ),
};

export const Avatars: StoryObj = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar name="Asha Menon" size="sm" />
      <Avatar name="Ravi Kumar" />
      <Avatar name="Fatima Shaikh" size="lg" />
    </div>
  ),
};

export const TabsExample: StoryObj = {
  name: "Tabs",
  render: () => (
    <Tabs
      label="Spending period"
      items={[
        { id: "week", label: "Week", content: <p className="type-body text-fg">This week's spending</p> },
        { id: "month", label: "Month", content: <p className="type-body text-fg">This month's spending</p> },
        { id: "year", label: "Year", content: <p className="type-body text-fg">This year's spending</p> },
      ]}
    />
  ),
};

function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Cancel booking
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Cancel this booking?"
        description="Asha will be told. You can book again anytime."
        actions={
          <>
            <Button variant="secondary" size="md" onClick={() => setOpen(false)}>
              Keep booking
            </Button>
            <Button variant="danger" size="md" onClick={() => setOpen(false)}>
              Yes, cancel
            </Button>
          </>
        }
      />
    </>
  );
}

export const DialogExample: StoryObj = { name: "Dialog", render: () => <DialogDemo /> };
