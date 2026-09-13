import { describe, expect, it } from "vitest";
import { LESSON1_MIDIS } from "../audio/notes";
import { LESSON_1 } from "./lesson1";

describe("Lesson 1 content", () => {
  it("uses only C D E F G around middle C", () => {
    const allowed = new Set<number>(LESSON1_MIDIS);
    for (const stage of LESSON_1.stages) {
      for (const note of stage.notes) {
        expect(note.midi != null && allowed.has(note.midi)).toBe(true);
      }
    }
  });

  it("has demo, guided, and an original melody", () => {
    expect(LESSON_1.stages.map((stage) => stage.kind)).toEqual(["demo", "guided", "melody"]);
    expect(LESSON_1.stages[2].title).toBe("Garden Walk");
    expect(LESSON_1.stages[2].notes).toHaveLength(9);
  });

  it("keeps guided hints on the first five notes", () => {
    expect(LESSON_1.stages[1].notes.map((note) => note.name)).toEqual(["C", "D", "E", "F", "G"]);
  });
});
