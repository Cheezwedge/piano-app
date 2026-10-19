import { PITCH_ATTACK_FRAMES } from "../audio/pitchGate";
import { durationBeats } from "../audio/notes";
import { dynamicFromVelocity, judgeDynamic } from "./dynamics";
import { onRhythmRelease, requiredHoldMs } from "./rhythm";
import type { InputSource, LessonNote, NoteDuration, TempoPercent } from "../types";

/**
 * Timed play keeps Home Keys on the staff.
 * Notes travel sideways toward a fixed line. Nothing falls from the top.
 */

export const TEMPO_CHOICES = [50, 75, 100] as const;

/** Quarter note at full tempo. Same count Steady Beats already uses. */
export const TIMED_BEAT_MS = 700;

/** Empty beats before the first note, so the child sees it coming. */
export const LEAD_BEATS = 2;

/**
 * The mic confirms a pitch only after several polls.
 * Shift that stamp earlier so a note played on the line is not called late.
 */
export const MIC_POLL_MS = 40;
export const MIC_LATENCY_MS = PITCH_ATTACK_FRAMES * MIC_POLL_MS;

export type Arrival = "early" | "on-time" | "late";

export type NoteMark = Arrival | "short" | "miss" | "rest-ok" | "rest-sound";

export interface TimingWindows {
  /** Half-width of the on-time band, centered on the note. */
  onTimeMs: number;
  /** Extra time before that band that still counts as early. */
  earlyMs: number;
  /** Extra time after that band that still counts as late. */
  lateMs: number;
}

export function isTempoPercent(value: unknown): value is TempoPercent {
  return value === 50 || value === 75 || value === 100;
}

export function beatMsForTempo(percent: TempoPercent): number {
  return Math.round(TIMED_BEAT_MS * (100 / percent));
}

/** Mic events are late by the pitch gate. MIDI and the on-screen keys are not. */
export function compensatedAt(at: number, source: InputSource): number {
  return source === "mic" ? at - MIC_LATENCY_MS : at;
}

export function windowsForBeat(beatMs: number): TimingWindows {
  return {
    onTimeMs: Math.round(beatMs * 0.22),
    earlyMs: Math.round(beatMs * 0.55),
    lateMs: Math.round(beatMs * 0.45),
  };
}

/**
 * deltaMs is played-minus-expected. Negative means the key was early.
 * Outside the early and late bands the note does not count.
 */
export function judgeArrival(deltaMs: number, windows: TimingWindows): Arrival | "miss" {
  if (Math.abs(deltaMs) <= windows.onTimeMs) return "on-time";
  if (deltaMs < 0 && deltaMs >= -(windows.onTimeMs + windows.earlyMs)) return "early";
  if (deltaMs > 0 && deltaMs <= windows.onTimeMs + windows.lateMs) return "late";
  return "miss";
}

export function holdFill(startedAt: number, now: number, requiredMs: number): number {
  if (requiredMs <= 0) return 1;
  return Math.min(1, Math.max(0, (now - startedAt) / requiredMs));
}

/** True once the key has stayed down for the whole written value. */
export function holdReached(startedAt: number, now: number, requiredMs: number): boolean {
  return now - startedAt >= requiredMs;
}

export interface ScheduledNote {
  index: number;
  midi: number | null;
  name: string;
  finger: number;
  hand?: LessonNote["hand"];
  beats: number;
  startBeat: number;
  rest: boolean;
  togetherMidi: number | null;
  togetherFinger: number | null;
  togetherName: string | null;
  duration?: NoteDuration;
  dynamic?: LessonNote["dynamic"];
}

export function scheduleNotes(notes: LessonNote[]): ScheduledNote[] {
  let startBeat = 0;
  return notes.map((note, index) => {
    const rest = note.midi == null || note.duration === "rest";
    const beats = durationBeats(note.duration);
    const scheduled: ScheduledNote = {
      index,
      midi: rest ? null : note.midi,
      name: note.name,
      finger: note.finger,
      hand: note.hand,
      beats,
      startBeat,
      rest,
      togetherMidi: note.together?.midi ?? null,
      togetherFinger: note.together?.finger ?? null,
      togetherName: note.together?.name ?? null,
      duration: note.duration,
      dynamic: note.dynamic,
    };
    startBeat += beats;
    return scheduled;
  });
}

