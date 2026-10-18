import { useCallback, useEffect, useRef, useState } from "react";
import { playPulse, resumeAudio } from "../audio/synth";
import {
  createTimedSession,
  reduceTimed,
  scoreTimedMarks,
  type TimedSession,
  type TimedSound,
} from "../lib/timedPlay";
import type { InputSource, LessonNote, TempoPercent } from "../types";

interface Options {
  enabled: boolean;
  notes: LessonNote[];
  tempoPercent: TempoPercent;
  resetKey: string;
  onFinished: (score: { wrongs: number; scored: number }, origin: number) => void;
}

export function useTimedStage({ enabled, notes, tempoPercent, resetKey, onFinished }: Options) {
  const [session, setSession] = useState<TimedSession | null>(null);
  const sessionRef = useRef<TimedSession | null>(null);
  const notesRef = useRef(notes);
  const onFinishedRef = useRef(onFinished);
  notesRef.current = notes;
  onFinishedRef.current = onFinished;

  useEffect(() => {
    if (!enabled) {
      sessionRef.current = null;
      setSession(null);
      return;
    }
    let stopped = false;
    const created = createTimedSession(notesRef.current, performance.now(), tempoPercent);
    sessionRef.current = created;
    setSession(created);
    void resumeAudio();
    const id = window.setInterval(() => {
      const current = sessionRef.current;
      if (!current || current.finished || stopped) return;
      const step = reduceTimed(current, { type: "tick", now: performance.now() });
      const changed =
        step.pulse ||
        step.justFinished ||
        step.session !== current;
      sessionRef.current = step.session;
      if (changed) setSession(step.session);
      if (step.pulse) playPulse();
      if (step.justFinished) onFinishedRef.current(scoreTimedMarks(step.session.marks), step.session.origin);
    }, 40);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [enabled, resetKey, tempoPercent]);

  const attack = useCallback((midi: number, source: InputSource, at: number, velocity?: number): TimedSound => {
    const current = sessionRef.current;
    if (!current || current.finished) return "none";
    const step = reduceTimed(current, { type: "attack", midi, at, source, velocity });
    sessionRef.current = step.session;
    setSession(step.session);
    if (step.justFinished) onFinishedRef.current(scoreTimedMarks(step.session.marks), step.session.origin);
    return step.sound;
  }, []);

  const release = useCallback((midi: number, source: InputSource, at: number) => {
    const current = sessionRef.current;
    if (!current || current.finished) return;
    const step = reduceTimed(current, { type: "release", midi, at, source });
    sessionRef.current = step.session;
    setSession(step.session);
    if (step.justFinished) onFinishedRef.current(scoreTimedMarks(step.session.marks), step.session.origin);
  }, []);

  return { session, attack, release };
}
