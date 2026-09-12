export interface MidiHit {
  midi: number;
  velocity: number;
}

interface MidiWatchOptions {
  onNote: (hit: MidiHit) => void;
  onStatus: (label: string) => void;
}

export async function startMidiWatch(options: MidiWatchOptions): Promise<() => void> {
  if (!("requestMIDIAccess" in navigator)) {
    options.onStatus("Web MIDI is not available in this browser.");
    return () => {};
  }

  const access = await navigator.requestMIDIAccess({ sysex: false });

  const describe = () => {
    const names: string[] = [];
    access.inputs.forEach((input) => {
      if (input.name) names.push(input.name);
    });
    options.onStatus(names.length ? `MIDI: ${names.join(", ")}` : "MIDI on — plug in a keyboard");
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

  const bind = (input: MIDIInput) => {
    input.addEventListener("midimessage", handle);
  };

  access.inputs.forEach(bind);
  access.addEventListener("statechange", () => {
    access.inputs.forEach(bind);
    describe();
  });
  describe();

  return () => {
    access.inputs.forEach((input) => input.removeEventListener("midimessage", handle));
  };
}
