import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-next";

describe("safeNextPath", () => {
  it.each([
    ["/advisor/requests", "/advisor/requests"],
    ["/app?tab=goals", "/app?tab=goals"],
    ["/app#top", "/app#top"],
    ["/a/../advisor", "/advisor"],
  ])("keeps in-app path %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });

  it.each([
    null,
    undefined,
    "",
    "https://evil.com",
    "http://evil.com/app",
    "//evil.com",
    "//evil.com/app",
    "/\\evil.com",
    "\\\\evil.com",
    "javascript:alert(1)",
    "app",
    "/\tevil",
    "/\n/evil.com",
    `/${"a".repeat(600)}`,
  ])("rejects %j", (input) => {
    expect(safeNextPath(input as string | null | undefined)).toBe("/app");
  });

  it("uses the given fallback", () => {
    expect(safeNextPath("https://evil.com", "/advisor")).toBe("/advisor");
  });
});
