import { describe, expect, it } from "vitest";
import { classifyAttempt, shouldAdvance } from "./practice";

describe("practice mode", () => {
  it("stays on the same note after a wrong pitch", () => {
    expect(classifyAttempt(62, 60, false)).toBe("wrong");
    expect(shouldAdvance("wrong")).toBe(false);
  });

  it("marks first-try successes green", () => {
    expect(classifyAttempt(64, 64, false)).toBe("correct");
    expect(shouldAdvance("correct")).toBe(true);
  });

  it("marks hinted successes gold", () => {
    expect(classifyAttempt(65, 65, true)).toBe("correct-after-hint");
    expect(shouldAdvance("correct-after-hint")).toBe(true);
  });

  it("treats any pitch during a rest as wrong", () => {
    expect(classifyAttempt(60, null, false)).toBe("wrong");
    expect(shouldAdvance("wrong")).toBe(false);
  });
});
