import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime } from "./format";

describe("format", () => {
  it("shows times in IST regardless of server timezone", () => {
    expect(formatDateTime("2026-11-14T10:30:00.000Z")).toMatch(/14 Nov 2026.*4:00\s?pm IST/i);
  });
  it("handles missing or invalid values", () => {
    expect(formatDateTime(null)).toBe("Time not set yet");
    expect(formatDateTime("nope")).toBe("Time not set yet");
    expect(formatDate("nope")).toBe("");
  });
});
