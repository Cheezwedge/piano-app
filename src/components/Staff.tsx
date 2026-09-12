import type { FeedbackKind, LessonNote } from "../types";

const LINE_GAP = 20;
const E4_MIDI = 64;

export function staffStepsFromE4(midi: number): number {
  const diatonic = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
  const octave = Math.floor(midi / 12) - Math.floor(E4_MIDI / 12);
  const step = diatonic[midi % 12] - diatonic[E4_MIDI % 12];
  return octave * 7 + step;
}

interface Props {
  note: LessonNote;
  feedback: FeedbackKind;
  showFinger: boolean;
}

export function Staff({ note, feedback, showFinger }: Props) {
  const width = 440;
  const height = 200;
  const e4Y = 118;
  const x = 268;
  const steps = staffStepsFromE4(note.midi);
  const y = e4Y - steps * (LINE_GAP / 2);
  const needsLedger = note.midi <= 60;

  const fill =
    feedback === "correct"
      ? "var(--correct)"
      : feedback === "correct-after-hint"
        ? "var(--hinted)"
        : feedback === "wrong"
          ? "var(--wrong)"
          : "var(--ink)";

  return (
    <div className="staff-wrap" data-testid="staff">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Treble staff, target note ${note.name}`}>
        {[0, 1, 2, 3, 4].map((line) => (
          <line
            key={line}
            x1="86"
            x2="420"
            y1={e4Y - line * LINE_GAP}
            y2={e4Y - line * LINE_GAP}
            stroke="#2c2418"
            strokeWidth="1.7"
          />
        ))}
        <TrebleClef />
        {needsLedger ? (
          <line x1={x - 26} x2={x + 26} y1={y} y2={y} stroke="#2c2418" strokeWidth="1.8" />
        ) : null}
        <ellipse
          cx={x}
          cy={y}
          rx="14"
          ry="10"
          transform={`rotate(-18 ${x} ${y})`}
          fill={fill}
          data-testid="staff-note"
        />
        <line x1={x + 12} x2={x + 12} y1={y} y2={y - 56} stroke={fill} strokeWidth="2.3" />
        {showFinger ? (
          <text x={x} y={y - 66} textAnchor="middle" className="finger-svg">
            {note.finger}
          </text>
        ) : null}
        <text x={x} y={188} textAnchor="middle" className="staff-name">
          {note.name}
        </text>
      </svg>
    </div>
  );
}

/** Original G-clef drawing for Home Keys (not copied from a commercial app). */
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
