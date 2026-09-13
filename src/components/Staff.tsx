import type { FeedbackKind, LessonNote } from "../types";

const LINE_GAP = 26;
const E4_MIDI = 64;
const F3_MIDI = 53;

export function staffStepsFromE4(midi: number): number {
  const diatonic = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
  const octave = Math.floor(midi / 12) - Math.floor(E4_MIDI / 12);
  const step = diatonic[midi % 12] - diatonic[E4_MIDI % 12];
  return octave * 7 + step;
}

function staffStepsFromF3(midi: number): number {
  return staffStepsFromE4(midi) - staffStepsFromE4(F3_MIDI);
}

interface Props {
  note: LessonNote;
  feedback: FeedbackKind;
  showFinger: boolean;
}

export function Staff({ note, feedback, showFinger }: Props) {
  const width = 440;
  const height = 230;
  const e4Y = 128;
  const f3Y = 102;
  const x = 268;
  const bass = note.midi != null && note.midi < 60;
  const rest = note.midi == null || note.duration === "rest";
  const steps = rest ? 0 : bass ? staffStepsFromF3(note.midi as number) : staffStepsFromE4(note.midi as number);
  const baseY = bass ? f3Y : e4Y;
  const y = rest ? baseY - LINE_GAP : baseY - steps * (LINE_GAP / 2);
  const needsLedger = !rest && !bass && (note.midi as number) <= 60;

  const fill =
    feedback === "correct"
      ? "var(--correct)"
      : feedback === "correct-after-hint"
        ? "var(--hinted)"
        : feedback === "wrong"
          ? "var(--wrong)"
          : "var(--ink)";

  const open = note.duration === "half" || note.duration === "whole";
  const stem = note.duration !== "whole" && !rest;

  return (
    <div className="staff-wrap" data-testid="staff">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Staff, target ${note.name}`}>
        {[0, 1, 2, 3, 4].map((line) => (
          <line
            key={line}
            x1="86"
            x2="420"
            y1={(bass ? 154 : e4Y) - line * LINE_GAP}
            y2={(bass ? 154 : e4Y) - line * LINE_GAP}
            stroke="#2c2418"
            strokeWidth="1.7"
          />
        ))}
        {bass ? <BassClef /> : <TrebleClef />}
        {needsLedger ? (
          <line x1={x - 26} x2={x + 26} y1={y} y2={y} stroke="#2c2418" strokeWidth="1.8" />
        ) : null}
        {rest ? (
          <text x={x} y={y} textAnchor="middle" className="rest-svg">
            𝄽
          </text>
        ) : (
          <>
            <ellipse
              cx={x}
              cy={y}
              rx="14"
              ry="10"
              transform={`rotate(-18 ${x} ${y})`}
              fill={open ? "var(--paper)" : fill}
              stroke={fill}
              strokeWidth={open ? 2.4 : 0}
              data-testid="staff-note"
            />
            {stem ? <line x1={x + 12} x2={x + 12} y1={y} y2={y - 56} stroke={fill} strokeWidth="2.3" /> : null}
          </>
        )}
        {showFinger && !rest ? (
          <text x={x} y={y - 66} textAnchor="middle" className="finger-svg">
            {note.hand === "left" ? `L${note.finger}` : note.finger}
          </text>
        ) : null}
        <text x={x} y={214} textAnchor="middle" className="staff-name">
          {note.hand === "left" ? `LH ${note.name}` : note.name}
          {note.duration && note.duration !== "quarter" ? ` · ${note.duration}` : ""}
        </text>
      </svg>
    </div>
  );
}

function TrebleClef() {
  return (
    <g fill="none" stroke="#2c2418" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M104 36
           C118 34 126 48 118 64
           C108 86 96 104 97 122
           C98 142 118 152 134 144
           C150 136 152 116 136 108
           C120 100 106 112 108 126
           C110 140 126 146 138 138"
        strokeWidth="3.1"
      />
      <path
        d="M97 122
           C88 98 92 68 106 48
           C112 38 110 28 100 28
           C90 28 88 40 96 44"
        strokeWidth="3.1"
      />
      <path
        d="M97 122
           L92 176
           C90 190 76 194 68 184
           C60 174 76 166 88 176"
        strokeWidth="3.1"
      />
      <circle cx="134" cy="118" r="3.2" fill="#2c2418" stroke="none" />
    </g>
  );
}

function BassClef() {
  return (
    <g fill="#2c2418">
      <path d="M92 78c18 0 34 14 34 32 0 22-20 38-46 38v-14c18 0 30-10 30-24 0-12-10-20-22-20-8 0-14 4-18 10l-10-10c8-8 18-12 32-12z" />
      <circle cx="138" cy="88" r="4" />
      <circle cx="138" cy="108" r="4" />
    </g>
  );
}
