import { useEffect, useRef, useState } from "react";
import { midiToName } from "../audio/notes";
import { playMidiNote, resumeAudio } from "../audio/synth";
import { useNoteInput } from "../audio/useNoteInput";
import { ListeningStatus } from "../components/ListeningStatus";
import { PianoKeyboard } from "../components/PianoKeyboard";
import { PinPad } from "../components/PinPad";
import { Staff } from "../components/Staff";
import { LESSON_1 } from "../data/lesson1";
import { classifyAttempt, shouldAdvance } from "../lib/practice";
import { useActiveKid, useApp } from "../store/AppState";
import type { FeedbackKind, LessonStage } from "../types";

const HINT_DELAY_MS = 5000;
const ADVANCE_MS = 900;

export function LessonScreen() {
  const { persist, setScreen, checkPin, markLesson1Complete, isParentUnlocked } = useApp();
  const kid = useActiveKid();
  const [stageIndex, setStageIndex] = useState(0);
  const [noteIndex, setNoteIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackKind>("idle");
  const [lastPlayed, setLastPlayed] = useState<number | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [lastSource, setLastSource] = useState<string>("");
  const lockedRef = useRef(false);
  const hintRef = useRef(true);
  const noteIndexRef = useRef(0);
  const stageIndexRef = useRef(0);

  const complete = stageIndex >= LESSON_1.stages.length;
  const stage = LESSON_1.stages[Math.min(stageIndex, LESSON_1.stages.length - 1)];
  const current = stage.notes[Math.min(noteIndex, stage.notes.length - 1)];
  const isDemo = !complete && stage.kind === "demo";

  useEffect(() => {
    if (stageIndex >= LESSON_1.stages.length) return;
    const next = LESSON_1.stages[stageIndex];
    hintRef.current = next.kind !== "melody";
    setHintVisible(next.kind !== "melody");
    setNoteIndex(0);
    noteIndexRef.current = 0;
    setFeedback("idle");
    setLastPlayed(null);
    lockedRef.current = false;
  }, [stageIndex]);

  useEffect(() => {
    if (stage.kind !== "melody" || hintVisible) return;
    const timer = window.setTimeout(() => {
      hintRef.current = true;
      setHintVisible(true);
    }, HINT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [stage.kind, hintVisible, noteIndex]);

  const handleIncoming = (midi: number, source: string) => {
    if (isDemo || lockedRef.current) return;
    const target = LESSON_1.stages[stageIndexRef.current].notes[noteIndexRef.current];
    if (!target) return;
    const kind = classifyAttempt(midi, target.midi, hintRef.current);
    setLastPlayed(midi);
    setLastSource(source);
    setFeedback(kind);
    playMidiNote(midi, 0.35);

    if (!shouldAdvance(kind)) return;

    lockedRef.current = true;
    window.setTimeout(() => {
      const stageNow = LESSON_1.stages[stageIndexRef.current];
      const nextNote = noteIndexRef.current + 1;
      if (nextNote < stageNow.notes.length) {
        noteIndexRef.current = nextNote;
        setNoteIndex(nextNote);
        const showHints = stageNow.kind !== "melody";
        hintRef.current = showHints;
        setHintVisible(showHints);
        setFeedback("idle");
        setLastPlayed(null);
        lockedRef.current = false;
        return;
      }
      const nextStage = stageIndexRef.current + 1;
      if (nextStage < LESSON_1.stages.length) {
        stageIndexRef.current = nextStage;
        setStageIndex(nextStage);
        lockedRef.current = false;
        return;
      }
      markLesson1Complete();
      stageIndexRef.current = nextStage;
      setStageIndex(nextStage);
    }, ADVANCE_MS);
  };

  const { mic, midi } = useNoteInput({
    enabled: !isDemo && !complete,
    calibrationCents: persist.calibrationCents,
    onNote: (note) => handleIncoming(note.midi, note.source),
  });

  const playDemo = async () => {
    await resumeAudio();
    setDemoPlaying(true);
    for (let i = 0; i < stage.notes.length; i += 1) {
      setNoteIndex(i);
      setLastPlayed(stage.notes[i].midi);
      setHintVisible(true);
      playMidiNote(stage.notes[i].midi, 0.6);
      await wait(720);
    }
    setDemoPlaying(false);
    setLastPlayed(null);
    setNoteIndex(0);
  };

  if (complete) {
    return (
      <main className="page lesson done" data-testid="lesson-complete">
        <h1>Nice walking, {kid?.name ?? "friend"}.</h1>
        <p>You read C through G and played Garden Walk. That melody is original to Home Keys.</p>
        <button type="button" className="btn primary xl" onClick={() => setScreen("home")}>
          Back to home
        </button>
      </main>
    );
  }

  return (
    <main className="page lesson" data-testid="lesson-screen">
      <header className="lesson-bar">
        <div>
          <p className="eyebrow">{stage.title}</p>
          <strong>{kid?.avatar} {kid?.name}</strong>
        </div>
        <div className="stage-pips" aria-label="Lesson stages">
          {LESSON_1.stages.map((item, index) => (
            <span key={item.id} className={index === stageIndex ? "on" : index < stageIndex ? "done" : ""} />
          ))}
        </div>
        <button
          type="button"
          className="btn ghost"
          data-testid="leave-lesson"
          onClick={() => {
            if (isParentUnlocked()) setScreen("home");
            else setLeaveOpen(true);
          }}
        >
          Leave
        </button>
      </header>

      <p className="stage-blurb">{stage.blurb}</p>

      <section className="lesson-stage">
        <Staff note={current} feedback={feedback} showFinger={persist.showFingerNumbers} />
        <div className="prompt">
          <p className="prompt-kicker">{isDemo ? "Listen" : "Play this note"}</p>
          <h2 data-testid="target-note">{current.name}</h2>
          <FeedbackBanner feedback={feedback} lastPlayed={lastPlayed} />
          {isDemo ? (
            <p className="status-line">Demo is playing through the speakers. Listening starts when you are ready.</p>
          ) : (
            <ListeningStatus mic={mic} midi={midi} />
          )}
          {lastSource ? <p className="status-line">Last input: {lastSource}</p> : null}
        </div>
      </section>

      <PianoKeyboard
        targetMidi={current.midi}
        hintVisible={isDemo || hintVisible}
        lastPlayed={lastPlayed}
        feedback={feedback}
        onPlay={(midi) => {
          if (isDemo) {
            playMidiNote(midi, 0.3);
            setLastPlayed(midi);
            return;
          }
          handleIncoming(midi, "screen");
        }}
      />

      <footer className="lesson-actions">
        {isDemo ? (
          <>
            <button type="button" className="btn ghost" disabled={demoPlaying} onClick={() => void playDemo()}>
              {demoPlaying ? "Playing…" : "Play demo"}
            </button>
            <button
              type="button"
              className="btn primary"
              data-testid="ready-practice"
              disabled={demoPlaying}
              onClick={() => {
                stageIndexRef.current = 1;
                setStageIndex(1);
              }}
            >
              I am ready
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn ghost"
              data-testid="show-hint"
              onClick={() => {
                hintRef.current = true;
                setHintVisible(true);
              }}
            >
              Show hint
            </button>
            <p className="muted">
              {noteIndex + 1} / {stage.notes.length}
              {persist.showFingerNumbers ? ` · finger ${current.finger}` : ""}
            </p>
          </>
        )}
      </footer>

      {leaveOpen ? (
        <PinPad
          title="Leave lesson?"
          subtitle="A grown-up PIN is needed to exit before you finish."
          submitLabel="Leave"
          onCancel={() => setLeaveOpen(false)}
          onSubmit={async (pin) => {
            const result = await checkPin(pin);
            if (result.ok) setScreen("home");
            return result;
          }}
        />
      ) : null}
    </main>
  );
}

function FeedbackBanner({
  feedback,
  lastPlayed,
}: {
  feedback: FeedbackKind;
  lastPlayed: number | null;
}) {
  if (feedback === "idle") return <p className="banner idle">Waiting for the matching key.</p>;
  const played = lastPlayed == null ? "" : midiToName(lastPlayed);
  if (feedback === "wrong") {
    return <p className="banner wrong" data-testid="feedback-wrong">Try again{played ? ` · heard ${played}` : ""}.</p>;
  }
  if (feedback === "correct-after-hint") {
    return <p className="banner hinted" data-testid="feedback-hinted">Yes — after a hint.</p>;
  }
  return <p className="banner correct" data-testid="feedback-correct">Yes — first try.</p>;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function stageShowsImmediateHints(stage: LessonStage): boolean {
  return stage.kind === "guided" || stage.kind === "demo";
}
