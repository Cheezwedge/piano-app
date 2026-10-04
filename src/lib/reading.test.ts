import { describe, expect, it } from "vitest";
import { COURSE_UNITS } from "../data/courses";
import { staffStepsFromE4 } from "../components/Staff";
import {
  MIDDLE_C_MIDI,
  TREBLE_G_MIDI,
  initialHintVisible,
  isOctaveWhiteKey,
  isSkip,
  isStep,
  showReadingAnswer,
} from "./reading";

describe("one-octave staff reading", () => {
  const unit = COURSE_UNITS.find((item) => item.id === "staff-reading");

  it("places middle C on a ledger and G on the second line", () => {
    expect(staffStepsFromE4(MIDDLE_C_MIDI)).toBe(-2);
    expect(staffStepsFromE4(TREBLE_G_MIDI)).toBe(2);
    expect(staffStepsFromE4(72)).toBe(5);
  });

  it("teaches the two landmarks, then steps, then skips", () => {
    expect(unit?.reading).toBe(true);
    expect(unit?.rhythm).toBe(false);
    expect(unit?.keyboard).toBe("treble");
    const [demo, steps, skips] = unit?.stages ?? [];
    expect(demo?.kind).toBe("demo");
    expect(steps?.kind).toBe("guided");
    expect(skips?.kind).toBe("melody");

    const demoMidis = (demo?.notes ?? []).map((note) => note.midi);
    expect(demoMidis).toContain(MIDDLE_C_MIDI);
    expect(demoMidis).toContain(TREBLE_G_MIDI);

    const stepMidis = (steps?.notes ?? []).map((note) => note.midi as number);
    for (let i = 1; i < stepMidis.length; i += 1) {
      expect(isStep(stepMidis[i - 1], stepMidis[i])).toBe(true);
    }

    const skipMidis = (skips?.notes ?? []).map((note) => note.midi as number);
    const moves = skipMidis.slice(1).map((midi, index) => staffDistanceSafe(skipMidis[index], midi));
    expect(moves.some((distance) => distance === 2)).toBe(true);
    expect(moves.every((distance) => distance === 1 || distance === 2)).toBe(true);
    expect(moves.filter((distance) => distance === 2).length).toBeGreaterThanOrEqual(4);
  });

  it("stays on white keys from middle C to high C", () => {
    for (const stage of unit?.stages ?? []) {
      for (const note of stage.notes) {
        expect(isOctaveWhiteKey(note.midi)).toBe(true);
        expect(note.hand ?? "right").toBe("right");
      }
    }
  });

  it("hides the answer until a hint, and still shows it on the demo", () => {
    expect(initialHintVisible("demo", true)).toBe(true);
    expect(initialHintVisible("guided", true)).toBe(false);
    expect(initialHintVisible("melody", true)).toBe(false);
    expect(initialHintVisible("guided", false)).toBe(true);
    expect(initialHintVisible("melody", false)).toBe(false);

    expect(showReadingAnswer(true, false, false)).toBe(false);
    expect(showReadingAnswer(true, false, true)).toBe(true);
    expect(showReadingAnswer(true, true, false)).toBe(true);
    expect(showReadingAnswer(false, false, false)).toBe(true);
  });
});

function staffDistanceSafe(from: number, to: number): number {
  return isStep(from, to) ? 1 : isSkip(from, to) ? 2 : -1;
}
