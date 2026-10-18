import { describe, expect, it } from "vitest";
import { PITCH_ATTACK_FRAMES } from "../audio/pitchGate";
import type { LessonNote } from "../types";
import { starsFromCounts } from "./progress";
import { onRhythmRelease, requiredHoldMs } from "./rhythm";
import {
  LEAD_BEATS,
  MIC_LATENCY_MS,
  MIC_POLL_MS,
  TIMED_BEAT_MS,
  beatMsForTempo,
  compensatedAt,
  createTimedSession,
  holdFill,
  holdReached,
  judgeArrival,
  noteExpectedAt,
  reduceTimed,
  scheduleNotes,
  scoreTimedMarks,
  scrollingClef,
  timedCueCopy,
  upcomingTarget,
  windowsForBeat,
  type TimedSession,
} from "./timedPlay";

const C: LessonNote = { midi: 60, name: "C", finger: 1, duration: "quarter" };
const D: LessonNote = { midi: 62, name: "D", finger: 2, duration: "quarter" };
const E: LessonNote = { midi: 64, name: "E", finger: 3, duration: "half" };
const REST: LessonNote = { midi: null, name: "Rest", finger: 0, duration: "rest" };

function session(notes: LessonNote[], tempo: 50 | 75 | 100 = 100, origin = 0): TimedSession {
  return createTimedSession(notes, origin, tempo);
}

function attack(state: TimedSession, midi: number, at: number, source: "mic" | "midi" | "screen" = "screen", velocity?: number) {
  return reduceTimed(state, { type: "attack", midi, at, source, velocity });
}

function release(state: TimedSession, midi: number, at: number, source: "mic" | "midi" | "screen" = "screen") {
  return reduceTimed(state, { type: "release", midi, at, source });
}

describe("timed play tempo and windows", () => {
  it("keeps 100% on the Steady Beats count and slows 75 and 50", () => {
    expect(beatMsForTempo(100)).toBe(TIMED_BEAT_MS);
    expect(beatMsForTempo(75)).toBe(Math.round(TIMED_BEAT_MS * (100 / 75)));
    expect(beatMsForTempo(50)).toBe(TIMED_BEAT_MS * 2);
    expect(beatMsForTempo(50)).toBeGreaterThan(beatMsForTempo(75));
    expect(beatMsForTempo(75)).toBeGreaterThan(beatMsForTempo(100));
  });

  it("names early, on time, and late, and leaves the outside as a miss", () => {
    const windows = windowsForBeat(700);
    expect(judgeArrival(0, windows)).toBe("on-time");
    expect(judgeArrival(windows.onTimeMs, windows)).toBe("on-time");
    expect(judgeArrival(-windows.onTimeMs, windows)).toBe("on-time");
    expect(judgeArrival(-windows.onTimeMs - 1, windows)).toBe("early");
    expect(judgeArrival(-(windows.onTimeMs + windows.earlyMs), windows)).toBe("early");
    expect(judgeArrival(-(windows.onTimeMs + windows.earlyMs) - 1, windows)).toBe("miss");
    expect(judgeArrival(windows.onTimeMs + 1, windows)).toBe("late");
    expect(judgeArrival(windows.onTimeMs + windows.lateMs, windows)).toBe("late");
    expect(judgeArrival(windows.onTimeMs + windows.lateMs + 1, windows)).toBe("miss");
  });

  it("widens the bands when the tempo is slower", () => {
    const full = windowsForBeat(beatMsForTempo(100));
    const half = windowsForBeat(beatMsForTempo(50));
    expect(half.onTimeMs).toBeGreaterThan(full.onTimeMs);
    expect(half.earlyMs).toBeGreaterThan(full.earlyMs);
    expect(half.lateMs).toBeGreaterThan(full.lateMs);
  });
});

describe("mic latency", () => {
  it("shifts only the microphone by the pitch-gate wait", () => {
    expect(MIC_LATENCY_MS).toBe(PITCH_ATTACK_FRAMES * MIC_POLL_MS);
    expect(compensatedAt(5_000, "mic")).toBe(5_000 - MIC_LATENCY_MS);
    expect(compensatedAt(5_000, "midi")).toBe(5_000);
    expect(compensatedAt(5_000, "screen")).toBe(5_000);
  });

  it("counts a mic note that is detected late but was played on the line", () => {
    const state = session([C]);
    const expected = noteExpectedAt(state, 0);
    const detected = expected + 200;
    const fromMic = attack(state, 60, detected, "mic");
    const fromMidi = attack(state, 60, detected, "midi");
    expect(fromMic.session.hold?.arrival).toBe("on-time");
    expect(fromMic.session.hold?.startedAt).toBe(detected - MIC_LATENCY_MS);
    expect(fromMidi.session.hold?.arrival).toBe("late");
  });
});