export function scrollingClef(notes: ScheduledNote[]): "treble" | "bass" | "grand" {
  let treble = false;
  let bass = false;
  for (const note of notes) {
    if (note.midi != null && note.midi < 60) bass = true;
    if (note.midi != null && note.midi >= 60) treble = true;
    if (note.togetherMidi != null) bass = true;
  }
  if (treble && bass) return "grand";
  if (bass) return "bass";
  return "treble";
}

export type TimedCue =
  | { kind: "ready" }
  | { kind: "holding" }
  | { kind: "on-time" }
  | { kind: "early" }
  | { kind: "late" }
  | { kind: "short" }
  | { kind: "miss" }
  | { kind: "quiet" }
  | { kind: "listen" }
  | { kind: "low-key" }
  | { kind: "dynamic"; word: "soft" | "loud" };

/** Gentle words. A mistimed note keeps moving. It is not a hard stop. */
export function timedCueCopy(cue: TimedCue): string {
  switch (cue.kind) {
    case "ready":
      return "Watch the notes come to the line.";
    case "holding":
      return "Keep the key down through the bar.";
    case "on-time":
      return "With the beat.";
    case "early":
      return "A little early.";
    case "late":
      return "A little late.";
    case "short":
      return "Hold through the whole bar.";
    case "miss":
      return "Here comes the next one.";
    case "quiet":
      return "This beat stays quiet.";
    case "listen":
      return "Match the note on the staff.";
    case "low-key":
      return "Hold the low key, then play the other.";
    case "dynamic":
      return cue.word === "soft" ? "Make this one soft." : "Make this one loud.";
    default: {
      const never: never = cue;
      return never;
    }
  }
}

export interface ActiveHold {
  noteIndex: number;
  midi: number;
  /** Attack time after mic compensation. Length is measured from here. */
  startedAt: number;
  arrival: Arrival;
}

export interface TimedSession {
  origin: number;
  beatMs: number;
  leadBeats: number;
  notes: ScheduledNote[];
  marks: Array<NoteMark | null>;
  restNoise: boolean[];
  hold: ActiveHold | null;
  bassDown: number | null;
  cue: TimedCue;
  pulseBeat: number;
  finished: boolean;
}

export function createTimedSession(
  notes: LessonNote[],
  origin: number,
  tempoPercent: TempoPercent,
): TimedSession {
  const scheduled = scheduleNotes(notes);
  return {
    origin,
    beatMs: beatMsForTempo(tempoPercent),
    leadBeats: LEAD_BEATS,
    notes: scheduled,
    marks: scheduled.map(() => null),
    restNoise: scheduled.map(() => false),
    hold: null,
    bassDown: null,
    cue: { kind: "ready" },
    pulseBeat: -1,
    finished: scheduled.length === 0,
  };
}

export function noteExpectedAt(session: Pick<TimedSession, "origin" | "beatMs" | "leadBeats">, startBeat: number): number {
  return session.origin + (session.leadBeats + startBeat) * session.beatMs;
}

export function scheduledLabel(note: ScheduledNote): string {
  if (note.rest || note.midi == null) return "Rest";
  if (note.togetherName) return `LH ${note.togetherName} holds · RH ${note.name}`;
  return note.hand === "left" ? `LH ${note.name}` : note.name;
}

export function upcomingTarget(session: TimedSession): ScheduledNote | null {
  for (const note of session.notes) {
    if (session.marks[note.index] != null) continue;
    if (note.rest || note.midi == null) continue;
    return note;
  }
  return null;
}

/**
 * On time, and a quiet rest, are clean.
 * Early, late, a short hold, a miss, or a sound on a rest lowers the stars.
 */
export function scoreTimedMarks(marks: Array<NoteMark | null>): { wrongs: number; scored: number } {
  let wrongs = 0;
  let scored = 0;
  for (const mark of marks) {
    if (mark == null) continue;
    scored += 1;
    if (mark !== "on-time" && mark !== "rest-ok") wrongs += 1;
  }
  return { wrongs, scored };
}

export type TimedSound = "none" | "tap" | "hold";

export interface TimedReduceResult {
  session: TimedSession;
  justFinished: boolean;
  pulse: boolean;
  sound: TimedSound;
}

export type TimedAction =
  | { type: "tick"; now: number }
  | { type: "attack"; midi: number; at: number; source: InputSource; velocity?: number }
  | { type: "release"; midi: number; at: number; source: InputSource };

interface WindowBounds {
  expected: number;
  openAt: number;
  deadline: number;
  windows: TimingWindows;
}

