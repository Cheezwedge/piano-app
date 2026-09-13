import {
  BLACK_KEYS_C3_TO_C5,
  BLACK_KEYS_C4_TO_C5,
  WHITE_KEYS_C3_TO_C5,
  WHITE_KEYS_C4_TO_C5,
  blackKeyLeft,
  midiToName,
} from "../audio/notes";
import type { FeedbackKind } from "../types";

interface Props {
  targetMidi: number | null;
  hintVisible: boolean;
  lastPlayed: number | null;
  feedback: FeedbackKind;
  onPlay: (midi: number) => void;
  range?: "treble" | "wide";
}

export function PianoKeyboard({
  targetMidi,
  hintVisible,
  lastPlayed,
  feedback,
  onPlay,
  range = "treble",
}: Props) {
  const whites = range === "wide" ? WHITE_KEYS_C3_TO_C5 : WHITE_KEYS_C4_TO_C5;
  const blacks = range === "wide" ? BLACK_KEYS_C3_TO_C5 : BLACK_KEYS_C4_TO_C5;

  return (
    <div className={`keyboard ${range === "wide" ? "wide" : ""}`} data-testid="keyboard" aria-label="On-screen piano">
      <div className="white-row" style={{ gridTemplateColumns: `repeat(${whites.length}, 1fr)` }}>
        {whites.map((midi) => {
          const isTarget = hintVisible && midi === targetMidi;
          const isPlayed = lastPlayed === midi;
          const tone = isPlayed ? feedback : isTarget ? "hint" : "idle";
          return (
            <button
              key={midi}
              type="button"
              className={`white-key tone-${tone}`}
              data-testid={`key-${midi}`}
              data-hint={isTarget ? "true" : "false"}
              aria-label={midiToName(midi)}
              onPointerDown={(event) => {
                event.preventDefault();
                onPlay(midi);
              }}
            >
              {isTarget ? <span className="hint-flag">this key</span> : null}
              <span className="key-label">{midiToName(midi)}</span>
            </button>
          );
        })}
      </div>
      <div className="black-row">
        {blacks.map((midi) => {
          const isPlayed = lastPlayed === midi;
          return (
            <button
              key={midi}
              type="button"
              className={`black-key ${isPlayed ? `tone-${feedback}` : ""}`}
              style={{ left: blackKeyLeft(midi, whites), width: `calc(100% / ${whites.length} * 0.62)` }}
              data-testid={`key-${midi}`}
              aria-label={midiToName(midi)}
              onPointerDown={(event) => {
                event.preventDefault();
                onPlay(midi);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