describe("hold through the written value", () => {
  it("does not count a release before the bar is full", () => {
    const state = session([E]);
    const expected = noteExpectedAt(state, 0);
    const required = requiredHoldMs("half", state.beatMs);
    const started = attack(state, 64, expected, "screen");
    expect(started.session.hold).not.toBeNull();
    expect(started.sound).toBe("hold");

    const earlyAt = expected + required - 1;
    const rhythm = onRhythmRelease(
      { midi: 64, startedAt: expected, kind: "correct" },
      64,
      required,
      earlyAt,
    );
    expect(rhythm.outcome.type).toBe("early-release");

    const early = release(started.session, 64, earlyAt);
    expect(early.session.hold).toBeNull();
    expect(early.session.marks[0]).toBe("short");
    expect(early.session.cue.kind).toBe("short");
    expect(scoreTimedMarks(early.session.marks)).toEqual({ wrongs: 1, scored: 1 });
  });

  it("counts a release once the hold has lasted the full value", () => {
    const state = session([E]);
    const expected = noteExpectedAt(state, 0);
    const required = requiredHoldMs("half", state.beatMs);
    const started = attack(state, 64, expected, "midi");
    const done = release(started.session, 64, expected + required, "midi");
    expect(done.session.marks[0]).toBe("on-time");
    expect(done.session.cue.kind).toBe("on-time");
    expect(scoreTimedMarks(done.session.marks)).toEqual({ wrongs: 0, scored: 1 });
  });

  it("counts a key that stays down until the fill finishes, without asking for a release first", () => {
    const state = session([C]);
    const expected = noteExpectedAt(state, 0);
    const required = requiredHoldMs("quarter", state.beatMs);
    const started = attack(state, 60, expected, "screen");
    expect(holdReached(expected, expected + required - 1, required)).toBe(false);
    expect(holdFill(expected, expected + required / 2, required)).toBeCloseTo(0.5);

    const midway = reduceTimed(started.session, { type: "tick", now: expected + required - 1 });
    expect(midway.session.marks[0]).toBeNull();
    expect(holdFill(expected, expected + required - 1, required)).toBeLessThan(1);

    const filled = reduceTimed(started.session, { type: "tick", now: expected + required });
    expect(holdReached(expected, expected + required, required)).toBe(true);
    expect(filled.session.marks[0]).toBe("on-time");
    expect(filled.session.hold).toBeNull();
  });

  it("lets a later full hold count after an early release", () => {
    const state = session([E]);
    const expected = noteExpectedAt(state, 0);
    const required = requiredHoldMs("half", state.beatMs);
    const first = attack(state, 64, expected, "screen");
    const early = release(first.session, 64, expected + 80);
    expect(early.session.marks[0]).toBeNull();

    const again = attack(early.session, 64, expected + 200, "screen");
    expect(again.session.hold?.arrival).toBe("late");
    const done = release(again.session, 64, expected + 200 + required);
    expect(done.session.marks[0]).toBe("late");
    expect(scoreTimedMarks(done.session.marks).wrongs).toBe(1);
  });

  it("does not start a hold on the wrong key", () => {
    const state = session([C]);
    const expected = noteExpectedAt(state, 0);
    const missed = attack(state, 62, expected, "screen");
    expect(missed.session.hold).toBeNull();
    expect(missed.session.marks[0]).toBeNull();
    expect(missed.session.cue.kind).toBe("listen");
    expect(missed.sound).toBe("tap");
  });
});

