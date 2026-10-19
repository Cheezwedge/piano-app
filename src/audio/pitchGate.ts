/** How many steady frames before a mic pitch counts as a new attack. */
export const PITCH_ATTACK_FRAMES = 3;

/** How many quiet frames before a sounding mic pitch counts as released. */
export const PITCH_RELEASE_FRAMES = 3;

export interface PitchGateState {
  lastMidi: number | null;
  stableCount: number;
  armed: boolean;
  sounding: number | null;
  quietFrames: number;
}

export interface PitchGateStep {
  state: PitchGateState;
  noteOn: number | null;
  noteOff: number | null;
  /** True only on the first quiet frame, so the caller can stamp the release time. */
  silenceStarted: boolean;
  /** True when noteOff was confirmed by silence rather than a new pitch. */
  releasedBySilence: boolean;
}

export function createPitchGate(): PitchGateState {
  return {
    lastMidi: null,
    stableCount: 0,
    armed: true,
    sounding: null,
    quietFrames: 0,
  };
}

/**
 * Turns a stream of confident MIDI guesses (or null) into note-on / note-off.
 * A one-frame dropout does not release the note.
 */
export function stepPitchGate(state: PitchGateState, midi: number | null): PitchGateStep {
  const next: PitchGateState = { ...state };
  let noteOn: number | null = null;
  let noteOff: number | null = null;
  let silenceStarted = false;
  let releasedBySilence = false;

  if (midi != null) {
    next.quietFrames = 0;
    if (midi === next.lastMidi) {
      next.stableCount += 1;
    } else {
      next.lastMidi = midi;
      next.stableCount = 1;
      next.armed = true;
    }
    if (next.armed && next.stableCount >= PITCH_ATTACK_FRAMES) {
      next.armed = false;
      if (next.sounding != null && next.sounding !== midi) {
        noteOff = next.sounding;
      }
      next.sounding = midi;
      noteOn = midi;
    }
    return { state: next, noteOn, noteOff, silenceStarted, releasedBySilence };
  }

  next.lastMidi = null;
  next.stableCount = 0;
  next.armed = true;
  if (next.sounding != null) {
    if (next.quietFrames === 0) silenceStarted = true;
    next.quietFrames += 1;
    if (next.quietFrames >= PITCH_RELEASE_FRAMES) {
      noteOff = next.sounding;
      next.sounding = null;
      next.quietFrames = 0;
      releasedBySilence = true;
    }
  }
  return { state: next, noteOn, noteOff, silenceStarted, releasedBySilence };
}
