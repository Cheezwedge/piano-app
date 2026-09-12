import { useEffect, useRef, useState } from "react";
import { startMidiWatch } from "./midi";
import { startMicWatch } from "./pitch";
import { resumeAudio } from "./synth";

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
  const [micStatus, setMicStatus] = useState("Mic off");
  const [midiStatus, setMidiStatus] = useState("MIDI off");
  const [micError, setMicError] = useState<string | null>(null);
  const onNoteRef = useRef(onNote);
  onNoteRef.current = onNote;

  useEffect(() => {
    if (!enabled) {
      setMicStatus("Mic off");
      setMidiStatus("MIDI off");
      return;
    }

    let stopMic: (() => void) | undefined;
    let stopMidi: (() => void) | undefined;
    let cancelled = false;

    const start = async () => {
      await resumeAudio();
      try {
        stopMic = await startMicWatch({
          calibrationCents,
          onNote: (hit) => onNoteRef.current({ midi: hit.midi, source: "mic" }),
        });
        if (!cancelled) {
          setMicStatus("Mic listening");
          setMicError(null);
        } else {
          stopMic();
        }
      } catch {
        if (!cancelled) {
          setMicStatus("Mic blocked");
          setMicError("Microphone permission is needed for acoustic pianos.");
        }
      }

      try {
        stopMidi = await startMidiWatch({
          onNote: (hit) => onNoteRef.current({ midi: hit.midi, source: "midi" }),
          onStatus: (label) => {
            if (!cancelled) setMidiStatus(label);
          },
        });
      } catch {
        if (!cancelled) setMidiStatus("MIDI unavailable");
      }
    };

    void start();

    return () => {
      cancelled = true;
      stopMic?.();
      stopMidi?.();
    };
  }, [enabled, calibrationCents]);

  const playOnScreen = (midi: number) => {
    onNoteRef.current({ midi, source: "screen" });
  };

  return { micStatus, midiStatus, micError, playOnScreen };
}
