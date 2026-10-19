import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MIDI_BLOCKED_DETAIL,
  MIDI_NO_DEVICE_DETAIL,
  MIDI_UNSUPPORTED_DETAIL,
  midiFallbackMessage,
  parseMidiMessage,
  startMidiWatch,
  type MidiHit,
} from "./midi";
import type { ListenChannel } from "./listenStatus";

describe("MIDI messages", () => {
  it("reads note-on and treats note-off, including velocity 0, as a release", () => {
    expect(parseMidiMessage([0x90, 60, 80])).toEqual({ kind: "on", midi: 60, velocity: 80 });
    expect(parseMidiMessage([0x80, 60, 0])).toEqual({ kind: "off", midi: 60, velocity: 0 });
    expect(parseMidiMessage([0x90, 64, 0])).toEqual({ kind: "off", midi: 64, velocity: 0 });
    expect(parseMidiMessage([0x90, 60])).toBeNull();
  });

  it("tells the child to use the mic or on-screen keys when MIDI is missing", () => {
    expect(midiFallbackMessage(MIDI_UNSUPPORTED_DETAIL)).toMatch(/iPad Safari/);
    expect(midiFallbackMessage(MIDI_UNSUPPORTED_DETAIL)).toMatch(/on-screen keys/);
    expect(midiFallbackMessage(MIDI_NO_DEVICE_DETAIL)).toMatch(/microphone/);
    expect(midiFallbackMessage(MIDI_BLOCKED_DETAIL)).toMatch(/on-screen keys/);
  });
});

class FakeInput extends EventTarget {
  readonly id: string;
  name: string;
  state: MIDIPortDeviceState = "connected";
  constructor(id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
  }
}

function fakeAccess(inputs: Map<string, FakeInput>): MIDIAccess {
  return {
    inputs,
    outputs: new Map(),
    sysexEnabled: false,
    onstatechange: null,
  } as unknown as MIDIAccess;
}

function midiEvent(bytes: number[]): Event {
  const event = new Event("midimessage");
  Object.defineProperty(event, "data", { value: Uint8Array.from(bytes) });
  return event;
}

function fireState(access: MIDIAccess) {
  access.onstatechange?.call(access, new Event("statechange") as MIDIConnectionEvent);
}

describe("MIDI access", () => {
  const previous = Object.getOwnPropertyDescriptor(navigator, "requestMIDIAccess");

  afterEach(() => {
    if (previous) Object.defineProperty(navigator, "requestMIDIAccess", previous);
    else delete (navigator as { requestMIDIAccess?: unknown }).requestMIDIAccess;
  });

  function stubRequest(request: Navigator["requestMIDIAccess"] | undefined) {
    Object.defineProperty(navigator, "requestMIDIAccess", {
      configurable: true,
      writable: true,
      value: request,
    });
  }

  it("falls back when this browser has no Web MIDI", async () => {
    stubRequest(undefined);
    const statuses: ListenChannel[] = [];
    const stop = await startMidiWatch({
      onNote: () => {},
      onStatus: (state) => statuses.push(state),
    });
    expect(statuses).toEqual([{ status: "error", detail: MIDI_UNSUPPORTED_DETAIL }]);
    stop();
  });

  it("falls back when the MIDI prompt is blocked", async () => {
    stubRequest(vi.fn(async () => {
      throw new DOMException("denied", "SecurityError");
    }) as Navigator["requestMIDIAccess"]);
    const statuses: ListenChannel[] = [];
    const stop = await startMidiWatch({
      onNote: () => {},
      onStatus: (state) => statuses.push(state),
    });
    expect(statuses.at(-1)).toEqual({ status: "error", detail: MIDI_BLOCKED_DETAIL });
    stop();
  });

  it("names the keyboard, follows hot-plug, and treats velocity 0 as note-off", async () => {
    const inputs = new Map<string, FakeInput>();
    const access = fakeAccess(inputs);
    const request = vi.fn(async (options?: MIDIOptions) => {
      expect(options).toEqual({ sysex: false });
      return access;
    });
    stubRequest(request as Navigator["requestMIDIAccess"]);

    const statuses: ListenChannel[] = [];
    const notes: MidiHit[] = [];
    const releases: MidiHit[] = [];
    const stop = await startMidiWatch({
      onNote: (hit) => notes.push(hit),
      onRelease: (hit) => releases.push(hit),
      onStatus: (state) => statuses.push(state),
    });

    expect(request).toHaveBeenCalledWith({ sysex: false });
    expect(statuses.at(-1)).toEqual({ status: "error", detail: MIDI_NO_DEVICE_DETAIL });

    const piano = new FakeInput("kb", "Practice Piano");
    inputs.set(piano.id, piano);
    fireState(access);
    expect(statuses.at(-1)).toEqual({ status: "connected", detail: "Practice Piano" });

    piano.dispatchEvent(midiEvent([0x90, 60, 0]));
    expect(notes).toHaveLength(0);
    expect(releases.map((hit) => hit.midi)).toEqual([60]);

    piano.dispatchEvent(midiEvent([0x90, 62, 40]));
    expect(notes.map((hit) => [hit.midi, hit.velocity])).toEqual([[62, 40]]);

    fireState(access);
    fireState(access);
    piano.dispatchEvent(midiEvent([0x90, 64, 70]));
    expect(notes).toHaveLength(2);
    expect(notes.at(-1)?.midi).toBe(64);

    piano.state = "disconnected";
    fireState(access);
    expect(statuses.at(-1)).toEqual({ status: "error", detail: MIDI_NO_DEVICE_DETAIL });
    piano.dispatchEvent(midiEvent([0x90, 65, 80]));
    expect(notes).toHaveLength(2);

    piano.state = "connected";
    fireState(access);
    expect(statuses.at(-1)).toEqual({ status: "connected", detail: "Practice Piano" });
    piano.dispatchEvent(midiEvent([0x80, 62, 0]));
    expect(releases.map((hit) => hit.midi)).toEqual([60, 62]);

    stop();
    expect(access.onstatechange).toBeNull();
    piano.dispatchEvent(midiEvent([0x90, 67, 90]));
    fireState(access);
    expect(notes).toHaveLength(2);
    expect(statuses.at(-1)?.detail).toBe("Practice Piano");
  });
});
