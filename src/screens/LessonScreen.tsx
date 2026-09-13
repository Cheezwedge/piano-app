import { useEffect, useRef, useState } from "react";
import { durationBeats, midiToName } from "../audio/notes";
import { playMidiNote, resumeAudio } from "../audio/synth";
import { useNoteInput } from "../audio/useNoteInput";
import { Celebration } from "../components/Celebration";
import { ListeningStatus } from "../components/ListeningStatus";
import { PianoKeyboard } from "../components/PianoKeyboard";
import { PinPad } from "../components/PinPad";
import { Staff } from "../components/Staff";
import { UNIT_ORDER, unitById } from "../data/courses";
import { classifyAttempt, shouldAdvance } from "../lib/practice";
import { isUnitUnlocked, type StageAward } from "../lib/progress";
import { useActiveKid, useApp } from "../store/AppState";
import type { FeedbackKind, LessonNote, LessonStage } from "../types";

const HINT_DELAY_MS = 5000;
const ADVANCE_MS = 900;
const BEAT_MS = 700;

function isRest(note: LessonNote | undefined): boolean {
  return !note || note.midi == null || note.duration === "rest";
}

export function LessonScreen() {
  const {
    persist,
    setScreen,
    checkPin,
    isParentUnlocked,
    activeUnitId,
    completeUnit,
  } = useApp();
  const kid = useActiveKid();
  const unit = unitById(activeUnitId);
  const [stageIndex, setStageIndex] = useState(0);
  const [noteIndex, setNoteIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackKind>("idle");
  const [lastPlayed, setLastPlayed] = useState<number | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [lastSource, setLastSource] = useState<string>("");
  const [holding, setHolding] = useState(false);
  const [restNonce, setRestNonce] = useState(0);
  const [award, setAward] = useState<StageAward | null>(null);
  const lockedRef = useRef(false);
  const hintRef = useRef(true);
  const noteIndexRef = useRef(0);
  const stageIndexRef = useRef(0);
  const wrongsRef = useRef(0);
  const scoredRef = useRef(0);

  const complete = stageIndex >= unit.stages.length;
  const stage = unit.stages[Math.min(stageIndex, unit.stages.length - 1)];
  const current = stage.notes[Math.min(noteIndex, stage.notes.length - 1)];
  const isDemo = !complete && stage.kind === "demo";
  const unlocked = isUnitUnlocked(
    unit.id,
    UNIT_ORDER,
    kid?.stageStars ?? {},
    persist.pathUnlocked,
  );

  useEffect(() => {
    if (!unlocked) setScreen("home");
  }, [unlocked, setScreen]);

  useEffect(() => {
    if (stageIndex >= unit.stages.length) return;
    const next = unit.stages[stageIndex];
    hintRef.current = next.kind !== "melody";
    setHintVisible(next.kind !== "melody");
    setNoteIndex(0);
    noteIndexRef.current = 0;
    setFeedback("idle");
    setLastPlayed(null);
    setHolding(false);
    lockedRef.current = false;
    setRestNonce((value) => value + 1);
  }, [stageIndex, unit]);

  useEffect(() => {
    if (stage.kind !== "melody" || hintVisible) return;
    const timer = window.setTimeout(() => {
      hintRef.current = true;
      setHintVisible(true);
    }, HINT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [stage.kind, hintVisible, noteIndex]);

  const finishUnit = () => {
    const result = completeUnit(unit.id, wrongsRef.current, scoredRef.current);
    setAward(result);
    stageIndexRef.current = unit.stages.length;
    setStageIndex(unit.stages.length);
  };

  const goToNextNote = () => {
    const stageNow = unit.stages[stageIndexRef.current];
    const nextNote = noteIndexRef.current + 1;
    setHolding(false);
    if (nextNote < stageNow.notes.length) {
      noteIndexRef.current = nextNote;
      setNoteIndex(nextNote);
      const showHints = stageNow.kind !== "melody";
      hintRef.current = showHints;
      setHintVisible(showHints);
      setFeedback("idle");
      setLastPlayed(null);
      lockedRef.current = false;
      setRestNonce((value) => value + 1);
      return;
    }
    const nextStage = stageIndexRef.current + 1;
    if (nextStage < unit.stages.length) {
      stageIndexRef.current = nextStage;
      setStageIndex(nextStage);
      lockedRef.current = false;
      return;
    }
    finishUnit();
  };

  useEffect(() => {
    if (isDemo || complete) return;
    const target = unit.stages[stageIndex]?.notes[noteIndex];
    if (!isRest(target)) return;
    const timer = window.setTimeout(() => {
      goToNextNote();
    }, durationBeats(target.duration) * BEAT_MS);
    return () => window.clearTimeout(timer);
    // restNonce restarts the quiet wait after a sound during a rest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, complete, unit, stageIndex, noteIndex, restNonce]);

  const handleIncoming = (midi: number, source: string) => {
    if (isDemo || lockedRef.current) return;
    const target = unit.stages[stageIndexRef.current].notes[noteIndexRef.current];
    if (!target) return;
    setLastPlayed(midi);
    setLastSource(source);
    playMidiNote(midi, 0.35);

    if (isRest(target)) {
      wrongsRef.current += 1;
      setFeedback("wrong");
      setRestNonce((value) => value + 1);
      return;
    }

    const kind = classifyAttempt(midi, target.midi, hintRef.current);
    setFeedback(kind);
    if (!shouldAdvance(kind)) {
      wrongsRef.current += 1;
      return;
    }

    lockedRef.current = true;
    scoredRef.current += 1;
    const holdMs = unit.rhythm ? durationBeats(target.duration) * BEAT_MS : ADVANCE_MS;
    if (unit.rhythm && durationBeats(target.duration) > 1) setHolding(true);
    window.setTimeout(() => {
      goToNextNote();
    }, holdMs);
  };

  const { mic, midi, retryMic } = useNoteInput({
    enabled: !isDemo && !complete,
    calibrationCents: persist.calibrationCents,
    onNote: (note) => handleIncoming(note.midi, note.source),
  });

  const playDemo = async () => {
    await resumeAudio();
    setDemoPlaying(true);
    for (let i = 0; i < stage.notes.length; i += 1) {
      const item = stage.notes[i];
      setNoteIndex(i);
      setLastPlayed(item.midi);
      setHintVisible(true);
      if (item.midi != null && item.duration !== "rest") playMidiNote(item.midi, 0.6);
      await wait(durationBeats(item.duration) * 720);
    }
    setDemoPlaying(false);
    setLastPlayed(null);
    setNoteIndex(0);
  };

  if (!unlocked) return null;

  if (complete) {
    if (award) {
      return (
        <Celebration
          award={award}
          unitTitle={unit.title}
          kidName={kid?.name ?? "friend"}
          onDone={() => setScreen("home")}
        />
      );
    }
    return (
      <main className="page lesson done" data-testid="lesson-complete">
        <h1>Nice playing, {kid?.name ?? "friend"}.</h1>
        <button type="button" className="btn primary xl" onClick={() => setScreen("home")}>
          Back to the path
        </button>
      </main>
    );
  }

  return (
    <main className="page lesson" data-testid="lesson-screen">
      <header className="lesson-bar">
        <div>
          <p className="eyebrow">{unit.title} · {stage.title}</p>
          <strong>{kid?.avatar} {kid?.name}</strong>
        </div>
        <div className="stage-pips" aria-label="Lesson stages">
          {unit.stages.map((item, index) => (
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
          <p className="prompt-kicker">{promptKicker(isDemo, isRest(current), holding)}</p>
          <h2 data-testid="target-note">{promptName(current)}</h2>
          <FeedbackBanner
            feedback={feedback}
            lastPlayed={lastPlayed}
            rest={isRest(current)}
            holding={holding}
          />
          {isDemo ? (
            <p className="status-line">Demo is playing through the speakers. Listening starts when you are ready.</p>
          ) : (
            <ListeningStatus mic={mic} midi={midi} onRetryMic={retryMic} />
          )}
          {lastSource ? <p className="status-line">Last input: {lastSource}</p> : null}
        </div>
      </section>

      <PianoKeyboard
        targetMidi={current.midi}
        hintVisible={isDemo || hintVisible}
        lastPlayed={lastPlayed}
        feedback={feedback}
        range={unit.keyboard}
        onPlay={(midiNote) => {
          if (isDemo) {
            playMidiNote(midiNote, 0.3);
            setLastPlayed(midiNote);
            return;
          }
          handleIncoming(midiNote, "screen");
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
              {persist.showFingerNumbers && !isRest(current)
                ? ` · ${current.hand === "left" ? "LH" : "RH"} finger ${current.finger}`
                : ""}
              {unit.rhythm && current.duration ? ` · ${current.duration}` : ""}
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

function promptKicker(demo: boolean, rest: boolean, holding: boolean): string {
  if (demo) return "Listen";
  if (holding) return "Hold the beat";
  if (rest) return "Stay quiet";
  return "Play this note";
}

function promptName(note: LessonNote): string {
  if (note.midi == null || note.duration === "rest") return "Rest";
  return note.hand === "left" ? `LH ${note.name}` : note.name;
}

function FeedbackBanner({
  feedback,
  lastPlayed,
  rest,
  holding,
}: {
  feedback: FeedbackKind;
  lastPlayed: number | null;
  rest: boolean;
  holding: boolean;
}) {
  if (holding) return <p className="banner hinted">Keep holding through the beat.</p>;
  if (feedback === "idle" && rest) return <p className="banner idle">This count is a rest. Stay quiet.</p>;
  if (feedback === "idle") return <p className="banner idle">Waiting for the matching key.</p>;
  const played = lastPlayed == null ? "" : midiToName(lastPlayed);
  if (feedback === "wrong" && rest) {
    return <p className="banner wrong" data-testid="feedback-wrong">That was a rest. Stay quiet{played ? ` · heard ${played}` : ""}.</p>;
  }
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
