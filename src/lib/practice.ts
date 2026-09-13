import type { FeedbackKind } from "../types";

export function classifyAttempt(
  playedMidi: number,
  targetMidi: number | null,
  hintVisible: boolean,
): Exclude<FeedbackKind, "idle"> {
  if (targetMidi == null || playedMidi !== targetMidi) return "wrong";
  return hintVisible ? "correct-after-hint" : "correct";
}

export function shouldAdvance(kind: FeedbackKind): boolean {
  return kind === "correct" || kind === "correct-after-hint";
}

export function nextHintVisible(stageShowsHints: boolean): boolean {
  return stageShowsHints;
}
