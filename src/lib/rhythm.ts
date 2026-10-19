import { durationBeats } from "../audio/notes";
import { classifyAttempt } from "./practice";
import type { NoteDuration } from "../types";

/** One count in Steady Beats. There is no click track — time is the hold. */
export const RHYTHM_BEAT_MS = 700;

export interface RhythmHold {
  midi: number;
  startedAt: number;
  kind: "correct" | "correct-after-hint";
}

export type RhythmOutcome =
  | { type: "ignore" }
  | { type: "wrong-pitch" }
  | { type: "holding" }
  | { type: "early-release" }
  | { type: "completed"; kind: "correct" | "correct-after-hint" };

/** Sounding notes in a rhythm lesson must be held. Rests stay a quiet wait. */
export function noteNeedsHold(
  rhythm: boolean,
  note: { midi: number | null; duration?: string },
): boolean {
  if (!rhythm) return false;
  if (note.midi == null || note.duration === "rest") return false;
  return true;
}

export function requiredHoldMs(duration: NoteDuration | string | undefined, beatMs = RHYTHM_BEAT_MS): number {
  return durationBeats(duration) * beatMs;
}

export function rhythmShouldAdvance(outcome: RhythmOutcome): boolean {
  return outcome.type === "completed";
}

/**
 * A correct pitch starts a hold. It is not a hit yet.
 * Pressing the same key again does not restart the count.
 */
export function onRhythmAttack(
  hold: RhythmHold | null,
  playedMidi: number,
  targetMidi: number | null,
  hintVisible: boolean,
  now: number,
): { hold: RhythmHold | null; outcome: RhythmOutcome } {
  const kind = classifyAttempt(playedMidi, targetMidi, hintVisible);
  if (kind === "wrong") {
    return { hold: null, outcome: { type: "wrong-pitch" } };
  }
  if (hold && hold.midi === playedMidi) {
    return { hold, outcome: { type: "ignore" } };
  }
  return {
    hold: { midi: playedMidi, startedAt: now, kind },
    outcome: { type: "holding" },
  };
}

/**
 * Letting go early is a miss. Letting go after the full value counts.
 * The lesson keeps waiting until both are true.
 */
export function onRhythmRelease(
  hold: RhythmHold | null,
  releasedMidi: number,
  requiredMs: number,
  now: number,
): { hold: RhythmHold | null; outcome: RhythmOutcome } {
  if (!hold || hold.midi !== releasedMidi) {
    return { hold, outcome: { type: "ignore" } };
  }
  if (now - hold.startedAt >= requiredMs) {
    return { hold: null, outcome: { type: "completed", kind: hold.kind } };
  }
  return { hold: null, outcome: { type: "early-release" } };
}
