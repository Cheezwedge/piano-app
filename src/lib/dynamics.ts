import type { LessonNote } from "../types";

export type Dynamic = NonNullable<LessonNote["dynamic"]>;

/** MIDI velocities at or below this are soft. A middle value matches neither. */
export const SOFT_VELOCITY_MAX = 48;
/** MIDI velocities at or above this are loud. */
export const LOUD_VELOCITY_MIN = 96;

/** Peak gain the app uses so a child can hear the difference. Not a meter. */
export const SOFT_GAIN = 0.045;
export const LOUD_GAIN = 0.42;
export const MEDIUM_GAIN = 0.22;

export function dynamicFromVelocity(velocity: number): Dynamic | null {
  if (velocity <= SOFT_VELOCITY_MAX) return "soft";
  if (velocity >= LOUD_VELOCITY_MIN) return "loud";
  return null;
}

/** The on-screen Soft and Loud buttons become this MIDI velocity, then this sound. */
export function velocityForScreen(dynamic: Dynamic): number {
  return dynamic === "soft" ? 32 : 112;
}

export function gainForDynamic(dynamic: Dynamic | null): number {
  if (dynamic === "soft") return SOFT_GAIN;
  if (dynamic === "loud") return LOUD_GAIN;
  return MEDIUM_GAIN;
}

export type DynamicVerdict = "match" | "wrong-dynamic" | "unspecified";

/**
 * A note with no dynamic ignores loudness.
 * A soft target fails a loud hit. A loud target fails a soft hit.
 * No loudness at all (a middle velocity, or a source with none) also fails.
 */
export function judgeDynamic(target: Dynamic | undefined, played: Dynamic | null): DynamicVerdict {
  if (!target) return "unspecified";
  if (played == null || played !== target) return "wrong-dynamic";
  return "match";
}
