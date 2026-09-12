import { bindUnique } from "./midiBind";
import type { ListenChannel } from "./listenStatus";

export interface MidiHit {
  midi: number;
  velocity: number;
}

interface MidiWatchOptions {
  onNote: (hit: MidiHit) => void;
  onStatus: (state: ListenChannel) => void;
}

export async function startMidiWatch(options: MidiWatchOptions): Promise<() => void> {
  if (!("requestMIDIAccess" in navigator)) {
    options.onStatus({ status: "error", detail: "Not in this browser" });
    return () => {};
  }

  options.onStatus({ status: "starting" });
  const access = await navigator.requestMIDIAccess({ sysex: false });
  const bound = new WeakSet<object>();

  const describe = () => {
    const names: string[] = [];
    access.inputs.forEach((input) => {
      if (input.name) names.push(input.name);
    });
    options.onStatus({
      status: "listening",
      detail: names.length ? names.join(", ") : "plug in a keyboard",
    });
  };

  const handle = (event: Event) => {
    const message = event as MIDIMessageEvent;
    const data = message.data;
    if (!data || data.length < 3) return;
    const status = data[0] & 0xf0;
    const note = data[1];
    const velocity = data[2];
    if (status === 0x90 && velocity > 0) {
      options.onNote({ midi: note, velocity });
    }
  };

  const attachInputs = () => {
    const inputs: MIDIInput[] = [];
    access.inputs.forEach((input) => inputs.push(input));
    bindUnique(bound, inputs, (input) => {
      input.addEventListener("midimessage", handle);
    });
    describe();
  };

  const onStateChange = () => {
    attachInputs();
  };

  attachInputs();
  access.addEventListener("statechange", onStateChange);

  return () => {
    access.removeEventListener("statechange", onStateChange);
    access.inputs.forEach((input) => input.removeEventListener("midimessage", handle));
  };
}
