import { describe, expect, it } from "vitest";
import { staffStepsFromE4 } from "./Staff";

describe("treble staff placement", () => {
  it("puts C4 on a ledger two steps below the bottom line", () => {
    expect(staffStepsFromE4(60)).toBe(-2);
    expect(staffStepsFromE4(62)).toBe(-1);
    expect(staffStepsFromE4(64)).toBe(0);
    expect(staffStepsFromE4(65)).toBe(1);
    expect(staffStepsFromE4(67)).toBe(2);
  });
});
