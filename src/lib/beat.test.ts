import { describe, expect, it } from "vitest";
import { COURSE_UNITS } from "../data/courses";
import { noteNeedsHold } from "./rhythm";
import { BEAT_WINDOW_MS, PULSE_BEAT_MS, beatGateRequired, timingAgainstBeat } from "./beat";

const ANCHOR = 5_000;

function at(offset: number) {
  return timingAgainstBeat(ANCHOR + offset, ANCHOR, PULSE_BEAT_MS, BEAT_WINDOW_MS);
}

describe("on the beat", () => {
  it("counts a note on the pulse, just before it, and just after it", () => {
    expect(at(0)).toBe("on-time");
    expect(at(BEAT_WINDOW_MS)).toBe("on-time");
    expect(at(PULSE_BEAT_MS - BEAT_WINDOW_MS)).toBe("on-time");
    expect(at(PULSE_BEAT_MS)).toBe("on-time");
    expect(at(PULSE_BEAT_MS + 40)).toBe("on-time");
  });

  it("does not count a note that is clearly early or clearly late", () => {
    expect(at(BEAT_WINDOW_MS + 1)).toBe("late");
    expect(at(PULSE_BEAT_MS / 2)).toBe("late");
    expect(at(PULSE_BEAT_MS - BEAT_WINDOW_MS - 1)).toBe("early");
    expect(at(500)).toBe("early");
  });
});

describe("on the beat course step", () => {
  const ids = COURSE_UNITS.map((unit) => unit.id);
  const unit = COURSE_UNITS.find((item) => item.id === "on-the-beat");
  const whites = new Set([60, 62, 64, 65, 67]);

  it("is the only beat gate, after Soft and Loud, for a short right-hand pattern", () => {
    expect(ids.at(-1)).toBe("on-the-beat");
    expect(ids.at(-2)).toBe("soft-loud");
    expect(COURSE_UNITS.filter((item) => beatGateRequired(item)).map((item) => item.id)).toEqual(["on-the-beat"]);
    expect(unit?.rhythm).toBe(false);
    expect(unit?.keyboard).toBe("treble");
    expect(unit?.timing).toBe(true);

    for (const stage of unit?.stages ?? []) {
      expect(stage.notes.length).toBeLessThanOrEqual(4);
      for (const note of stage.notes) {
        expect(note.hand ?? "right").toBe("right");
        expect(note.together).toBeUndefined();
        expect(note.dynamic).toBeUndefined();
        expect(whites.has(note.midi as number)).toBe(true);
      }
    }

    const steady = COURSE_UNITS.find((item) => item.id === "rhythm-beats");
    expect(beatGateRequired(steady)).toBe(false);
    const held = steady?.stages[1].notes[1];
    expect(noteNeedsHold(Boolean(steady?.rhythm), held ?? { midi: null })).toBe(true);
  });
});
