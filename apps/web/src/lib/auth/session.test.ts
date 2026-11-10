import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirect(url) }));

const getClaims = vi.fn();
const single = vi.fn();
const getSessionSpy = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getClaims, getSession: getSessionSpy },
    from: () => ({ select: () => ({ eq: () => ({ single }) }) }),
  }),
}));

const { getSession, requireUser, homeFor } = await import("./session");

const profile = (over: Partial<Record<string, unknown>> = {}) => ({
  id: "u1",
  full_name: "Uma",
  role: "user",
  is_adult_confirmed: true,
  privacy_consent_at: "2026-11-10T00:00:00Z",
  created_at: "2026-11-10T00:00:00Z",
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getSession", () => {
  it("returns null when the token fails verification", async () => {
    getClaims.mockResolvedValue({ data: null, error: new Error("invalid JWT") });
    expect(await getSession()).toBeNull();
  });

  it("uses the verified claims and never the cookie session", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "u1", email: "u@x.in" } }, error: null });
    const s = await getSession();
    expect(s?.userId).toBe("u1");
    expect(s?.email).toBe("u@x.in");
    expect(getSessionSpy).not.toHaveBeenCalled();
  });
});

describe("requireUser", () => {
  it("sends signed-out visitors to login with the return path", async () => {
    getClaims.mockResolvedValue({ data: null, error: null });
    await expect(requireUser("/advisor/requests")).rejects.toThrow(
      "REDIRECT:/login?next=%2Fadvisor%2Frequests",
    );
  });

  it("sends users who haven't consented to onboarding", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } }, error: null });
    single.mockResolvedValue({ data: profile({ privacy_consent_at: null }), error: null });
    await expect(requireUser("/app")).rejects.toThrow("REDIRECT:/onboarding?next=%2Fapp");
  });

  it("redirects a role that isn't allowed to its own home", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } }, error: null });
    single.mockResolvedValue({ data: profile({ role: "user" }), error: null });
    await expect(requireUser("/advisor", ["advisor"])).rejects.toThrow("REDIRECT:/app");
  });

  it("ignores role claims in the token: only the database row counts", async () => {
    getClaims.mockResolvedValue({
      data: { claims: { sub: "u1", user_metadata: { role: "advisor" }, app_role: "admin" } },
      error: null,
    });
    single.mockResolvedValue({ data: profile({ role: "user" }), error: null });
    await expect(requireUser("/advisor", ["advisor"])).rejects.toThrow("REDIRECT:/app");
  });

  it("lets the right role through with its profile", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "a1" } }, error: null });
    single.mockResolvedValue({ data: profile({ id: "a1", role: "advisor" }), error: null });
    const ctx = await requireUser("/advisor", ["advisor"]);
    expect(ctx.profile.role).toBe("advisor");
    expect(redirect).not.toHaveBeenCalled();
  });

  it("fails clearly when the profile can't be loaded", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } }, error: null });
    single.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(requireUser("/app")).rejects.toThrow("We couldn't load your account");
  });
});

describe("homeFor", () => {
  it("routes advisors to the portal and everyone else to the app", () => {
    expect(homeFor("advisor")).toBe("/advisor");
    expect(homeFor("user")).toBe("/app");
    expect(homeFor("admin")).toBe("/app");
  });
});
