import { useEffect, useRef, useState } from "react";
import { midiToName } from "./notes";
import { startMidiWatch } from "./midi";
import { startMicWatch } from "./pitch";
import { resumeAudio } from "./synth";
import { LISTEN_OFF, type ListenChannel } from "./listenStatus";

export interface IncomingNote {
  midi: number;
  source: "mic" | "midi" | "screen";
}

interface Options {
  enabled: boolean;
  calibrationCents: number;
  onNote: (note: IncomingNote) => void;
}

export function useNoteInput({ enabled, calibrationCents, onNote }: Options) {
  const [mic, setMic] = useState<ListenChannel>(LISTEN_OFF);
  const [midi, setMidi] = useState<ListenChannel>(LISTEN_OFF);
  const [retryTick, setRetryTick] = useState(0);
  const onNoteRef = useRef(onNote);
  onNoteRef.current = onNote;
  const flashRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setMic(LISTEN_OFF);
      setMidi(LISTEN_OFF);
      return;
    }

    let stopMic: (() => void) | undefined;
    let stopMidi: (() => void) | undefined;
    let cancelled = false;

    const flash = (source: "mic" | "midi", midiNote: number) => {
      const next: ListenChannel = { status: "detected", detail: midiToName(midiNote) };
      if (source === "mic") setMic(next);
      else setMidi(next);
      window.clearTimeout(flashRef.current);
      flashRef.current = window.setTimeout(() => {
        if (source === "mic") setMic((prev) => (prev.status === "detected" ? { status: "listening" } : prev));
        else setMidi((prev) => (prev.status === "detected" ? { ...prev, status: "listening" } : prev));
      }, 900);
    };

    const start = async () => {
      await resumeAudio();
      setMic({ status: "starting" });
      setMidi({ status: "starting" });
      try {
        stopMic = await startMicWatch({
          calibrationCents,
          onNote: (hit) => {
            flash("mic", hit.midi);
            onNoteRef.current({ midi: hit.midi, source: "mic" });
          },
        });
        if (!cancelled) setMic({ status: "listening" });
        else stopMic();
      } catch {
        if (!cancelled) setMic({ status: "error", detail: "Permission needed" });
      }

      try {
        stopMidi = await startMidiWatch({
          onNote: (hit) => {
            flash("midi", hit.midi);
            onNoteRef.current({ midi: hit.midi, source: "midi" });
          },
          onStatus: (state) => {
            if (!cancelled) setMidi(state);
          },
        });
      } catch {
        if (!cancelled) setMidi({ status: "error", detail: "Unavailable" });
      }
    };

    void start();

    return () => {
      cancelled = true;
      window.clearTimeout(flashRef.current);
      stopMic?.();
      stopMidi?.();
    };
  }, [enabled, calibrationCents, retryTick]);

  const playOnScreen = (midiNote: number) => {
    onNoteRef.current({ midi: midiNote, source: "screen" });
  };

  const retryMic = () => {
    setRetryTick((tick) => tick + 1);
  };

  return { mic, midi, playOnScreen, retryMic };
}