function boundsFor(session: TimedSession, note: ScheduledNote): WindowBounds {
  const expected = noteExpectedAt(session, note.startBeat);
  const windows = windowsForBeat(session.beatMs);
  return {
    expected,
    windows,
    openAt: expected - windows.onTimeMs - windows.earlyMs,
    deadline: expected + windows.onTimeMs + windows.lateMs,
  };
}

function withMark(session: TimedSession, index: number, mark: NoteMark, cue: TimedCue): TimedSession {
  const marks = session.marks.slice();
  marks[index] = mark;
  return { ...session, marks, cue, hold: session.hold?.noteIndex === index ? null : session.hold };
}

function firstSounding(session: TimedSession): ScheduledNote | null {
  for (const note of session.notes) {
    if (session.marks[note.index] != null) continue;
    if (note.rest || note.midi == null) continue;
    return note;
  }
  return null;
}

function finishIfReady(session: TimedSession, now: number): TimedSession {
  if (session.finished || session.hold) return session;
  if (session.marks.some((mark) => mark == null)) return session;
  const last = session.notes[session.notes.length - 1];
  if (!last) return { ...session, finished: true };
  const end = noteExpectedAt(session, last.startBeat) + last.beats * session.beatMs;
  if (now < end) return session;
  return { ...session, finished: true };
}

function settleRests(session: TimedSession, now: number): TimedSession {
  let next = session;
  for (const note of session.notes) {
    if (!note.rest || next.marks[note.index] != null) continue;
    const end = noteExpectedAt(next, note.startBeat) + note.beats * next.beatMs;
    if (now < end) continue;
    const mark: NoteMark = next.restNoise[note.index] ? "rest-sound" : "rest-ok";
    const cue = mark === "rest-sound" ? ({ kind: "quiet" } as const) : next.cue;
    next = withMark(next, note.index, mark, cue);
  }
  return next;
}

function resolvePasses(session: TimedSession, now: number): TimedSession {
  let next = session;
  if (next.hold && holdReached(next.hold.startedAt, now, requiredHoldMs(next.notes[next.hold.noteIndex]?.duration, next.beatMs))) {
    const arrival = next.hold.arrival;
    next = withMark(next, next.hold.noteIndex, arrival, { kind: arrival });
  }
  next = settleRests(next, now);
  while (true) {
    const note = firstSounding(next);
    if (!note) break;
    if (next.hold?.noteIndex === note.index) break;
    const bounds = boundsFor(next, note);
    if (now <= bounds.deadline + MIC_LATENCY_MS) break;
    next = withMark(next, note.index, "miss", { kind: "miss" });
  }
  return finishIfReady(next, now);
}

function result(before: TimedSession, session: TimedSession, pulse: boolean, sound: TimedSound): TimedReduceResult {
  return {
    session,
    justFinished: session.finished && !before.finished,
    pulse,
    sound,
  };
}

function applyTick(session: TimedSession, now: number): TimedReduceResult {
  const beat = Math.floor((now - session.origin) / session.beatMs);
  const pulse = beat > session.pulseBeat && now >= session.origin;
  const pulsed = pulse ? { ...session, pulseBeat: beat } : session;
  return result(session, resolvePasses(pulsed, now), pulse, "none");
}

function restCovering(session: TimedSession, at: number): ScheduledNote | null {
  for (const note of session.notes) {
    if (!note.rest || session.marks[note.index] != null) continue;
    const start = noteExpectedAt(session, note.startBeat);
    const end = start + note.beats * session.beatMs;
    if (at >= start && at < end) return note;
  }
  return null;
}

function acceptsLoudness(note: ScheduledNote, source: InputSource, velocity: number | undefined): boolean {
  if (!note.dynamic) return true;
  if (source === "mic") return true;
  if (velocity == null) return false;
  return judgeDynamic(note.dynamic, dynamicFromVelocity(velocity)) === "match";
}

