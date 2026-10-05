import { describe, expect, it } from "vitest";
import { bassClefShiftY, bassFourthLineY, bassLineY, bassNoteY, staffStepsFromE4 } from "./Staff";

describe("treble staff placement", () => {
  it("puts C4 on a ledger two steps below the bottom line", () => {
    expect(staffStepsFromE4(60)).toBe(-2);
    expect(staffStepsFromE4(62)).toBe(-1);
    expect(staffStepsFromE4(64)).toBe(0);
    expect(staffStepsFromE4(65)).toBe(1);
    expect(staffStepsFromE4(67)).toBe(2);
  });
});

describe("bass staff placement", () => {
  it("puts F3 on the fourth line and shifts the clef dots onto that line", () => {
    const fourth = bassFourthLineY();
    expect(fourth).toBe(bassLineY(3));
    expect(bassNoteY(53)).toBe(fourth);
    expect(bassClefShiftY()).toBe(fourth - 98);
  });

  it("puts low C in the second space and D and G on their bass places", () => {
    const secondSpace = (bassLineY(1) + bassLineY(2)) / 2;
    const fourthSpace = (bassLineY(3) + bassLineY(4)) / 2;
    expect(bassNoteY(48)).toBe(secondSpace);
    expect(bassNoteY(50)).toBe(bassLineY(2));
    expect(bassNoteY(55)).toBe(fourthSpace);
  });
});
