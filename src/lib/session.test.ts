import { describe, expect, it } from "vitest";
import { isKidFacingScreen, sessionExpired, sessionShouldRun } from "./session";

describe("session time limit", () => {
  it("is inactive when the parent chose no limit", () => {
    expect(sessionExpired(1, 0, 999999)).toBe(false);
  });

  it("expires after the configured minutes", () => {
    const start = 1_000_000;
    expect(sessionExpired(start, 15, start + 14 * 60 * 1000)).toBe(false);
    expect(sessionExpired(start, 15, start + 15 * 60 * 1000)).toBe(true);
  });

  it("counts time on kid home and lesson, not only during a lesson", () => {
    expect(isKidFacingScreen("home")).toBe(true);
    expect(isKidFacingScreen("lesson")).toBe(true);
    expect(isKidFacingScreen("settings")).toBe(false);
    expect(sessionShouldRun("kid-1", "hash")).toBe(true);
    expect(sessionShouldRun(null, "hash")).toBe(false);
  });
});
