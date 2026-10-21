import { describe, expect, it } from "vitest";
import { formatRemaining, isKidFacingScreen, sessionExpired, sessionRemainingMs, sessionShouldRun } from "./session";

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
    expect(isKidFacingScreen("library")).toBe(true);
    expect(isKidFacingScreen("settings")).toBe(false);
    expect(sessionShouldRun("kid-1", "hash")).toBe(true);
    expect(sessionShouldRun(null, "hash")).toBe(false);
  });

  it("formats the countdown shown beside the lesson controls", () => {
    const start = 1_000_000;
    const now = start + 62_100;
    const ms = sessionRemainingMs(start, 15, now, true);
    expect(ms).toBe(15 * 60 * 1000 - 62_100);
    expect(formatRemaining(ms ?? 0)).toBe("13:58");
    expect(sessionRemainingMs(start, 0, now, true)).toBeNull();
    expect(sessionRemainingMs(null, 15, now, true)).toBeNull();
    expect(sessionRemainingMs(start, 15, now, false)).toBeNull();
  });
});
