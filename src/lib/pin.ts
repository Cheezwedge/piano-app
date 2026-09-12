export const PIN_MAX_ATTEMPTS = 5;
export const PIN_UNLOCK_MS = 2 * 60 * 1000;
export const PBKDF2_ITERATIONS = 100_000;
export const PIN_KDF = "pbkdf2-sha256-100000";

const LEGACY_PREFIX = "home-keys-pin-v1:";

export type PinResult =
  | { ok: true }
  | { ok: false; reason: "mismatch" | "locked" | "invalid"; message: string };

export interface PinRecord {
  pinHash: string;
  pinSalt: string;
  pinKdf: string;
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function toHex(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(view)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.trim();
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function lockoutMs(failedAttempts: number): number {
  if (failedAttempts < PIN_MAX_ATTEMPTS) return 0;
  const extra = Math.min(failedAttempts - PIN_MAX_ATTEMPTS, 3);
  return 30_000 * 2 ** extra;
}

export function nextLockoutUntil(failedAttempts: number, now: number): number {
  const ms = lockoutMs(failedAttempts);
  return ms > 0 ? now + ms : 0;
}

export function remainingAttempts(failedAttempts: number): number {
  return Math.max(0, PIN_MAX_ATTEMPTS - failedAttempts);
}

export function formatLockRemaining(lockedUntil: number, now: number): string {
  const total = Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function applyFailedPinAttempt(failedAttempts: number, now: number) {
  const next = failedAttempts + 1;
  return {
    pinFailedAttempts: next,
    pinLockedUntil: nextLockoutUntil(next, now),
  };
}

export function lockoutMessage(lockedUntil: number, now: number): string {
  return `Too many tries. Wait ${formatLockRemaining(lockedUntil, now)}.`;
}

export function mismatchMessage(failedAttemptsAfter: number): string {
  const left = remainingAttempts(failedAttemptsAfter);
  if (left <= 0) return "That PIN does not match. PIN pad is pausing.";
  return `That PIN does not match. ${left} ${left === 1 ? "try" : "tries"} left.`;
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

export async function legacyHashPin(pin: string): Promise<string> {
  if (!isValidPin(pin)) throw new Error("PIN must be 4 digits");
  return sha256Hex(LEGACY_PREFIX + pin);
}

export async function derivePinHash(pin: string, saltHex: string): Promise<string> {
  if (!isValidPin(pin)) throw new Error("PIN must be 4 digits");
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: fromHex(saltHex) as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  return toHex(bits);
}

export async function createPinRecord(pin: string): Promise<PinRecord> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const pinSalt = toHex(salt);
  const pinHash = await derivePinHash(pin, pinSalt);
  return { pinHash, pinSalt, pinKdf: PIN_KDF };
}

export async function verifyPin(
  pin: string,
  record: { pinHash: string; pinSalt?: string; pinKdf?: string },
): Promise<boolean> {
  if (!isValidPin(pin) || !record.pinHash) return false;
  if (record.pinSalt) {
    const next = await derivePinHash(pin, record.pinSalt);
    return next === record.pinHash;
  }
  const legacy = await legacyHashPin(pin);
  return legacy === record.pinHash;
}

/** @deprecated kept for older tests that hash without salt */
export async function hashPin(pin: string): Promise<string> {
  return legacyHashPin(pin);
}

export function isUnlockWindowOpen(unlockedUntil: number, now = Date.now()): boolean {
  return unlockedUntil > now;
}
