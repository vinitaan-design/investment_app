import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarClock, Inbox, LayoutDashboard, Users } from "lucide-react";
import { AppShell, SideNav } from "./app-shell";
import { Badge } from "./badge";
import { BookingStatusBadge } from "./booking-status-badge";
import { Button } from "./button";
import { ConsultantCard } from "./consultant-card";
import { DataTable } from "./data-table";
import { EmptyState } from "./empty-state";
import { List, ListRow } from "./list-row";
import { Avatar } from "./avatar";

const meta: Meta = { title: "App structure", parameters: { layout: "fullscreen" } };
export default meta;

const advisorNav = [
  { href: "/advisor", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/advisor/requests", label: "Requests", icon: <Inbox />, count: 2 },
  { href: "/advisor/clients", label: "Clients", icon: <Users /> },
];

export const Shell: StoryObj = {
  render: () => (
    <AppShell
      brand={<span className="type-h3 text-fg-brand">InvestKea</span>}
      actions={
        <Button variant="ghost" size="md">
          Sign out
        </Button>
      }
      nav={<SideNav label="Advisor portal" items={advisorNav} currentPath="/advisor/requests" />}
    >
      <h1 className="type-h1 text-fg">Requests</h1>
    </AppShell>
  ),
};

export const Table: StoryObj = {
  parameters: { layout: "padded" },
  render: () => (
    <DataTable
      caption="Saved goals"
      rowKey={(r) => r.id}
      rows={[
        { id: "1", name: "House down payment", year: 2031, cost: "₹25,00,000" },
        { id: "2", name: "Child's education", year: 2038, cost: "₹40,00,000" },
      ]}
      columns={[
        { key: "name", header: "Goal", cell: (r) => r.name, isRowHeader: true },
        { key: "year", header: "Target year", cell: (r) => r.year, align: "end" },
        { key: "cost", header: "Cost today", cell: (r) => r.cost, align: "end" },
      ]}
    />
  ),
};

export const ListRows: StoryObj = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="max-w-xl rounded-lg border border-line bg-surface px-4">
      <List label="Requests">
        <ListRow
          leading={<Avatar name="Uma Client" decorative />}
          title="Uma Client"
          subtitle="Retirement planning · requested 9 Nov"
          trailing={<BookingStatusBadge status="requested" />}
        />
        <ListRow
          leading={<Avatar name="Omar Shaikh" decorative />}
          title="Omar Shaikh"
          subtitle="Child's education · 14 Nov, 4:00 pm"
          trailing={<BookingStatusBadge status="confirmed" />}
        />
      </List>
    </div>
  ),
};

export const Consultants: StoryObj = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
      <ConsultantCard
        name="Asha Menon"
        credentialType="SEBI RIA"
        registrationNumber="INA000012345"
        languages={["English", "Malayalam"]}
        bio="Fee-only adviser focused on retirement and education planning for young families."
        verified
        action={<Button size="md">Request a session</Button>}
      />
      <ConsultantCard
        name="Ravi Kumar"
        credentialType="CFP"
        registrationNumber="CFP-2219"
        languages={["English", "Hindi"]}
        verified
        action={
          <Button size="md" variant="secondary">
            Request a session
          </Button>
        }
      />
    </div>
  ),
};

export const EmptyList: StoryObj = {
  parameters: { layout: "padded" },
  render: () => (
    <EmptyState
      icon={<CalendarClock className="size-6" />}
      title="No requests yet"
      description="When someone asks for a session, it will appear here."
    />
  ),
};

export const BadgesInContext: StoryObj = {
  parameters: { layout: "padded" },
  render: () => <Badge tone="warning">Awaiting verification</Badge>,
};
