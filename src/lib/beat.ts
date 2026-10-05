/** How close a note has to be to the quiet pulse. Outside this, it is early or late. */
export const BEAT_WINDOW_MS = 160;

export const PULSE_BEAT_MS = 700;

export type BeatTiming = "early" | "on-time" | "late";

export function beatGateRequired(unit: { timing?: boolean } | undefined): boolean {
  return unit?.timing === true;
}

/**
 * Distance from the nearest pulse.
 * Near the pulse counts. Clearly after a pulse is late. Clearly before the next one is early.
 */
export function timingAgainstBeat(
  now: number,
  anchor: number,
  beatMs = PULSE_BEAT_MS,
  windowMs = BEAT_WINDOW_MS,
): BeatTiming {
  const elapsed = Math.max(0, now - anchor);
  const into = elapsed % beatMs;
  const sinceBeat = into;
  const untilBeat = into === 0 ? 0 : beatMs - into;
  if (sinceBeat <= windowMs || untilBeat <= windowMs) return "on-time";
  if (sinceBeat <= untilBeat) return "late";
  return "early";
}
