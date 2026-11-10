import { describe, expect, it } from "vitest";
import { isProtectedPath } from "./proxy";

describe("isProtectedPath", () => {
  it.each(["/app", "/app/bookings", "/advisor", "/advisor/clients/1", "/onboarding"])("protects %s", (p) => {
    expect(isProtectedPath(p)).toBe(true);
  });
  it.each(["/", "/goals", "/login", "/privacy", "/apple", "/advisors-info", "/auth/callback"])(
    "leaves %s public",
    (p) => {
      expect(isProtectedPath(p)).toBe(false);
    },
  );
});
