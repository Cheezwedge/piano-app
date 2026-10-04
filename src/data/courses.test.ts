import { describe, expect, it } from "vitest";
import { COURSE_UNITS } from "./courses";
import { LESSON_1 } from "./lesson1";

const BANNED = /simply piano|disney|let it go|frozen|copyright/i;

describe("course path", () => {
  it("starts with the original Garden Walk unit", () => {
    expect(COURSE_UNITS[0].id).toBe("basics-five");
    expect(COURSE_UNITS[0].stages).toHaveLength(3);
    expect(LESSON_1.stages[2].title).toBe("Garden Walk");
  });

  it("uses original titles and seven unlockable units", () => {
    expect(COURSE_UNITS.map((unit) => unit.id)).toEqual([
      "basics-five",
      "neighbors-abc",
      "staff-reading",
      "bass-clef",
      "rhythm-beats",
      "twohands-hello",
      "hands-together",
    ]);
    for (const unit of COURSE_UNITS) {
      expect(unit.title).not.toMatch(BANNED);
      expect(unit.stages[2].title).not.toMatch(BANNED);
      expect(unit.stages.map((stage) => stage.kind)).toEqual(["demo", "guided", "melody"]);
    }
  });

  it("keeps two-hand notes sequential and age-small", () => {
    const melody = COURSE_UNITS.find((unit) => unit.id === "twohands-hello")?.stages[2].notes ?? [];
    expect(melody.length).toBeLessThanOrEqual(10);
    expect(melody.some((item) => item.hand === "left")).toBe(true);
    expect(melody.some((item) => item.midi === 48)).toBe(true);
  });
});
