import { useEffect, useMemo, useRef, useState } from "react";
import { durationBeats, midiToName } from "../audio/notes";
import { beginHeldTone, endAllHeldTones, endAllHeldTonesExcept, endHeldTone, playMidiNote, resumeAudio } from "../audio/synth";
import { useNoteInput } from "../audio/useNoteInput";
import { Celebration } from "../components/Celebration";
import { ListeningStatus } from "../components/ListeningStatus";
import { PianoKeyboard } from "../components/PianoKeyboard";
import { PinPad } from "../components/PinPad";
import { Staff } from "../components/Staff";
import { UNIT_ORDER } from "../data/courses";
import { playableById } from "../data/playable";
import { songById } from "../data/songs";
import { classifyAttempt, shouldAdvance } from "../lib/practice";
import { hiddenReadingKicker, initialHintVisible, showReadingAnswer } from "../lib/reading";
import {
  noteNeedsHold,
  onRhythmAttack,
  onRhythmRelease,
  requiredHoldMs,
  rhythmShouldAdvance,
  type RhythmHold,
} from "../lib/rhythm";
import {
  carryTogetherBass,
  emptyTogether,
  togetherAttack,
  togetherRelease,
  type TogetherEvent,
  type TogetherPhase,
  type TogetherSession,
} from "../lib/together";
import { isSongUnlocked, isUnitUnlocked, type StageAward } from "../lib/progress";
import { useActiveKid, useApp } from "../store/AppState";
import type { FeedbackKind, LessonNote, LessonStage } from "../types";

