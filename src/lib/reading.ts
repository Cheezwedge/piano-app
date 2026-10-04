import { staffStepsFromE4 } from "../components/Staff";
import type { StageKind } from "../types";

/** Middle C, on the ledger line below the treble staff. */
export const MIDDLE_C_MIDI = 60;

/** G on the second line of the treble staff. The clef circles this line. */
export const TREBLE_G_MIDI = 67;

const OCTAVE_WHITES = [60, 62, 64, 65, 67, 69, 71, 72];

/** White keys from middle C up to the next C. No black keys. */
export function isOctaveWhiteKey(midi: number | null): boolean {
  return midi != null && OCTAVE_WHITES.includes(midi);
}

export function staffDistance(from: number, to: number): number {
  return Math.abs(staffStepsFromE4(to) - staffStepsFromE4(from));
}

/** Next door on the staff: line to space, or space to line. */
export function isStep(from: number, to: number): boolean {
  return staffDistance(from, to) === 1;
}

/** A skip jumps over one note: line to the next line, or space to the next space. */
export function isSkip(from: number, to: number): boolean {
  return staffDistance(from, to) === 2;
}

/**
 * Reading practice starts with the staff as the only clue.
 * Other guided stages still light the key immediately. Melody stages still wait.
 */
export function initialHintVisible(kind: StageKind, reading: boolean): boolean {
  if (kind === "demo") return true;
  if (reading) return false;
  return kind === "guided";
}

/** The letter and the glowing key stay hidden until a hint, except while listening to the demo. */
export function showReadingAnswer(reading: boolean, isDemo: boolean, hintVisible: boolean): boolean {
  if (!reading || isDemo) return true;
  return hintVisible;
}
