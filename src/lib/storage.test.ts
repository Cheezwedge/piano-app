import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_STATE } from "../types";
import { STORAGE_KEY, clearState, loadState, saveState } from "./storage";

describe("local persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns defaults when empty", () => {
    expect(loadState().pinHash).toBe("");
    expect(loadState().kids).toEqual([]);
  });

  it("round-trips parent settings", () => {
    saveState({
      ...DEFAULT_STATE,
      pinHash: "abc",
      sessionLimitMinutes: 10,
      kids: [],
    });
    expect(localStorage.getItem(STORAGE_KEY)).toContain("abc");
    expect(loadState().sessionLimitMinutes).toBe(10);
    clearState();
    expect(loadState().pinHash).toBe("");
  });
});
