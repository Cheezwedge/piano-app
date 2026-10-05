import { describe, expect, it } from "vitest";
import { parseMidiMessage } from "./midi";

describe("MIDI messages", () => {
  it("reads note-on and treats note-off, including velocity 0, as a release", () => {
    expect(parseMidiMessage([0x90, 60, 80])).toEqual({ kind: "on", midi: 60, velocity: 80 });
    expect(parseMidiMessage([0x80, 60, 0])).toEqual({ kind: "off", midi: 60, velocity: 0 });
    expect(parseMidiMessage([0x90, 64, 0])).toEqual({ kind: "off", midi: 64, velocity: 0 });
    expect(parseMidiMessage([0x90, 60])).toBeNull();
  });
});