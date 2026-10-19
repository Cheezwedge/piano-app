import { describe, expect, it } from "vitest";
import { createPitchGate, stepPitchGate } from "./pitchGate";

function frames(midi: number | null, count: number, state = createPitchGate()) {
  let current = state;
  const events: Array<ReturnType<typeof stepPitchGate>> = [];
  for (let i = 0; i < count; i += 1) {
    const step = stepPitchGate(current, midi);
    current = step.state;
    events.push(step);
  }
  return { state: current, events };
}

describe("mic pitch gate", () => {
  it("emits one attack after a steady pitch and one release after silence", () => {
    const attack = frames(60, 3);
    expect(attack.events.map((step) => step.noteOn)).toEqual([null, null, 60]);
    expect(attack.state.sounding).toBe(60);

    const still = frames(60, 4, attack.state);
    expect(still.events.every((step) => step.noteOn == null && step.noteOff == null)).toBe(true);

    const drop = frames(null, 2, still.state);
    expect(drop.events.every((step) => step.noteOff == null)).toBe(true);
    expect(drop.events[0].silenceStarted).toBe(true);

    const released = stepPitchGate(drop.state, null);
    expect(released.noteOff).toBe(60);
    expect(released.releasedBySilence).toBe(true);
    expect(released.silenceStarted).toBe(false);
  });

  it("keeps the note through a one-frame dropout", () => {
    const attack = frames(60, 3);
    const blip = stepPitchGate(attack.state, null);
    expect(blip.noteOff).toBeNull();
    const back = frames(60, 3, blip.state);
    expect(back.state.sounding).toBe(60);
    expect(back.events.some((step) => step.noteOff === 60)).toBe(false);
  });
});
