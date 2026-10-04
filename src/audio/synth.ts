import { midiToFreq } from "./notes";

let sharedCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AudioContext();
  }
  return sharedCtx;
}

export async function resumeAudio(): Promise<AudioContext> {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  return ctx;
}

const heldTones = new Map<number, { osc: OscillatorNode; gain: GainNode }>();

/** Keep an on-screen key sounding until the child lets go. */
export function beginHeldTone(midi: number): void {
  if (heldTones.has(midi)) return;
  const ctx = getAudioContext();
  const start = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(midiToFreq(midi), start);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1800, start);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  heldTones.set(midi, { osc: oscillator, gain });
}

export function endHeldTone(midi: number): void {
  const voice = heldTones.get(midi);
  if (!voice) return;
  heldTones.delete(midi);
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  try {
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(0.2, now);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    voice.osc.stop(now + 0.08);
  } catch {
    // The context or oscillator may already be closed.
  }
}

export function endAllHeldTones(): void {
  for (const midi of [...heldTones.keys()]) endHeldTone(midi);
}

/** Stop every sounding key except one the child is still holding. */
export function endAllHeldTonesExcept(keepMidi: number | null): void {
  for (const midi of [...heldTones.keys()]) {
    if (midi !== keepMidi) endHeldTone(midi);
  }
}

export function playMidiNote(midi: number, duration = 0.55, when = 0): void {
  const ctx = getAudioContext();
  const start = Math.max(ctx.currentTime, ctx.currentTime + when);
  const freq = midiToFreq(midi);

  const oscillator = ctx.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(freq, start);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1800, start);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}
