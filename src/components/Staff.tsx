import type { FeedbackKind, LessonNote } from "../types";

const LINE_GAP = 18;
const E4_MIDI = 64;

function staffStepsFromE4(midi: number): number {
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
  const width = 420;
  const height = 180;
  const e4Y = 108;
  const x = 250;
  const steps = staffStepsFromE4(note.midi);
  const y = e4Y - steps * (LINE_GAP / 2);
  const needsLedger = note.midi === 60;

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
            x1="70"
            x2="400"
            y1={e4Y - line * LINE_GAP}
            y2={e4Y - line * LINE_GAP}
            stroke="#2c2418"
            strokeWidth="1.6"
          />
        ))}
        <TrebleClef x={78} y={36} />
        {needsLedger ? (
          <line x1={x - 22} x2={x + 22} y1={y} y2={y} stroke="#2c2418" strokeWidth="1.6" />
        ) : null}
        <ellipse
          cx={x}
          cy={y}
          rx="13"
          ry="9"
          transform={`rotate(-18 ${x} ${y})`}
          fill={fill}
          data-testid="staff-note"
        />
        <line x1={x + 11} x2={x + 11} y1={y} y2={y - 52} stroke={fill} strokeWidth="2.2" />
        {showFinger ? (
          <text x={x} y={y - 62} textAnchor="middle" className="finger-svg">
            {note.finger}
          </text>
        ) : null}
      </svg>
    </div>
  );
}

function TrebleClef({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(0.92)`} fill="#2c2418">
      <path d="M34 8c6 2 10 10 8 20-3 18-10 36-11 54 8 4 14 12 14 22 0 14-12 24-26 24s-26-10-26-24c0-10 6-18 16-22 1-8 4-20 7-36C14 42 8 34 8 24 8 10 20 2 34 8zm-4 86c-8 0-14-5-14-12s6-12 12-14c-1 10 1 20 2 26zm6-70c0-8-4-12-8-14-6-2-10 2-10 8 0 6 4 16 6 24 4-6 12-10 12-18z" />
    </g>
  );
}