const HINT_DELAY_MS = 5000;
const ADVANCE_MS = 900;

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
  const unit = useMemo(() => playableById(activeUnitId), [activeUnitId]);
  const fromLibrary = unit.courseId === "library";
  const homeScreen = fromLibrary ? "library" : "home";
  const [stageIndex, setStageIndex] = useState(0);
  const [noteIndex, setNoteIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackKind>("idle");
  const [lastPlayed, setLastPlayed] = useState<number | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [lastSource, setLastSource] = useState<string>("");
  const [holding, setHolding] = useState(false);
  const [holdReady, setHoldReady] = useState(false);
  const [shortHold, setShortHold] = useState(false);
  const [togetherPhase, setTogetherPhase] = useState<TogetherPhase | null>(null);
  const [restNonce, setRestNonce] = useState(0);
  const [award, setAward] = useState<StageAward | null>(null);
  const lockedRef = useRef(false);
  const hintRef = useRef(true);
  const noteIndexRef = useRef(0);
  const stageIndexRef = useRef(0);
  const wrongsRef = useRef(0);
  const scoredRef = useRef(0);
  const holdRef = useRef<RhythmHold | null>(null);
  const togetherRef = useRef<TogetherSession>(emptyTogether());
  const holdReadyTimer = useRef(0);
  const advanceTimer = useRef(0);

  const complete = stageIndex >= unit.stages.length;
  const stage = unit.stages[Math.min(stageIndex, unit.stages.length - 1)];
  const current = stage.notes[Math.min(noteIndex, stage.notes.length - 1)];
  const isDemo = !complete && stage.kind === "demo";
  const answerVisible = showReadingAnswer(Boolean(unit.reading), isDemo, hintVisible);
  const togetherPart = current.together;
  const bassNote: LessonNote | null = togetherPart
    ? {
        midi: togetherPart.midi,
        name: togetherPart.name,
        finger: togetherPart.finger,
        hand: togetherPart.hand,
        duration: togetherPart.duration,
      }
    : null;
  const shownTogetherPhase = isDemo ? null : togetherPhase ?? (togetherPart ? "need-bass" : null);
  const unlocked = fromLibrary
    ? isSongUnlocked(songById(unit.id)?.unlockAfterUnitId ?? "", unit.id, {
        stars: kid?.stageStars ?? {},
        pathUnlocked: persist.pathUnlocked,
        libraryUnlocked: persist.libraryUnlocked,
        parentUnlockedSongs: kid?.unlockedSongs ?? [],
      })
    : isUnitUnlocked(unit.id, UNIT_ORDER, kid?.stageStars ?? {}, persist.pathUnlocked);

  useEffect(() => {
    if (!unlocked) setScreen(fromLibrary ? "library" : "home");
  }, [unlocked, fromLibrary, setScreen]);

  useEffect(() => {
    if (stageIndex >= unit.stages.length) return;
    const next = unit.stages[stageIndex];
    const showHints = initialHintVisible(next.kind, Boolean(unit.reading));
    hintRef.current = showHints;
    setHintVisible(showHints);
    setNoteIndex(0);
    noteIndexRef.current = 0;
    setFeedback("idle");
    setLastPlayed(null);
    setHolding(false);
    setHoldReady(false);
    setShortHold(false);
    holdRef.current = null;
    togetherRef.current = emptyTogether();
    setTogetherPhase(null);
    window.clearTimeout(holdReadyTimer.current);
    window.clearTimeout(advanceTimer.current);
    endAllHeldTones();
    lockedRef.current = false;
    setRestNonce((value) => value + 1);
  }, [stageIndex, unit.id]);

  useEffect(() => {
    if (unit.reading) return;
    if (stage.kind !== "melody" || hintVisible) return;
    const timer = window.setTimeout(() => {
      hintRef.current = true;
      setHintVisible(true);
    }, HINT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [stage.kind, hintVisible, noteIndex, unit.reading]);

  const finishUnit = () => {
    const result = completeUnit(unit.id, wrongsRef.current, scoredRef.current);
    setAward(result);
    stageIndexRef.current = unit.stages.length;
    setStageIndex(unit.stages.length);
  };

  const goToNextNote = () => {
    const stageNow = unit.stages[stageIndexRef.current];
    const nextNote = noteIndexRef.current + 1;
    window.clearTimeout(holdReadyTimer.current);
    window.clearTimeout(advanceTimer.current);
    holdRef.current = null;
    setHolding(false);
    setHoldReady(false);
    setShortHold(false);
    const upcoming = nextNote < stageNow.notes.length ? stageNow.notes[nextNote] : undefined;
    const carried = carryTogetherBass(togetherRef.current, upcoming?.together?.midi ?? null);
    togetherRef.current = carried;
    setTogetherPhase(carried.bassDownSince != null ? "bass-ready" : upcoming?.together ? "need-bass" : null);
    if (carried.bassMidi != null) endAllHeldTonesExcept(carried.bassMidi);
    else endAllHeldTones();
    if (nextNote < stageNow.notes.length) {
      noteIndexRef.current = nextNote;
      setNoteIndex(nextNote);
      const showHints = initialHintVisible(stageNow.kind, Boolean(unit.reading));
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
    }, requiredHoldMs(target.duration));
    return () => window.clearTimeout(timer);
    // restNonce restarts the quiet wait after a sound during a rest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, complete, unit.id, stageIndex, noteIndex, restNonce]);

  const finishTogetherBeat = (event: Extract<TogetherEvent, { type: "completed" }>) => {
    lockedRef.current = true;
    scoredRef.current += 1;
    setShortHold(false);
    setHolding(false);
    setHoldReady(false);
    setFeedback(event.kind);
    window.clearTimeout(holdReadyTimer.current);
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      goToNextNote();
    }, ADVANCE_MS);
  };

  const handleNoteOn = (midi: number, source: string) => {
    if (isDemo || lockedRef.current) return;
    const target = unit.stages[stageIndexRef.current]?.notes[noteIndexRef.current];
    if (!target) return;
    setLastPlayed(midi);
    setLastSource(source);

    if (target.together && target.midi != null) {
      const needsHold = noteNeedsHold(unit.rhythm, target);
      const decision = togetherAttack(
        togetherRef.current,
        midi,
        target.midi,
        target.together.midi,
        hintRef.current,
        performance.now(),
        needsHold,
      );
      togetherRef.current = decision.session;
      if (decision.event.type === "ignore") return;
      if (decision.event.type === "wrong") {
        playMidiNote(midi, 0.35);
        wrongsRef.current += 1;
        setShortHold(false);
        setFeedback("wrong");
        return;
      }
      if (source === "screen") beginHeldTone(midi);
      else playMidiNote(midi, 0.35);
      if (decision.event.type === "need-bass") {
        setTogetherPhase("need-bass");
        setHolding(false);
        setHoldReady(false);
        setFeedback("idle");
        return;
      }
      if (decision.event.type === "bass-ready") {
        setTogetherPhase("bass-ready");
        setHolding(false);
        setHoldReady(false);
        setShortHold(false);
        setFeedback("idle");
        return;
      }
      if (decision.event.type === "holding") {
        setTogetherPhase("holding");
        setHolding(true);
        setHoldReady(false);
        setShortHold(false);
        setFeedback("idle");
        const started = decision.session.melodyDownSince;
        window.clearTimeout(holdReadyTimer.current);
        holdReadyTimer.current = window.setTimeout(() => {
          if (togetherRef.current.melodyDownSince !== started) return;
          setHoldReady(true);
          setTogetherPhase("ready");
        }, requiredHoldMs(target.duration));
        return;
      }
      if (decision.event.type === "completed") finishTogetherBeat(decision.event);
      return;
    }

    if (isRest(target)) {
      playMidiNote(midi, 0.35);
      wrongsRef.current += 1;
      setFeedback("wrong");
      setShortHold(false);
      setRestNonce((value) => value + 1);
      return;
    }

    if (!noteNeedsHold(unit.rhythm, target)) {
      playMidiNote(midi, 0.35);
      const kind = classifyAttempt(midi, target.midi, hintRef.current);
      setFeedback(kind);
      setShortHold(false);
      if (!shouldAdvance(kind)) {
        wrongsRef.current += 1;
        return;
      }
      lockedRef.current = true;
      scoredRef.current += 1;
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => {
        goToNextNote();
      }, ADVANCE_MS);
      return;
    }

    const decision = onRhythmAttack(holdRef.current, midi, target.midi, hintRef.current, performance.now());
    if (decision.outcome.type === "ignore") return;
    if (decision.outcome.type === "wrong-pitch") {
      window.clearTimeout(holdReadyTimer.current);
      holdRef.current = null;
      setHolding(false);
      setHoldReady(false);
      setShortHold(false);
      endAllHeldTones();
      playMidiNote(midi, 0.35);
      wrongsRef.current += 1;
      setFeedback("wrong");
      return;
    }
    if (decision.outcome.type !== "holding" || !decision.hold) return;

    const activeHold = decision.hold;
    holdRef.current = activeHold;
    setHolding(true);
    setHoldReady(false);
    setShortHold(false);
    setFeedback("idle");
    if (source === "screen") beginHeldTone(midi);
    else playMidiNote(midi, 0.35);
    const required = requiredHoldMs(target.duration);
    window.clearTimeout(holdReadyTimer.current);
    holdReadyTimer.current = window.setTimeout(() => {
      if (holdRef.current !== activeHold) return;
      setHoldReady(true);
    }, required);
  };

  const handleNoteOff = (midi: number, source: string, at = performance.now()) => {
    if (source === "screen") endHeldTone(midi);
    const target = unit.stages[stageIndexRef.current]?.notes[noteIndexRef.current];
    if (target?.together && target.midi != null) {
      if (isDemo) return;
      if (lockedRef.current) {
        if (midi === target.together.midi && togetherRef.current.bassMidi === midi) {
          togetherRef.current = { ...togetherRef.current, bassMidi: null, bassDownSince: null };
        }
        return;
      }
      if (!noteNeedsHold(unit.rhythm, target)) {
        if (midi === target.together.midi && togetherRef.current.bassMidi === midi) {
          togetherRef.current = { ...togetherRef.current, bassMidi: null, bassDownSince: null };
          setTogetherPhase("need-bass");
        }
        return;
      }
      const decision = togetherRelease(
        togetherRef.current,
        midi,
        target.midi,
        target.together.midi,
        target.duration,
        at,
      );
      togetherRef.current = decision.session;
      if (decision.event.type === "ignore") return;
      window.clearTimeout(holdReadyTimer.current);
      setHolding(false);
      setHoldReady(false);
      if (decision.event.type === "need-bass") {
        setTogetherPhase("need-bass");
        return;
      }
      if (decision.event.type === "early-release") {
        setTogetherPhase(decision.session.bassDownSince != null ? "bass-ready" : "need-bass");
        wrongsRef.current += 1;
        setShortHold(true);
        setFeedback("wrong");
        return;
      }
      if (decision.event.type === "completed") finishTogetherBeat(decision.event);
      return;
    }
    if (isDemo || lockedRef.current) return;
    if (!target || !noteNeedsHold(unit.rhythm, target)) return;

    const decision = onRhythmRelease(holdRef.current, midi, requiredHoldMs(target.duration), at);
    if (!rhythmShouldAdvance(decision.outcome) && decision.outcome.type !== "early-release") return;

    window.clearTimeout(holdReadyTimer.current);
    holdRef.current = null;
    setHolding(false);
    setHoldReady(false);

    if (decision.outcome.type === "early-release") {
      wrongsRef.current += 1;
      setShortHold(true);
      setFeedback("wrong");
      return;
    }

    if (decision.outcome.type === "completed") {
      lockedRef.current = true;
      scoredRef.current += 1;
      setShortHold(false);
      setFeedback(decision.outcome.kind);
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => {
        goToNextNote();
      }, ADVANCE_MS);
    }
  };

  const { mic, midi, retryMic } = useNoteInput({
    enabled: !isDemo && !complete,
    calibrationCents: persist.calibrationCents,
    onNote: (note) => handleNoteOn(note.midi, note.source),
    onRelease: (note) => handleNoteOff(note.midi, note.source, note.at),
  });

  useEffect(() => {
    return () => {
      window.clearTimeout(holdReadyTimer.current);
      window.clearTimeout(advanceTimer.current);
      endAllHeldTones();
    };
  }, []);

  const playDemo = async () => {
    await resumeAudio();
    setDemoPlaying(true);
    let bassSounding: number | null = null;
    for (let i = 0; i < stage.notes.length; i += 1) {
      const item = stage.notes[i];
      setNoteIndex(i);
      setLastPlayed(item.midi);
      setHintVisible(true);
      if (item.together && bassSounding !== item.together.midi) {
        if (bassSounding != null) endHeldTone(bassSounding);
        beginHeldTone(item.together.midi);
        bassSounding = item.together.midi;
      }
      if (item.midi != null && item.duration !== "rest") playMidiNote(item.midi, 0.6);
      await wait(durationBeats(item.duration) * 720);
    }
    endAllHeldTones();
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
          onDone={() => setScreen(homeScreen)}
          doneLabel={fromLibrary ? "Back to songs" : "Back to the path"}
        />
      );
    }
    return (
      <main className="page lesson done" data-testid="lesson-complete">
        <h1>Nice playing, {kid?.name ?? "friend"}.</h1>
        <button type="button" className="btn primary xl" onClick={() => setScreen(homeScreen)}>
          {fromLibrary ? "Back to songs" : "Back to the path"}
        </button>
      </main>
    );
  }

  return (
    <main className="page lesson" data-testid="lesson-screen" data-unit-id={unit.id}>
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
            if (isParentUnlocked()) setScreen(homeScreen);
            else setLeaveOpen(true);
          }}
        >
          Leave
        </button>
      </header>

      <p className="stage-blurb">{stage.blurb}</p>
      {fromLibrary && songById(unit.id) ? (
        <p className="muted song-license-line" data-testid="song-license-line">
          {songById(unit.id)?.licenseNote}
        </p>
      ) : null}

      <section className="lesson-stage">
        {bassNote ? (
          <div className="grand-staff" data-testid="grand-staff">
            <div>
              <p className="hand-label" data-testid="hand-right">Right hand</p>
              <Staff
                note={current}
                feedback={feedback}
                showFinger={persist.showFingerNumbers && answerVisible}
                showName={answerVisible}
              />
            </div>
            <div>
              <p className="hand-label" data-testid="hand-left">Left hand holds</p>
              <Staff
                note={bassNote}
                feedback={feedback}
                showFinger={persist.showFingerNumbers && answerVisible}
                showName={answerVisible}
              />
            </div>
          </div>
        ) : (
          <Staff
            note={current}
            feedback={feedback}
            showFinger={persist.showFingerNumbers && answerVisible}
            showName={answerVisible}
          />
        )}
        <div className="prompt">
          <p className="prompt-kicker" data-testid="prompt-kicker">
            {promptKicker(isDemo, isRest(current), holding, holdReady, answerVisible, current.hand, shownTogetherPhase)}
          </p>
          <h2
            className={togetherPart ? "together-title" : undefined}
            data-testid="target-note"
            data-answer-visible={answerVisible ? "true" : "false"}
            data-together={togetherPart ? "true" : "false"}
          >
            {answerVisible ? promptName(current) : "Read the staff"}
          </h2>
          <FeedbackBanner
            feedback={feedback}
            lastPlayed={lastPlayed}
            rest={isRest(current)}
            holding={holding}
            holdReady={holdReady}
            shortHold={shortHold}
            answerVisible={answerVisible}
            togetherPhase={shownTogetherPhase}
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
        alsoMidi={togetherPart?.midi ?? null}
        hintLabel={togetherPart ? "RH" : "this key"}
        alsoHintLabel="LH"
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
          handleNoteOn(midiNote, "screen");
        }}
        onRelease={(midiNote) => {
          if (isDemo) return;
          handleNoteOff(midiNote, "screen");
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
              {persist.showFingerNumbers && answerVisible && !isRest(current)
                ? togetherPart
                  ? ` · LH finger ${togetherPart.finger} holds · RH finger ${current.finger}`
                  : ` · ${current.hand === "left" ? "LH" : "RH"} finger ${current.finger}`
                : ""}
              {unit.rhythm && current.duration ? ` · ${current.duration}` : ""}
            </p>
          </>
        )}
      </footer>

      {leaveOpen ? (
        <PinPad
          title={fromLibrary ? "Leave song?" : "Leave lesson?"}
          subtitle="A grown-up PIN is needed to exit before you finish."
          submitLabel="Leave"
          onCancel={() => setLeaveOpen(false)}
          onSubmit={async (pin) => {
            const result = await checkPin(pin);
            if (result.ok) setScreen(homeScreen);
            return result;
          }}
        />
      ) : null}
    </main>
  );
}

