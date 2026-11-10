import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  AppShell,
  ConsultantCard,
  DataTable,
  List,
  ListRow,
  SideNav,
  activeIndex,
  isActivePath,
} from "../index";

const items = [
  { href: "/advisor", label: "Dashboard" },
  { href: "/advisor/requests", label: "Requests", count: 3 },
  { href: "/advisor/clients", label: "Clients" },
];

describe("isActivePath / activeIndex", () => {
  it("matches exact and nested paths but not look-alikes", () => {
    expect(isActivePath("/app", "/app")).toBe(true);
    expect(isActivePath("/app", "/app/bookings")).toBe(true);
    expect(isActivePath("/app", "/apple")).toBe(false);
  });

  it("picks the most specific item", () => {
    expect(activeIndex(items, "/advisor/clients/123")).toBe(2);
    expect(activeIndex(items, "/advisor")).toBe(0);
    expect(activeIndex(items, "/elsewhere")).toBe(-1);
  });
});

describe("SideNav", () => {
  it("is a named navigation landmark with exactly one current page", () => {
    render(<SideNav label="Advisor portal" items={items} currentPath="/advisor/clients/42" />);
    const nav = screen.getByRole("navigation", { name: "Advisor portal" });
    const current = within(nav)
      .getAllByRole("link")
      .filter((l) => l.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("Clients");
  });

  it("announces counts in words", () => {
    render(<SideNav label="Portal" items={items} currentPath="/advisor" />);
    expect(screen.getByRole("link", { name: "Requests (3 pending)" })).toBeInTheDocument();
  });

  it("uses the supplied link component", () => {
    const Custom = (p: { href: string; children?: React.ReactNode }) => (
      <a data-custom="yes" href={p.href}>
        {p.children}
      </a>
    );
    render(<SideNav label="Portal" items={items} currentPath="/advisor" linkComponent={Custom} />);
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("data-custom", "yes");
  });
});

describe("AppShell", () => {
  it("renders banner, navigation and a single main region", () => {
    render(
      <AppShell
        brand={<a href="/">InvestKea</a>}
        nav={<SideNav label="App" items={items} currentPath="/advisor" />}
      >
        <h1>Page</h1>
      </AppShell>,
    );
    expect(screen.getByRole("banner")).toHaveTextContent("InvestKea");
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });
});

describe("DataTable", () => {
  const rows = [
    { id: "1", name: "House", amount: "₹50,00,000" },
    { id: "2", name: "Car", amount: "₹8,00,000" },
  ];
  const columns = [
    { key: "name", header: "Goal", cell: (r: (typeof rows)[0]) => r.name, isRowHeader: true },
    { key: "amount", header: "Target", cell: (r: (typeof rows)[0]) => r.amount, align: "end" as const },
  ];

  it("has a caption, column headers and row headers", () => {
    render(<DataTable caption="Saved goals" columns={columns} rows={rows} rowKey={(r) => r.id} />);
    const table = screen.getByRole("table", { name: "Saved goals" });
    expect(within(table).getAllByRole("columnheader")).toHaveLength(2);
    expect(within(table).getByRole("rowheader", { name: "House" })).toBeInTheDocument();
  });

  it("shows the empty state instead of an empty table", () => {
    render(
      <DataTable
        caption="Saved goals"
        columns={columns}
        rows={[]}
        rowKey={(r) => r.id}
        empty={<p>No goals yet</p>}
      />,
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("No goals yet")).toBeInTheDocument();
  });
});

describe("ListRow", () => {
  it("renders inside a list", () => {
    render(
      <List label="Bookings">
        <ListRow title="Asha Menon" subtitle="14 Nov, 4:00 pm" trailing={<span>Confirmed</span>} />
      </List>,
    );
    expect(screen.getByRole("list", { name: "Bookings" })).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveTextContent("Asha Menon");
  });
});

describe("ConsultantCard", () => {
  it("always shows credential and registration number", () => {
    render(
      <ConsultantCard
        name="Asha Menon"
        credentialType="SEBI RIA"
        registrationNumber="INA000012345"
        verified
      />,
    );
    expect(screen.getByRole("heading", { name: "Asha Menon" })).toBeInTheDocument();
    expect(screen.getByText(/SEBI RIA/)).toHaveTextContent("INA000012345");
    expect(screen.getByText("Registration checked by InvestKea")).toBeInTheDocument();
  });

  it("hides the verified line when not verified", () => {
    render(<ConsultantCard name="Ravi" credentialType="CFP" registrationNumber="X1" />);
    expect(screen.queryByText(/Registration checked/)).not.toBeInTheDocument();
  });
});
