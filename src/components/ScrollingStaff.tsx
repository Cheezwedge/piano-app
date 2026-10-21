import { useEffect, useState } from "react";
import { durationBeats } from "../audio/notes";
import { requiredHoldMs } from "../lib/rhythm";
import {
  holdFill,
  noteExpectedAt,
  scrollingClef,
  timedCueCopy,
  type NoteMark,
  type ScheduledNote,
  type TimedCue,
  type TimedSession,
} from "../lib/timedPlay";
import { BassClef, STAFF_LINE_GAP, TrebleClef, bassLineY, bassNoteY, staffStepsFromE4 } from "./Staff";

const PX = 84;
const NOW_X = 188;
const WIDTH = 720;
const E4_Y = 128;
const SINGLE_HEIGHT = 248;

interface Props {
  session: TimedSession;
  showFinger: boolean;
}

export function ScrollingStaff({ session, showFinger }: Props) {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    let frame = 0;
    const loop = () => {
      setNow(performance.now());
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [session.origin]);

  const clef = scrollingClef(session.notes);
  const height = clef === "grand" ? 460 : SINGLE_HEIGHT;
  const into = ((now - session.origin) % session.beatMs + session.beatMs) % session.beatMs;
  const pulsing = now >= session.origin && into < 150;
  const travel = (now - session.origin) / session.beatMs - session.leadBeats;

  return (
    <div
      className="scroll-staff"
      data-testid="scrolling-staff"
      data-clef={clef}
      data-origin={Math.round(session.origin)}
      data-beat-ms={session.beatMs}
    >
      <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label="Notes move toward the now line">
        <defs>
          <clipPath id="timed-staff-clip">
            <rect x="148" y="0" width={WIDTH - 148} height={height} />
          </clipPath>
        </defs>
        <Score clef={clef} />
        <line
          className="staff-playhead"
          x1={NOW_X}
          x2={NOW_X}
          y1={12}
          y2={height - 28}
          strokeWidth={pulsing ? 3.4 : 2.2}
          data-testid="now-line"
        />
        <circle
          cx={NOW_X}
          cy={clef === "bass" ? bassLineY(2) : E4_Y - 2 * STAFF_LINE_GAP}
          r={pulsing ? 11 : 6}
          fill="var(--staff-playhead)"
          opacity={pulsing ? 0.45 : 0.18}
          data-testid="scroll-pulse"
          data-on={pulsing ? "true" : "false"}
        />
        <text x={NOW_X} y={height - 8} textAnchor="middle" className="now-label">
          now
        </text>
        <g clipPath="url(#timed-staff-clip)">
          {session.notes.map((note) => (
            <MovingNote
              key={note.index}
              note={note}
              session={session}
              x={NOW_X + (note.startBeat - travel) * PX}
              now={now}
              showFinger={showFinger}
              clef={clef}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

export function TimedCueBanner({ cue }: { cue: TimedCue }) {
  return (
    <p className="banner timed-cue" data-testid="timed-cue" data-cue={cue.kind}>
      {timedCueCopy(cue)}
    </p>
  );
}

function Score({ clef }: { clef: "treble" | "bass" | "grand" }) {
  if (clef === "grand") {
    return (
      <>
        <StaffLines lineY={(line) => E4_Y - line * STAFF_LINE_GAP} />
        <TrebleClef />
        <g transform="translate(0 230)">
          <StaffLines lineY={bassLineY} />
          <BassClef />
        </g>
      </>
    );
  }
  if (clef === "bass") {
    return (
      <>
        <StaffLines lineY={bassLineY} />
        <BassClef />
      </>
    );
  }
  return (
    <>
      <StaffLines lineY={(line) => E4_Y - line * STAFF_LINE_GAP} />
      <TrebleClef />
    </>
  );
}

function StaffLines({ lineY }: { lineY: (line: number) => number }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((line) => (
        <line
          key={line}
          x1="118"
          x2="700"
          className="staff-line"
          y1={lineY(line)}
          y2={lineY(line)}
        />
      ))}
    </>
  );
}

function MovingNote({
  note,
  session,
  x,
  now,
  showFinger,
  clef,
}: {
  note: ScheduledNote;
  session: TimedSession;
  x: number;
  now: number;
  showFinger: boolean;
  clef: "treble" | "bass" | "grand";
}) {
  const mark = session.marks[note.index];
  const yShift = clef === "grand" && note.midi != null && note.midi < 60 ? 230 : 0;
  return (
    <g>
      {note.rest || note.midi == null ? (
        <RestMark x={x} y={restY(clef)} mark={mark} />
      ) : (
        <NoteHead
          midi={note.midi}
          x={x}
          yShift={yShift}
          mark={mark}
          duration={note.duration}
          finger={showFinger ? (note.hand === "left" ? `L${note.finger}` : String(note.finger)) : null}
          progress={fillFor(session, note, now)}
          fillId={`hold-fill-${note.index}`}
        />
      )}
      {note.togetherMidi != null ? (
        <NoteHead
          midi={note.togetherMidi}
          x={x}
          yShift={230}
          mark={mark}
          duration={note.duration}
          finger={showFinger && note.togetherFinger != null ? `L${note.togetherFinger}` : null}
          progress={fillFor(session, note, now)}
          fillId={`hold-fill-${note.index}-low`}
        />
      ) : null}
    </g>
  );
}

function fillFor(session: TimedSession, note: ScheduledNote, now: number): number {
  const mark = session.marks[note.index];
  if (mark === "on-time" || mark === "early" || mark === "late") return 1;
  if (session.hold?.noteIndex !== note.index) return 0;
  const required = requiredHoldMs(note.duration, session.beatMs);
  const end = noteExpectedAt(session, note.startBeat) + note.beats * session.beatMs;
  const clock = Math.min(now, end);
  return holdFill(session.hold.startedAt, clock, required);
}

function restY(clef: "treble" | "bass" | "grand"): number {
  if (clef === "bass") return bassLineY(2);
  return E4_Y - STAFF_LINE_GAP;
}

function RestMark({ x, y, mark }: { x: number; y: number; mark: NoteMark | null }) {
  return (
    <text x={x} y={y} textAnchor="middle" className="rest-svg" opacity={mark === "rest-sound" ? 0.45 : 1}>
      𝄽
    </text>
  );
}

function NoteHead({
  midi,
  x,
  yShift,
  mark,
  duration,
  finger,
  progress,
  fillId,
}: {
  midi: number;
  x: number;
  yShift: number;
  mark: NoteMark | null;
  duration: ScheduledNote["duration"];
  finger: string | null;
  progress: number;
  fillId: string;
}) {
  const bass = midi < 60;
  const y = (bass ? bassNoteY(midi) : E4_Y - staffStepsFromE4(midi) * (STAFF_LINE_GAP / 2)) + yShift;
  const color = headColor(mark);
  const open = duration === "half" || duration === "whole";
  const stem = duration !== "whole";
  const bar = Math.max(18, durationBeats(duration) * PX - 22);
  const needsLedger = !bass && midi <= 60;
  return (
    <g opacity={mark === "miss" || mark === "short" ? 0.85 : 1}>
      {needsLedger ? <line className="staff-line" x1={x - 22} x2={x + 22} y1={y} y2={y} /> : null}
      <ellipse
        cx={x}
        cy={y}
        rx="15"
        ry="11"
        transform={`rotate(-18 ${x} ${y})`}
        fill={open ? "var(--staff-bg)" : color}
        stroke={color}
        strokeWidth={open ? 2.6 : 0}
      />
      {stem ? <line x1={x + 11} x2={x + 11} y1={y} y2={y - 46} stroke={color} strokeWidth="2.1" /> : null}
      <rect className="hold-track" x={x + 8} y={y + 14} width={bar} height="7" rx="3.5" />
      <rect
        x={x + 8}
        y={y + 14}
        width={Math.max(0, bar * progress)}
        height="7"
        rx="3.5"
        fill="var(--staff-playhead)"
        data-testid={fillId}
        data-progress={progress.toFixed(2)}
      />
      {finger ? (
        <text x={x - 18} y={y + 5} textAnchor="end" className="finger-svg scroll-finger">
          {finger}
        </text>
      ) : null}
    </g>
  );
}

function headColor(mark: NoteMark | null): string {
  if (mark === "on-time") return "var(--correct)";
  if (mark === "early" || mark === "late") return "var(--hinted)";
  if (mark === "miss" || mark === "short" || mark === "rest-sound") return "var(--staff-muted)";
  return "var(--staff-ink)";
}
