import { describe, expect, it, vi } from "vitest";
import {
  advisorApplicationSchema,
  bookingRequestSchema,
  confirmBookingSchema,
  onboardingSchema,
  parseLanguages,
  saveGoalSchema,
} from "./validation";
import { dbFailure, fieldErrorsFrom } from "./actions";

describe("onboardingSchema", () => {
  it("requires both consents and a name", () => {
    const r = onboardingSchema.safeParse({ fullName: " ", adult: undefined, privacy: undefined });
    expect(r.success).toBe(false);
    const errors = fieldErrorsFrom(r.error!.issues);
    expect(errors.fullName).toBe("Enter your name.");
    expect(errors.adult).toMatch(/18 or older/);
    expect(errors.privacy).toMatch(/privacy notice/);
  });

  it("accepts ticked boxes", () => {
    expect(onboardingSchema.safeParse({ fullName: "Uma", adult: "on", privacy: "on" }).success).toBe(true);
  });
});

describe("advisorApplicationSchema", () => {
  it("rejects unknown credential types", () => {
    const r = advisorApplicationSchema.safeParse({
      displayName: "A",
      credentialType: "Guru",
      registrationNumber: "123",
    });
    expect(fieldErrorsFrom(r.error!.issues).credentialType).toBe("Choose your credential.");
  });
});

describe("parseLanguages", () => {
  it("splits, trims, dedupes and caps", () => {
    expect(parseLanguages("English, Malayalam ,  ,English")).toEqual(["English", "Malayalam"]);
    expect(parseLanguages(undefined)).toEqual([]);
    expect(parseLanguages(Array.from({ length: 20 }, (_, i) => `L${i}`).join(","))).toHaveLength(10);
  });
});

describe("bookingRequestSchema", () => {
  it("rejects a non-uuid advisor id", () => {
    expect(bookingRequestSchema.safeParse({ advisorId: "1 or 1=1", topic: "x" }).success).toBe(false);
  });
});

describe("confirmBookingSchema", () => {
  const id = "3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90";
  it("rejects past times", () => {
    const r = confirmBookingSchema.safeParse({ bookingId: id, startsAt: "2020-01-01T10:00:00.000Z" });
    expect(fieldErrorsFrom(r.error!.issues).startsAt).toBe("Choose a time in the future.");
  });
  it("accepts a future ISO time", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    expect(confirmBookingSchema.safeParse({ bookingId: id, startsAt: future }).success).toBe(true);
  });
});

describe("saveGoalSchema", () => {
  it("coerces form strings", () => {
    const r = saveGoalSchema.parse({
      name: "House",
      presentCost: "500000",
      years: "10",
      inflation: "6",
      growth: "7",
    });
    expect(r).toMatchObject({ presentCost: 500000, years: 10, currentSavings: 0 });
  });
  it("rejects rates outside 0–30%", () => {
    expect(
      saveGoalSchema.safeParse({ name: "x", presentCost: "1", years: "1", inflation: "31", growth: "1" })
        .success,
    ).toBe(false);
  });
});

describe("dbFailure", () => {
  it("hides internals and maps permission errors", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(dbFailure("x", { code: "42501", message: "secret detail" })).toEqual({
      status: "error",
      message: "You don't have permission to do that.",
    });
    expect(dbFailure("x", { code: "XX000", message: "secret" }).status).toBe("error");
    spy.mockRestore();
  });
});
