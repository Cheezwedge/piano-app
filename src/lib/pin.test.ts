import { describe, expect, it } from "vitest";
import {
  applyFailedPinAttempt,
  createPinRecord,
  derivePinHash,
  INSECURE_PIN_MESSAGE,
  InsecurePinError,
  isUnlockWindowOpen,
  isValidPin,
  legacyHashPin,
  lockoutMs,
  mismatchMessage,
  PIN_KDF,
  PIN_MAX_ATTEMPTS,
  PIN_UNLOCK_MS,
  requirePinSubtle,
  savePinErrorMessage,
  verifyPin,
} from "./pin";

describe("parent PIN", () => {
  it("accepts 4 to 6 digits", () => {
    expect(isValidPin("1234")).toBe(true);
    expect(isValidPin("123456")).toBe(true);
    expect(isValidPin("12")).toBe(false);
    expect(isValidPin("1234567")).toBe(false);
    expect(isValidPin("abcd")).toBe(false);
  });

  it("derives a salted hash that verifies", async () => {
    const first = await createPinRecord("2468");
    const second = await createPinRecord("2468");
    expect(first.pinKdf).toBe(PIN_KDF);
    expect(first.pinHash).not.toContain("2468");
    expect(first.pinSalt).not.toBe(second.pinSalt);
    expect(first.pinHash).not.toBe(second.pinHash);
    expect(await verifyPin("2468", first)).toBe(true);
    expect(await verifyPin("0000", first)).toBe(false);
  });

  it("tells Save PIN to open https when crypto.subtle is missing and does not hash", async () => {
    expect(() => requirePinSubtle(undefined)).toThrow(InsecurePinError);
    expect(savePinErrorMessage(new InsecurePinError())).toBe(INSECURE_PIN_MESSAGE);
    expect(INSECURE_PIN_MESSAGE).toMatch(/https/);

    const cryptoObj = globalThis.crypto;
    const descriptor = Object.getOwnPropertyDescriptor(cryptoObj, "subtle");
    Object.defineProperty(cryptoObj, "subtle", {
      configurable: true,
      get() {
        return undefined;
      },
    });
    try {
      await expect(createPinRecord("2468")).rejects.toBeInstanceOf(InsecurePinError);
      await expect(createPinRecord("2468")).rejects.toThrow(/https/);
      await expect(derivePinHash("2468", "ab".repeat(16))).rejects.toBeInstanceOf(InsecurePinError);
      await expect(legacyHashPin("2468")).rejects.toBeInstanceOf(InsecurePinError);
    } finally {
      if (descriptor) Object.defineProperty(cryptoObj, "subtle", descriptor);
      else delete (cryptoObj as { subtle?: SubtleCrypto }).subtle;
    }
  });

  it("hashes 5 and 6 digit PINs", async () => {
    const five = await createPinRecord("13579");
    const six = await createPinRecord("246810");
    expect(await verifyPin("13579", five)).toBe(true);
    expect(await verifyPin("246810", six)).toBe(true);
    expect(await verifyPin("1357", five)).toBe(false);
  });

  it("still verifies a legacy unsalted hash", async () => {
    const pinHash = await legacyHashPin("1357");
    expect(await verifyPin("1357", { pinHash })).toBe(true);
    expect(await verifyPin("0000", { pinHash })).toBe(false);
  });

  it("locks after repeated failures", () => {
    expect(lockoutMs(PIN_MAX_ATTEMPTS - 1)).toBe(0);
    expect(lockoutMs(PIN_MAX_ATTEMPTS)).toBe(30_000);
    expect(lockoutMs(PIN_MAX_ATTEMPTS + 1)).toBe(60_000);
    const now = 1_000_000;
    const locked = applyFailedPinAttempt(PIN_MAX_ATTEMPTS - 1, now);
    expect(locked.pinFailedAttempts).toBe(PIN_MAX_ATTEMPTS);
    expect(locked.pinLockedUntil).toBe(now + 30_000);
    expect(mismatchMessage(3)).toContain("2 tries left");
  });

  it("treats the unlock window as open only before it expires", () => {
    const now = 10_000;
    expect(isUnlockWindowOpen(now + PIN_UNLOCK_MS, now)).toBe(true);
    expect(isUnlockWindowOpen(now, now)).toBe(false);
  });
});
