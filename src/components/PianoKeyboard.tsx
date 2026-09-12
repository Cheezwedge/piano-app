import { BLACK_KEYS_C4_TO_C5, WHITE_KEYS_C4_TO_C5, midiToName } from "../audio/notes";
import type { FeedbackKind } from "../types";

interface Props {
  targetMidi: number | null;
  hintVisible: boolean;
  lastPlayed: number | null;
  feedback: FeedbackKind;
  onPlay: (midi: number) => void;
}

export function PianoKeyboard({ targetMidi, hintVisible, lastPlayed, feedback, onPlay }: Props) {
  return (
    <div className="keyboard" data-testid="keyboard" aria-label="On-screen piano">
      <div className="white-row">
        {WHITE_KEYS_C4_TO_C5.map((midi) => {
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
              <span className="key-label">{midiToName(midi).replace(/\d/, "")}</span>
            </button>
          );
        })}
      </div>
      <div className="black-row">
        {BLACK_KEYS_C4_TO_C5.map((midi) => {
          const left = blackKeyOffset(midi);
          const isPlayed = lastPlayed === midi;
          return (
            <button
              key={midi}
              type="button"
              className={`black-key ${isPlayed ? `tone-${feedback}` : ""}`}
              style={{ left }}
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

function blackKeyOffset(midi: number): string {
  const map: Record<number, number> = {
    61: 0.72,
    63: 1.78,
    66: 3.72,
    68: 4.75,
    70: 5.78,
  };
  return `calc(${map[midi]} * (100% / 8))`;
}
