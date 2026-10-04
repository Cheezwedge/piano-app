import { describe, expect, it } from "vitest";
import { COURSE_UNITS } from "../data/courses";
import {
  LOUD_GAIN,
  LOUD_VELOCITY_MIN,
  SOFT_GAIN,
  SOFT_VELOCITY_MAX,
  dynamicFromVelocity,
  gainForDynamic,
  judgeDynamic,
  velocityForScreen,
} from "./dynamics";

describe("soft and loud", () => {
  it("does not pass a loud hit on a soft note, or a soft hit on a loud note", () => {
    expect(dynamicFromVelocity(20)).toBe("soft");
    expect(dynamicFromVelocity(120)).toBe("loud");
    expect(judgeDynamic("soft", "loud")).toBe("wrong-dynamic");
    expect(judgeDynamic("loud", "soft")).toBe("wrong-dynamic");
    expect(judgeDynamic("soft", dynamicFromVelocity(112))).toBe("wrong-dynamic");
    expect(judgeDynamic("loud", dynamicFromVelocity(32))).toBe("wrong-dynamic");
  });

  it("passes only when the hit matches the target", () => {
    expect(judgeDynamic("soft", "soft")).toBe("match");
    expect(judgeDynamic("loud", "loud")).toBe("match");
    expect(judgeDynamic("soft", dynamicFromVelocity(SOFT_VELOCITY_MAX))).toBe("match");
    expect(judgeDynamic("loud", dynamicFromVelocity(LOUD_VELOCITY_MIN))).toBe("match");
  });

  it("lets a middle velocity match neither, and ignores notes with no dynamic", () => {
    expect(dynamicFromVelocity(70)).toBeNull();
    expect(judgeDynamic("soft", null)).toBe("wrong-dynamic");
    expect(judgeDynamic("loud", dynamicFromVelocity(70))).toBe("wrong-dynamic");
    expect(judgeDynamic(undefined, "loud")).toBe("unspecified");
  });

  it("plays on-screen soft quieter than loud, using velocities in those bands", () => {
    expect(velocityForScreen("soft")).toBeLessThanOrEqual(SOFT_VELOCITY_MAX);
    expect(velocityForScreen("loud")).toBeGreaterThanOrEqual(LOUD_VELOCITY_MIN);
    expect(dynamicFromVelocity(velocityForScreen("soft"))).toBe("soft");
    expect(dynamicFromVelocity(velocityForScreen("loud"))).toBe("loud");
    expect(gainForDynamic("soft")).toBe(SOFT_GAIN);
    expect(gainForDynamic("loud")).toBe(LOUD_GAIN);
    expect(LOUD_GAIN).toBeGreaterThan(SOFT_GAIN * 4);
  });
});

describe("soft and loud course step", () => {
  const ids = COURSE_UNITS.map((unit) => unit.id);
  const unit = COURSE_UNITS.find((item) => item.id === "soft-loud");
  const whites = new Set([60, 62, 64, 65, 67]);

  it("adds one right-hand step after Both at Once and leaves earlier units alone", () => {
    expect(ids.at(-1)).toBe("soft-loud");
    expect(ids.at(-2)).toBe("hands-together");
    expect(unit?.rhythm).toBe(false);
    expect(unit?.keyboard).toBe("treble");
    expect(unit?.reading).toBeUndefined();
    expect(unit?.stages.map((stage) => stage.kind)).toEqual(["demo", "guided", "melody"]);

    const dynamics = new Set<string>();
    for (const stage of unit?.stages ?? []) {
      expect(stage.notes.length).toBeLessThanOrEqual(4);
      for (const note of stage.notes) {
        expect(note.hand ?? "right").toBe("right");
        expect(note.together).toBeUndefined();
        expect(whites.has(note.midi as number)).toBe(true);
        expect(note.dynamic === "soft" || note.dynamic === "loud").toBe(true);
        dynamics.add(note.dynamic as string);
      }
    }
    expect(dynamics.has("soft")).toBe(true);
    expect(dynamics.has("loud")).toBe(true);

    for (const earlier of COURSE_UNITS.filter((item) => item.id !== "soft-loud")) {
      for (const stage of earlier.stages) {
        for (const note of stage.notes) expect(note.dynamic).toBeUndefined();
      }
    }
  });
});
