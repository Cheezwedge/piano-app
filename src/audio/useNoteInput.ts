import { useEffect, useRef, useState } from "react";
import { midiToName } from "./notes";
import { startMidiWatch } from "./midi";
import { startMicWatch } from "./pitch";
import { resumeAudio } from "./synth";
import { LISTEN_OFF, type ListenChannel } from "./listenStatus";

export interface IncomingNote {
  midi: number;
  source: "mic" | "midi" | "screen";
  /** When the attack or release happened. Omit to use the clock in the handler. */
  at?: number;
  /** MIDI note-on velocity. On-screen keys omit this and choose soft or loud themselves. */
  velocity?: number;
}

interface Options {
  enabled: boolean;
  calibrationCents: number;
  onNote: (note: IncomingNote) => void;
  onRelease?: (note: IncomingNote) => void;
}

export function useNoteInput({ enabled, calibrationCents, onNote, onRelease }: Options) {
  const [mic, setMic] = useState<ListenChannel>(LISTEN_OFF);
  const [midi, setMidi] = useState<ListenChannel>(LISTEN_OFF);
  const [retryTick, setRetryTick] = useState(0);
  const onNoteRef = useRef(onNote);
  const onReleaseRef = useRef(onRelease);
  onNoteRef.current = onNote;
  onReleaseRef.current = onRelease;
  const flashRef = useRef<number>(0);
  const midiBaseRef = useRef<ListenChannel>(LISTEN_OFF);

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
        else setMidi((prev) => (prev.status === "detected" ? midiBaseRef.current : prev));
      }, 900);
    };

    const start = async () => {
      await resumeAudio();
      setMic({ status: "starting" });
      midiBaseRef.current = { status: "starting" };
      setMidi(midiBaseRef.current);
      try {
        stopMic = await startMicWatch({
          calibrationCents,
          onNote: (hit) => {
            flash("mic", hit.midi);
            onNoteRef.current({ midi: hit.midi, source: "mic", at: performance.now() });
          },
          onRelease: (midiNote, at) => {
            onReleaseRef.current?.({ midi: midiNote, source: "mic", at });
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
            onNoteRef.current({ midi: hit.midi, source: "midi", at: hit.at, velocity: hit.velocity });
          },
          onRelease: (hit) => {
            onReleaseRef.current?.({ midi: hit.midi, source: "midi", at: hit.at });
          },
          onStatus: (state) => {
            if (state.status !== "detected") midiBaseRef.current = state;
            if (!cancelled) setMidi(state);
          },
        });
        if (cancelled) stopMidi();
      } catch {
        if (!cancelled) {
          midiBaseRef.current = { status: "error", detail: "Unavailable" };
          setMidi(midiBaseRef.current);
        }
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
