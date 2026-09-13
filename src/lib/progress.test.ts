import { describe, expect, it } from "vitest";
import { EMPTY_KID_PROGRESS } from "../types";
import {
  applyStageComplete,
  isUnitUnlocked,
  nextPracticeStreak,
  starsFromCounts,
  yesterdayStamp,
} from "./progress";

const kid = {
  id: "k",
  name: "Sam",
  avatar: "🦊",
  createdAt: "2026-01-01",
  ...EMPTY_KID_PROGRESS,
};

describe("stars and unlocks", () => {
  it("gives 3 stars for a clean finish", () => {
    expect(starsFromCounts(0, 8)).toBe(3);
    expect(starsFromCounts(2, 8)).toBe(2);
    expect(starsFromCounts(7, 8)).toBe(1);
  });

  it("unlocks the next unit only after stars on the prior one", () => {
    const order = ["basics-five", "neighbors-abc", "rhythm-beats"];
    expect(isUnitUnlocked("basics-five", order, {}, false)).toBe(true);
    expect(isUnitUnlocked("neighbors-abc", order, {}, false)).toBe(false);
    expect(isUnitUnlocked("neighbors-abc", order, { "basics-five": 2 }, false)).toBe(true);
    expect(isUnitUnlocked("rhythm-beats", order, { "basics-five": 2 }, true)).toBe(true);
  });
});

describe("awards", () => {
  it("adds XP, streak, and keeps the best star score", () => {
    const first = applyStageComplete(kid, "basics-five", 2, "2026-09-13");
    expect(first.kid.lesson1Complete).toBe(true);
    expect(first.kid.xp).toBe(70);
    expect(first.kid.streakDays).toBe(1);
    const again = applyStageComplete(first.kid, "basics-five", 3, "2026-09-14");
    expect(again.kid.stageStars["basics-five"]).toBe(3);
    expect(again.kid.xp).toBe(80);
    expect(again.kid.streakDays).toBe(2);
  });
});

describe("streak", () => {
  it("resets after a skipped day", () => {
    const today = "2026-09-13";
    expect(nextPracticeStreak(yesterdayStamp(today), 4, today).streakDays).toBe(5);
    expect(nextPracticeStreak("2026-09-10", 4, today).streakDays).toBe(1);
    expect(nextPracticeStreak(today, 3, today).streakDays).toBe(3);
  });
});
