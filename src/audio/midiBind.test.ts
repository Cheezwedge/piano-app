import { describe, expect, it, vi } from "vitest";
import { bindUnique } from "./midiBind";

describe("MIDI bind helper", () => {
  it("does not bind the same input twice", () => {
    const seen = new WeakSet<object>();
    const input = { id: "piano" };
    const bind = vi.fn();
    expect(bindUnique(seen, [input, input], bind)).toBe(1);
    expect(bindUnique(seen, [input], bind)).toBe(0);
    expect(bind).toHaveBeenCalledTimes(1);
  });
});
