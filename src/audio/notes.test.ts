import { describe, expect, it } from "vitest";
import {
  C4_HZ,
  C4_MIDI,
  centsFromMidi,
  freqToMidi,
  isConfidentPitch,
  midiToFreq,
  midiToName,
} from "./notes";

describe("note math", () => {
  it("maps middle C to MIDI 60", () => {
    expect(freqToMidi(C4_HZ)).toBe(C4_MIDI);
    expect(midiToName(C4_MIDI)).toBe("C4");
  });

  it("round-trips Lesson 1 notes", () => {
    for (const midi of [60, 62, 64, 65, 67]) {
      expect(freqToMidi(midiToFreq(midi))).toBe(midi);
    }
  });

  it("applies calibration in cents", () => {
    const sharp = midiToFreq(60) * 2 ** (25 / 1200);
    expect(freqToMidi(sharp)).toBe(60);
    expect(freqToMidi(sharp, 25)).toBe(60);
    expect(Math.abs(centsFromMidi(sharp, 60, 25))).toBeLessThan(1);
  });

  it("rejects muddy pitch", () => {
    expect(isConfidentPitch(C4_HZ, 0.4, C4_MIDI)).toBe(false);
    expect(isConfidentPitch(C4_HZ, 0.95, C4_MIDI)).toBe(true);
    expect(isConfidentPitch(midiToFreq(62), 0.95, C4_MIDI)).toBe(false);
  });
});
