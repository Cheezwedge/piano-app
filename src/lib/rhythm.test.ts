import { describe, expect, it } from "vitest";
import { COURSE_UNITS } from "../data/courses";
import { shouldAdvance } from "./practice";
import {
  RHYTHM_BEAT_MS,
  noteNeedsHold,
  onRhythmAttack,
  onRhythmRelease,
  requiredHoldMs,
  rhythmShouldAdvance,
} from "./rhythm";

describe("rhythm holds", () => {
  it("does not count a correct pitch that is released too early", () => {
    const required = requiredHoldMs("half");
    const started = onRhythmAttack(null, 64, 64, false, 0);
    expect(started.outcome.type).toBe("holding");
    expect(rhythmShouldAdvance(started.outcome)).toBe(false);

    const early = onRhythmRelease(started.hold, 64, required, required - 1);
    expect(early.outcome.type).toBe("early-release");
    expect(early.hold).toBeNull();
    expect(rhythmShouldAdvance(early.outcome)).toBe(false);
    expect(shouldAdvance("wrong")).toBe(false);
  });

  it("counts a note held for its full value and then released", () => {
    const required = requiredHoldMs("half");
    const started = onRhythmAttack(null, 64, 64, false, 1_000);
    const done = onRhythmRelease(started.hold, 64, required, 1_000 + required);
    expect(done.outcome).toEqual({ type: "completed", kind: "correct" });
    expect(rhythmShouldAdvance(done.outcome)).toBe(true);
  });

  it("accepts a hold that lasts longer than the note, once the key is released", () => {
    const required = requiredHoldMs("whole");
    const started = onRhythmAttack(null, 67, 67, false, 0);
    const done = onRhythmRelease(started.hold, 67, required, required + 800);
    expect(done.outcome).toEqual({ type: "completed", kind: "correct" });
  });

  it.each([
    ["quarter", 1],
    ["half", 2],
    ["whole", 4],
  ] as const)("fails an early %s release and passes a full hold", (duration, beats) => {
    const required = beats * RHYTHM_BEAT_MS;
    expect(requiredHoldMs(duration)).toBe(required);

    const started = onRhythmAttack(null, 60, 60, false, 0);
    const early = onRhythmRelease(started.hold, 60, required, required - 1);
    expect(early.outcome.type).toBe("early-release");
    expect(rhythmShouldAdvance(early.outcome)).toBe(false);

    const again = onRhythmAttack(null, 60, 60, false, 5_000);
    const full = onRhythmRelease(again.hold, 60, required, 5_000 + required);
    expect(full.outcome).toEqual({ type: "completed", kind: "correct" });
    expect(rhythmShouldAdvance(full.outcome)).toBe(true);
  });

  it("waits after an early release so a later full hold can still pass", () => {
    const required = requiredHoldMs("half");
    const first = onRhythmAttack(null, 64, 64, false, 0);
    const early = onRhythmRelease(first.hold, 64, required, 200);
    expect(rhythmShouldAdvance(early.outcome)).toBe(false);

    const second = onRhythmAttack(null, 64, 64, true, 400);
    const done = onRhythmRelease(second.hold, 64, required, 400 + required);
    expect(done.outcome).toEqual({ type: "completed", kind: "correct-after-hint" });
    expect(rhythmShouldAdvance(done.outcome)).toBe(true);
  });

  it("does not treat a wrong pitch as a hold", () => {
    const missed = onRhythmAttack(null, 62, 60, false, 0);
    expect(missed.hold).toBeNull();
    expect(missed.outcome.type).toBe("wrong-pitch");
    expect(rhythmShouldAdvance(missed.outcome)).toBe(false);
  });

  it("does not restart the count when the same key is heard again", () => {
    const required = requiredHoldMs("quarter");
    const started = onRhythmAttack(null, 60, 60, false, 0);
    const again = onRhythmAttack(started.hold, 60, 60, false, required - 10);
    expect(again.outcome.type).toBe("ignore");
    expect(again.hold?.startedAt).toBe(0);
    const done = onRhythmRelease(again.hold, 60, required, required);
    expect(done.outcome.type).toBe("completed");
  });

  it("ignores the release of a different key", () => {
    const started = onRhythmAttack(null, 64, 64, false, 0);
    const other = onRhythmRelease(started.hold, 60, requiredHoldMs("half"), 5_000);
    expect(other.outcome.type).toBe("ignore");
    expect(other.hold).toBe(started.hold);
    expect(rhythmShouldAdvance(other.outcome)).toBe(false);
  });

  it("requires holds only for sounding notes in a rhythm lesson", () => {
    const steady = COURSE_UNITS.find((unit) => unit.id === "rhythm-beats");
    expect(steady?.rhythm).toBe(true);
    const guided = steady?.stages.find((stage) => stage.id === "guided");
    const notes = guided?.notes ?? [];
    const quarter = notes.find((note) => note.duration === "quarter");
    const half = notes.find((note) => note.duration === "half");
    const whole = notes.find((note) => note.duration === "whole");
    const rest = notes.find((note) => note.duration === "rest");
    expect(quarter && noteNeedsHold(true, quarter)).toBe(true);
    expect(half && noteNeedsHold(true, half)).toBe(true);
    expect(whole && noteNeedsHold(true, whole)).toBe(true);
    expect(rest && noteNeedsHold(true, rest)).toBe(false);

    const home = COURSE_UNITS[0];
    expect(noteNeedsHold(home.rhythm, home.stages[1].notes[0])).toBe(false);
    expect(noteNeedsHold(false, { midi: 60, duration: "whole" })).toBe(false);
  });

  it("treats Quiet Clock's whole note as a four-count hold", () => {
    const melody = COURSE_UNITS.find((unit) => unit.id === "rhythm-beats")?.stages[2].notes ?? [];
    const whole = melody.find((note) => note.duration === "whole");
    expect(whole?.name).toBe("C");
    expect(requiredHoldMs(whole?.duration)).toBe(4 * RHYTHM_BEAT_MS);
    const started = onRhythmAttack(null, whole?.midi ?? 0, whole?.midi ?? null, false, 0);
    const early = onRhythmRelease(started.hold, whole?.midi ?? 0, requiredHoldMs("whole"), requiredHoldMs("whole") - 1);
    expect(early.outcome.type).toBe("early-release");
    const full = onRhythmRelease(
      onRhythmAttack(null, whole?.midi ?? 0, whole?.midi ?? null, false, 10).hold,
      whole?.midi ?? 0,
      requiredHoldMs("whole"),
      10 + requiredHoldMs("whole"),
    );
    expect(full.outcome.type).toBe("completed");
  });
});
