import { describe, expect, it } from "vitest";
import { hashPin, isValidPin, verifyPin } from "./pin";

describe("parent PIN", () => {
  it("accepts only four digits", () => {
    expect(isValidPin("1234")).toBe(true);
    expect(isValidPin("12")).toBe(false);
    expect(isValidPin("abcd")).toBe(false);
  });

  it("hashes and verifies", async () => {
    const hash = await hashPin("2468");
    expect(hash).not.toContain("2468");
    expect(await verifyPin("2468", hash)).toBe(true);
    expect(await verifyPin("0000", hash)).toBe(false);
  });
});