function promptKicker(
  demo: boolean,
  rest: boolean,
  holding: boolean,
  holdReady: boolean,
  answerVisible: boolean,
  hand: LessonNote["hand"],
  togetherPhase: TogetherPhase | null,
): string {
  if (demo) return "Listen";
  if (togetherPhase === "ready") return "Let the right hand go";
  if (togetherPhase === "holding" || (holding && togetherPhase)) return "Both hands";
  if (togetherPhase === "bass-ready") return "Left hand is holding";
  if (togetherPhase === "need-bass") return "Left hand holds";
  if (holdReady) return "Let go";
  if (holding) return "Hold the beat";
  if (rest) return "Stay quiet";
  if (!answerVisible) return hiddenReadingKicker(hand);
  return "Play this note";
}

function promptName(note: LessonNote): string {
  if (note.midi == null || note.duration === "rest") return "Rest";
  if (note.together) return `LH ${note.together.name} holds · RH ${note.name}`;
  return note.hand === "left" ? `LH ${note.name}` : note.name;
}

function FeedbackBanner({
  feedback,
  lastPlayed,
  rest,
  holding,
  holdReady,
  shortHold,
  answerVisible,
  togetherPhase,
}: {
  feedback: FeedbackKind;
  lastPlayed: number | null;
  rest: boolean;
  holding: boolean;
  holdReady: boolean;
  shortHold: boolean;
  answerVisible: boolean;
  togetherPhase: TogetherPhase | null;
}) {
  const played = lastPlayed == null ? "" : midiToName(lastPlayed);
  if (feedback === "wrong" && rest) {
    return <p className="banner wrong" data-testid="feedback-wrong">That was a rest. Stay quiet{played ? ` · heard ${played}` : ""}.</p>;
  }
  if (feedback === "wrong" && shortHold) {
    return <p className="banner wrong" data-testid="feedback-wrong">Try again · hold a little longer.</p>;
  }
  if (feedback === "wrong") {
    return <p className="banner wrong" data-testid="feedback-wrong">Try again{played ? ` · heard ${played}` : ""}.</p>;
  }
  if (feedback === "correct-after-hint") {
    return <p className="banner hinted" data-testid="feedback-hinted">Yes — after a hint.</p>;
  }
  if (feedback === "correct") {
    return <p className="banner correct" data-testid="feedback-correct">Yes — first try.</p>;
  }
  if (togetherPhase === "ready") {
    return (
      <p className="banner hinted" data-testid="feedback-hold-ready">
        Good hold. Let the right hand go. Keep the left hand down.
      </p>
    );
  }
  if (togetherPhase === "holding") {
    return <p className="banner hinted" data-testid="feedback-holding">Both keys are down. Keep them through the beat.</p>;
  }
  if (holding && holdReady) {
    return <p className="banner hinted" data-testid="feedback-hold-ready">Good hold. Let go.</p>;
  }
  if (holding) return <p className="banner hinted" data-testid="feedback-holding">Keep holding through the beat.</p>;
  if (feedback === "idle" && togetherPhase === "bass-ready") {
    return <p className="banner idle">Left hand is holding. Play the right-hand note.</p>;
  }
  if (feedback === "idle" && togetherPhase === "need-bass") {
    return <p className="banner idle">Hold the left-hand key, then play the right-hand note.</p>;
  }
  if (feedback === "idle" && rest) return <p className="banner idle">This count is a rest. Stay quiet.</p>;
  if (feedback === "idle" && !answerVisible) {
    return <p className="banner idle">Look at the staff, then play that key.</p>;
  }
  if (feedback === "idle") return <p className="banner idle">Waiting for the matching key.</p>;
  return <p className="banner correct" data-testid="feedback-correct">Yes — first try.</p>;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function stageShowsImmediateHints(stage: LessonStage): boolean {
  return stage.kind === "guided" || stage.kind === "demo";
}
