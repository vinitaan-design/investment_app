import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import type { AdvisorBooking } from "./data/bookings";
import { summariseClients, upcomingSessions } from "./bookings-view";

const b = (over: Partial<AdvisorBooking>): AdvisorBooking => ({
  id: Math.random().toString(),
  status: "confirmed",
  startsAt: null,
  topic: null,
  note: null,
  createdAt: "2026-11-01T00:00:00Z",
  client: { id: "c1", name: "Uma" },
  ...over,
});

describe("upcomingSessions", () => {
  const now = new Date("2026-11-10T12:00:00Z");
  it("keeps only future confirmed sessions, soonest first", () => {
    const list = [
      b({ id: "later", startsAt: "2026-11-20T10:00:00Z" }),
      b({ id: "past", startsAt: "2026-11-09T10:00:00Z" }),
      b({ id: "soon", startsAt: "2026-11-11T10:00:00Z" }),
      b({ id: "requested", status: "requested", startsAt: "2026-11-12T10:00:00Z" }),
      b({ id: "no-time", startsAt: null }),
    ];
    expect(upcomingSessions(list, now).map((x) => x.id)).toEqual(["soon", "later"]);
  });
});

describe("summariseClients", () => {
  it("groups bookings per client and keeps the latest date", () => {
    const out = summariseClients([
      b({ client: { id: "c2", name: "Zara" }, createdAt: "2026-11-02T00:00:00Z" }),
      b({ client: { id: "c1", name: "Uma" }, createdAt: "2026-11-01T00:00:00Z" }),
      b({ client: { id: "c1", name: "Uma" }, createdAt: "2026-11-05T00:00:00Z" }),
      b({ client: { id: "", name: "Ghost" } }),
    ]);
    expect(out).toEqual([
      { id: "c1", name: "Uma", sessions: 2, lastAt: "2026-11-05T00:00:00Z" },
      { id: "c2", name: "Zara", sessions: 1, lastAt: "2026-11-02T00:00:00Z" },
    ]);
  });
});