describe("timed scroll scoring", () => {
  it("schedules holds and rests on one beat line and picks the clef", () => {
    const notes = scheduleNotes([C, D, E, REST, { ...C, duration: "whole" }]);
    expect(notes.map((note) => note.startBeat)).toEqual([0, 1, 2, 4, 5]);
    expect(notes.map((note) => note.beats)).toEqual([1, 1, 2, 1, 4]);
    expect(scrollingClef(notes)).toBe("treble");
    const low: LessonNote = { midi: 48, name: "C", finger: 5, hand: "left" };
    expect(scrollingClef(scheduleNotes([low]))).toBe("bass");
    expect(scrollingClef(scheduleNotes([{ ...C, together: { midi: 48, name: "C", finger: 5, hand: "left" } }]))).toBe("grand");
  });

  it("does not miss a note during the lead-in", () => {
    const state = session([C, D]);
    const tick = reduceTimed(state, { type: "tick", now: state.origin + state.beatMs });
    expect(tick.session.marks).toEqual([null, null]);
    expect(tick.pulse).toBe(true);
    expect(upcomingTarget(tick.session)?.midi).toBe(60);
  });

  it("marks a note missed once its late band has passed, and keeps going", () => {
    const state = session([C, D]);
    const windows = windowsForBeat(state.beatMs);
    const deadline = noteExpectedAt(state, 0) + windows.onTimeMs + windows.lateMs;
    const tooSoon = reduceTimed(state, { type: "tick", now: deadline + MIC_LATENCY_MS });
    expect(tooSoon.session.marks[0]).toBeNull();
    const missed = reduceTimed(state, { type: "tick", now: deadline + MIC_LATENCY_MS + 1 });
    expect(missed.session.marks[0]).toBe("miss");
    expect(missed.session.cue.kind).toBe("miss");
    expect(upcomingTarget(missed.session)?.midi).toBe(62);

    const nextAt = noteExpectedAt(state, 1);
    const played = attack(missed.session, 62, nextAt, "screen");
    const required = requiredHoldMs("quarter", state.beatMs);
    const done = release(played.session, 62, nextAt + required);
    expect(done.session.marks).toEqual(["miss", "on-time"]);
  });

  it("keeps a rest quiet, and a sound on the rest does not pass it", () => {
    const state = session([C, REST, D]);
    const restStart = noteExpectedAt(state, 1);
    const noisy = attack(state, 64, restStart + 40, "screen");
    expect(noisy.session.cue.kind).toBe("quiet");
    const after = reduceTimed(noisy.session, { type: "tick", now: restStart + state.beatMs });
    expect(after.session.marks[1]).toBe("rest-sound");

    const quiet = session([REST]);
    const end = noteExpectedAt(quiet, 0) + quiet.beatMs;
    const settled = reduceTimed(quiet, { type: "tick", now: end });
    expect(settled.session.marks[0]).toBe("rest-ok");
  });

  it("uses early and late in the star count without treating them as a stopped lesson", () => {
    const clean = scoreTimedMarks(["on-time", "rest-ok", "on-time"]);
    expect(starsFromCounts(clean.wrongs, clean.scored)).toBe(3);

    const mixed = scoreTimedMarks(["early", "on-time", "late", "miss", "short"]);
    expect(mixed).toEqual({ wrongs: 4, scored: 5 });
    expect(starsFromCounts(mixed.wrongs, mixed.scored)).toBe(1);

    const half = scoreTimedMarks(["on-time", "on-time", "early", "rest-ok"]);
    expect(starsFromCounts(half.wrongs, half.scored)).toBe(2);
  });

  it("speaks in gentle words", () => {
    for (const cue of [
      timedCueCopy({ kind: "early" }),
      timedCueCopy({ kind: "late" }),
      timedCueCopy({ kind: "miss" }),
      timedCueCopy({ kind: "short" }),
      timedCueCopy({ kind: "on-time" }),
    ]) {
      expect(cue.toLowerCase()).not.toMatch(/fail|wrong|try again/);
    }
    expect(timedCueCopy({ kind: "early" })).toBe("A little early.");
    expect(timedCueCopy({ kind: "on-time" })).toBe("With the beat.");
    expect(LEAD_BEATS).toBeGreaterThan(0);
  });
});

describe("hands together and loudness in timed play", () => {
  const together: LessonNote = {
    midi: 60,
    name: "C",
    finger: 1,
    duration: "quarter",
    together: { midi: 48, name: "C", finger: 5, hand: "left" },
  };

  it("does not count the right hand until the low key is held through the bar", () => {
    const state = session([together]);
    const expected = noteExpectedAt(state, 0);
    const melodyOnly = attack(state, 60, expected, "screen");
    expect(melodyOnly.session.hold).toBeNull();
    expect(melodyOnly.session.cue.kind).toBe("low-key");

    const bass = attack(state, 48, expected - 30, "screen");
    expect(bass.session.bassDown).toBe(48);
    const both = attack(bass.session, 60, expected, "screen");
    expect(both.session.hold?.arrival).toBe("on-time");

    const required = requiredHoldMs("quarter", state.beatMs);
    const earlyBass = release(both.session, 48, expected + 40);
    expect(earlyBass.session.marks[0]).toBeNull();
    expect(earlyBass.session.cue.kind).toBe("short");

    const againBass = attack(earlyBass.session, 48, expected + 50, "screen");
    const again = attack(againBass.session, 60, expected + 80, "screen");
    const done = release(again.session, 60, expected + 80 + required);
    expect(done.session.marks[0]).toBe("on-time");
  });

  it("asks for the written loudness on a key that reports velocity, and trusts the mic", () => {
    const soft: LessonNote = { ...C, dynamic: "soft" };
    const state = session([soft]);
    const expected = noteExpectedAt(state, 0);
    const loud = attack(state, 60, expected, "midi", 120);
    expect(loud.session.hold).toBeNull();
    expect(loud.session.cue).toEqual({ kind: "dynamic", word: "soft" });

    const quiet = attack(state, 60, expected, "screen", 32);
    expect(quiet.session.hold?.arrival).toBe("on-time");

    const mic = attack(state, 60, expected + MIC_LATENCY_MS, "mic");
    expect(mic.session.hold?.arrival).toBe("on-time");
  });
});
