import type { ListenChannel } from "./listenStatus";

export interface MidiHit {
  midi: number;
  velocity: number;
  /** performance.now() when the message was handled. */
  at: number;
}

export type MidiMessageKind = "on" | "off";

/** Short pill text when Web MIDI itself is missing (iPad Safari). */
export const MIDI_UNSUPPORTED_DETAIL = "Not in this browser";

/** Short pill text when the API works but nothing is plugged in. */
export const MIDI_NO_DEVICE_DETAIL = "No keyboard connected";

/** Short pill text when the browser refuses the MIDI prompt. */
export const MIDI_BLOCKED_DETAIL = "MIDI was blocked";

/** Note-on with velocity, or note-off (including note-on velocity 0). */
export function parseMidiMessage(data: Uint8Array | number[]): { kind: MidiMessageKind; midi: number; velocity: number } | null {
  if (data.length < 3) return null;
  const status = data[0] & 0xf0;
  const note = data[1];
  const velocity = data[2];
  if (status === 0x90 && velocity > 0) return { kind: "on", midi: note, velocity };
  if (status === 0x80 || (status === 0x90 && velocity === 0)) return { kind: "off", midi: note, velocity };
  return null;
}

/** What to tell a child when a USB keyboard cannot be used. Mic and on-screen keys stay available. */
export function midiFallbackMessage(detail?: string): string {
  if (detail === MIDI_UNSUPPORTED_DETAIL) {
    return "This browser has no Web MIDI, including iPad Safari. Use the microphone or the on-screen keys.";
  }
  if (detail === MIDI_BLOCKED_DETAIL) {
    return "The browser blocked MIDI. Use the microphone or the on-screen keys.";
  }
  return "No USB keyboard is connected. Use the microphone or the on-screen keys.";
}

interface MidiWatchOptions {
  onNote: (hit: MidiHit) => void;
  onRelease?: (hit: MidiHit) => void;
  onStatus: (state: ListenChannel) => void;
}

function requestMidi(): Navigator["requestMIDIAccess"] | undefined {
  try {
    const request = navigator.requestMIDIAccess;
    return typeof request === "function" ? request.bind(navigator) : undefined;
  } catch {
    return undefined;
  }
}

function connectedInputs(access: MIDIAccess): MIDIInput[] {
  const inputs: MIDIInput[] = [];
  access.inputs.forEach((input) => {
    if (input.state === "connected") inputs.push(input);
  });
  return inputs;
}

function deviceDetail(inputs: MIDIInput[]): string {
  const names = inputs.map((input) => input.name?.trim()).filter((name): name is string => Boolean(name));
  return names.length ? names.join(", ") : "MIDI keyboard";
}

export async function startMidiWatch(options: MidiWatchOptions): Promise<() => void> {
  const request = requestMidi();
  if (!request) {
    options.onStatus({ status: "error", detail: MIDI_UNSUPPORTED_DETAIL });
    return () => {};
  }

  options.onStatus({ status: "starting" });
  let access: MIDIAccess;
  try {
    access = await request({ sysex: false });
  } catch {
    options.onStatus({ status: "error", detail: MIDI_BLOCKED_DETAIL });
    return () => {};
  }

  let stopped = false;
  const bound = new Set<MIDIInput>();

  const handle = (event: Event) => {
    if (stopped) return;
    const data = (event as MIDIMessageEvent).data;
    if (!data) return;
    const parsed = parseMidiMessage(data);
    if (!parsed) return;
    const hit: MidiHit = { midi: parsed.midi, velocity: parsed.velocity, at: performance.now() };
    if (parsed.kind === "on") options.onNote(hit);
    else options.onRelease?.(hit);
  };

  const unbind = (input: MIDIInput) => {
    input.removeEventListener("midimessage", handle);
    bound.delete(input);
  };

  const sync = () => {
    if (stopped) return;
    const live = connectedInputs(access);
    const liveSet = new Set(live);
    for (const input of bound) {
      if (!liveSet.has(input)) unbind(input);
    }
    for (const input of live) {
      if (bound.has(input)) continue;
      input.addEventListener("midimessage", handle);
      bound.add(input);
    }
    if (live.length === 0) {
      options.onStatus({ status: "error", detail: MIDI_NO_DEVICE_DETAIL });
      return;
    }
    options.onStatus({ status: "connected", detail: deviceDetail(live) });
  };

  access.onstatechange = () => {
    sync();
  };
  sync();

  return () => {
    stopped = true;
    access.onstatechange = null;
    for (const input of bound) input.removeEventListener("midimessage", handle);
    bound.clear();
    access.inputs.forEach((input) => input.removeEventListener("midimessage", handle));
  };
}
