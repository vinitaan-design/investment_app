import type { AdvisorBooking } from "./data/bookings";

/**
 * Confirmed sessions that haven't started yet, soonest first.
 * `now` is passed in so the function stays pure and testable.
 */
export function upcomingSessions(bookings: AdvisorBooking[], now: Date): AdvisorBooking[] {
  const t = now.getTime();
  return bookings
    .filter((b) => b.status === "confirmed" && b.startsAt !== null && new Date(b.startsAt).getTime() >= t)
    .sort((a, b) => new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime());
}

/** One entry per client: name, number of bookings, latest request date. Sorted by name. */
export function summariseClients(bookings: AdvisorBooking[]) {
  const clients = new Map<string, { id: string; name: string; sessions: number; lastAt: string }>();
  for (const b of bookings) {
    if (!b.client.id) continue;
    const c = clients.get(b.client.id) ?? {
      id: b.client.id,
      name: b.client.name,
      sessions: 0,
      lastAt: b.createdAt,
    };
    c.sessions += 1;
    if (b.createdAt > c.lastAt) c.lastAt = b.createdAt;
    clients.set(c.id, c);
  }
  return [...clients.values()].sort((a, b) => a.name.localeCompare(b.name));
}
