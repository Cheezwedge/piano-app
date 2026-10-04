import { describe, expect, it } from "vitest";
import { COURSE_UNITS } from "../data/courses";
import { staffStepsFromE4 } from "../components/Staff";
import {
  MIDDLE_C_MIDI,
  TREBLE_G_MIDI,
  hiddenReadingKicker,
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

const BASS_WHITES = [48, 50, 52, 53, 55];

describe("bass clef, left hand only", () => {
  const unit = COURSE_UNITS.find((item) => item.id === "bass-clef");

  it("teaches F on the fourth line, then steps, then a short walk that visits low C", () => {
    expect(unit?.reading).toBe(true);
    expect(unit?.rhythm).toBe(false);
    expect(unit?.keyboard).toBe("wide");
    const [demo, steps, melody] = unit?.stages ?? [];
    expect(demo?.kind).toBe("demo");
    expect(steps?.kind).toBe("guided");
    expect(melody?.kind).toBe("melody");

    const demoMidis = (demo?.notes ?? []).map((note) => note.midi);
    expect(demoMidis[0]).toBe(53);
    expect(demoMidis).toContain(53);

    const stepMidis = (steps?.notes ?? []).map((note) => note.midi as number);
    expect(stepMidis).toContain(53);
    expect(stepMidis).toContain(48);
    for (let i = 1; i < stepMidis.length; i += 1) {
      expect(isStep(stepMidis[i - 1], stepMidis[i])).toBe(true);
    }

    const melodyMidis = (melody?.notes ?? []).map((note) => note.midi as number);
    expect(melodyMidis).toContain(53);
    expect(melodyMidis).toContain(48);
    const moves = melodyMidis.slice(1).map((midi, index) => staffDistanceSafe(melodyMidis[index], midi));
    expect(moves.some((distance) => distance === 2)).toBe(true);
    expect(moves.every((distance) => distance === 1 || distance === 2)).toBe(true);
  });

  it("uses only left-hand white keys around F, with the right hand silent", () => {
    for (const stage of unit?.stages ?? []) {
      for (const note of stage.notes) {
        expect(note.hand).toBe("left");
        expect(note.duration ?? "quarter").toBe("quarter");
        expect(note.midi).not.toBeNull();
        expect(BASS_WHITES).toContain(note.midi);
        expect((note.midi as number) < 60).toBe(true);
      }
    }
  });

  it("names the left hand while the pitch stays hidden", () => {
    expect(hiddenReadingKicker("left")).toBe("Left hand");
    expect(hiddenReadingKicker("right")).toBe("Read the staff");
    expect(showReadingAnswer(true, false, false)).toBe(false);
    expect(initialHintVisible("guided", true)).toBe(false);
  });

  it("leaves the two-hand hello sequential", () => {
    const hello = COURSE_UNITS.find((item) => item.id === "twohands-hello");
    expect(hello?.reading).toBeUndefined();
    const melody = hello?.stages[2].notes ?? [];
    expect(melody.map((note) => note.midi)).toEqual([48, 55, 60, 64, 67, 64, 60, 48]);
    expect(melody.map((note) => note.hand ?? "right")).toEqual([
      "left",
      "left",
      "right",
      "right",
      "right",
      "right",
      "right",
      "left",
    ]);
  });
});
