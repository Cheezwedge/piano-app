export const A4_HZ = 440;
export const C4_MIDI = 60;
export const C4_HZ = 261.6255653005986;

export const LESSON1_MIDIS = [60, 62, 64, 65, 67] as const;

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export function midiToFreq(midi: number): number {
  return A4_HZ * 2 ** ((midi - 69) / 12);
}

export function freqToMidiFloat(freq: number, calibrationCents = 0): number {
  const adjusted = freq * 2 ** (-calibrationCents / 1200);
  return 69 + 12 * Math.log2(adjusted / A4_HZ);
}

export function freqToMidi(freq: number, calibrationCents = 0): number {
  return Math.round(freqToMidiFloat(freq, calibrationCents));
}

export function centsFromMidi(freq: number, midi: number, calibrationCents = 0): number {
  const midiFloat = freqToMidiFloat(freq, calibrationCents);
  return (midiFloat - midi) * 100;
}

export function midiToName(midi: number): string {
  const name = NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

export function isConfidentPitch(
  freq: number,
  clarity: number,
  midi: number,
  calibrationCents = 0,
  maxCents = 50,
  minClarity = 0.85,
): boolean {
  if (!Number.isFinite(freq) || freq <= 0) return false;
  if (clarity < minClarity) return false;
  return Math.abs(centsFromMidi(freq, midi, calibrationCents)) <= maxCents;
}

export const WHITE_KEYS_C4_TO_C5 = [60, 62, 64, 65, 67, 69, 71, 72] as const;
export const BLACK_KEYS_C4_TO_C5 = [61, 63, 66, 68, 70] as const;
export const WHITE_KEYS_C3_TO_C5 = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72] as const;
export const BLACK_KEYS_C3_TO_C5 = [49, 51, 54, 56, 58, 61, 63, 66, 68, 70] as const;

export function whiteKeyIndex(midi: number, whites: readonly number[]): number {
  return whites.indexOf(midi);
}

export function blackKeyLeft(midi: number, whites: readonly number[]): string {
  const leftWhite = midi - 1;
  const index = whites.indexOf(leftWhite);
  const slot = index >= 0 ? index + 0.72 : 0;
  return `calc(${slot} * (100% / ${whites.length}))`;
}

export function durationBeats(duration: string | undefined): number {
  if (duration === "half") return 2;
  if (duration === "whole") return 4;
  if (duration === "rest") return 1;
  return 1;
}
