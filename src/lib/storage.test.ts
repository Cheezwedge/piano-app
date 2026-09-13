import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_STATE } from "../types";
import { STORAGE_KEY, clearState, loadState, saveState } from "./storage";

describe("local persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns defaults when empty", () => {
    expect(loadState().pinHash).toBe("");
    expect(loadState().kids).toEqual([]);
  });

  it("round-trips parent settings", () => {
    saveState({
      ...DEFAULT_STATE,
      pinHash: "abc",
      sessionLimitMinutes: 10,
      kids: [],
    });
    expect(localStorage.getItem(STORAGE_KEY)).toContain("abc");
    expect(loadState().sessionLimitMinutes).toBe(10);
    clearState();
    expect(loadState().pinHash).toBe("");
  });

  it("migrates a finished Lesson 1 kid onto the course path", () => {
    saveState({
      ...DEFAULT_STATE,
      pinHash: "abc",
      kids: [
        {
          id: "k1",
          name: "Sam",
          avatar: "🦊",
          createdAt: "2026-01-01",
          lesson1Complete: true,
          xp: 0,
          streakDays: 0,
          lastPracticeDate: null,
          stageStars: {},
          unlockedRewards: [],
          theme: "cream",
          sticker: null,
          badge: null,
        },
      ],
    });
    const kid = loadState().kids[0];
    expect(kid.stageStars["basics-five"]).toBe(2);
    expect(kid.xp).toBe(70);
    expect(kid.lesson1Complete).toBe(true);
  });
});