function applyAttack(
  session: TimedSession,
  action: Extract<TimedAction, { type: "attack" }>,
): TimedReduceResult {
  const stamped = compensatedAt(action.at, action.source);
  const target = firstSounding(session);
  if (!target || target.midi == null) {
    const rest = restCovering(session, stamped);
    if (!rest) return result(session, session, false, action.midi ? "tap" : "none");
    const restNoise = session.restNoise.slice();
    restNoise[rest.index] = true;
    return result(session, { ...session, restNoise, cue: { kind: "quiet" } }, false, "tap");
  }

  const bounds = boundsFor(session, target);
  if (stamped < bounds.openAt) {
    if (target.togetherMidi != null && action.midi === target.togetherMidi) {
      return result(session, { ...session, bassDown: action.midi }, false, "hold");
    }
    return result(session, flagRest(session, stamped), false, "tap");
  }

  if (target.togetherMidi != null && action.midi === target.togetherMidi) {
    return result(session, { ...session, bassDown: action.midi, cue: { kind: "low-key" } }, false, "hold");
  }

  if (action.midi !== target.midi) {
    if (session.hold?.noteIndex === target.index) {
      return result(session, session, false, "tap");
    }
    const duringRest = flagRest(session, stamped);
    if (duringRest !== session) return result(session, duringRest, false, "tap");
    return result(session, { ...session, cue: { kind: "listen" } }, false, "tap");
  }

  if (session.hold?.noteIndex === target.index && session.hold.midi === action.midi) {
    return result(session, session, false, "none");
  }

  if (target.togetherMidi != null && session.bassDown !== target.togetherMidi) {
    return result(session, { ...session, cue: { kind: "low-key" } }, false, "tap");
  }

  if (!acceptsLoudness(target, action.source, action.velocity)) {
    return result(
      session,
      { ...session, cue: { kind: "dynamic", word: target.dynamic === "loud" ? "loud" : "soft" } },
      false,
      "tap",
    );
  }

  const arrival = judgeArrival(stamped - bounds.expected, bounds.windows);
  if (arrival === "miss") {
    return result(session, session, false, "tap");
  }

  const hold: ActiveHold = {
    noteIndex: target.index,
    midi: action.midi,
    startedAt: stamped,
    arrival,
  };
  return result(session, { ...session, hold, cue: { kind: "holding" } }, false, "hold");
}

/** A hold that was let go early is a short note, even after the arrival window has closed. */
function rememberShortHold(session: TimedSession, noteIndex: number, at: number): TimedSession {
  const resolved = resolvePasses(session, at);
  if (resolved.marks[noteIndex] !== "miss") return resolved;
  const marks = resolved.marks.slice();
  marks[noteIndex] = "short";
  return { ...resolved, marks, cue: { kind: "short" } };
}

function flagRest(session: TimedSession, at: number): TimedSession {
  const rest = restCovering(session, at);
  if (!rest) return session;
  const restNoise = session.restNoise.slice();
  restNoise[rest.index] = true;
  return { ...session, restNoise, cue: { kind: "quiet" } };
}

function applyRelease(
  session: TimedSession,
  action: Extract<TimedAction, { type: "release" }>,
): TimedReduceResult {
  if (session.bassDown === action.midi) {
    const held = session.hold;
    const note = held ? session.notes[held.noteIndex] : null;
    if (held && note?.togetherMidi === action.midi) {
      const required = requiredHoldMs(note.duration, session.beatMs);
      if (holdReached(held.startedAt, action.at, required)) {
        const marked = withMark(session, held.noteIndex, held.arrival, { kind: held.arrival });
        return result(session, finishIfReady(settleRests({ ...marked, bassDown: null }, action.at), action.at), false, "none");
      }
      const cleared: TimedSession = { ...session, bassDown: null, hold: null, cue: { kind: "short" } };
      return result(session, rememberShortHold(cleared, held.noteIndex, action.at), false, "none");
    }
    return result(session, { ...session, bassDown: null }, false, "none");
  }

  const hold = session.hold;
  if (!hold || hold.midi !== action.midi) return result(session, session, false, "none");
  const note = session.notes[hold.noteIndex];
  if (!note) return result(session, session, false, "none");
  const required = requiredHoldMs(note.duration, session.beatMs);
  const decision = onRhythmRelease(
    { midi: hold.midi, startedAt: hold.startedAt, kind: "correct" },
    action.midi,
    required,
    action.at,
  );
  if (decision.outcome.type === "early-release") {
    const cleared = { ...session, hold: null, cue: { kind: "short" as const } };
    return result(session, rememberShortHold(cleared, hold.noteIndex, action.at), false, "none");
  }
  if (decision.outcome.type === "completed") {
    const marked = withMark(session, hold.noteIndex, hold.arrival, { kind: hold.arrival });
    return result(session, finishIfReady(settleRests(marked, action.at), action.at), false, "none");
  }
  return result(session, session, false, "none");
}

export function reduceTimed(session: TimedSession, action: TimedAction): TimedReduceResult {
  if (session.finished) return { session, justFinished: false, pulse: false, sound: "none" };
  if (action.type === "tick") return applyTick(session, action.now);
  if (action.type === "attack") return applyAttack(session, action);
  return applyRelease(session, action);
}
