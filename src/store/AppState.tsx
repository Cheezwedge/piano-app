import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadState, saveState } from "../lib/storage";
import {
  applyFailedPinAttempt,
  createPinRecord,
  isUnlockWindowOpen,
  lockoutMessage,
  mismatchMessage,
  PIN_UNLOCK_MS,
  verifyPin,
  type PinResult,
} from "../lib/pin";
import {
  AVATARS,
  DEFAULT_STATE,
  type KidProfile,
  type PersistedState,
  type Screen,
} from "../types";

interface AppContextValue {
  persist: PersistedState;
  screen: Screen;
  setScreen: (screen: Screen) => void;
  sessionStartedAt: number | null;
  beginSession: () => void;
  extendSession: () => void;
  pinUnlockedUntil: number;
  isParentUnlocked: () => boolean;
  unlockParent: () => void;
  setPin: (pin: string) => Promise<void>;
  checkPin: (pin: string) => Promise<PinResult>;
  addKid: (name: string, avatar: string) => void;
  removeKid: (id: string) => void;
  setActiveKid: (id: string) => void;
  markLesson1Complete: () => void;
  updateSettings: (patch: Partial<Pick<PersistedState, "sessionLimitMinutes" | "showFingerNumbers" | "calibrationCents">>) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function persistNow(next: PersistedState) {
  saveState(next);
  return next;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [persist, setPersist] = useState<PersistedState>(() => loadState());
  const [screen, setScreen] = useState<Screen>(() =>
    loadState().pinHash ? "home" : "welcome",
  );
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [pinUnlockedUntil, setPinUnlockedUntil] = useState(0);

  const update = useCallback((recipe: (prev: PersistedState) => PersistedState) => {
    setPersist((prev) => persistNow(recipe(prev)));
  }, []);

  useEffect(() => {
    if (persist.pinHash && persist.activeKidId && sessionStartedAt == null) {
      setSessionStartedAt(Date.now());
    }
  }, [persist.pinHash, persist.activeKidId, sessionStartedAt]);

  const setPin = useCallback(async (pin: string) => {
    const record = await createPinRecord(pin);
    update((prev) => ({
      ...prev,
      ...record,
      pinFailedAttempts: 0,
      pinLockedUntil: 0,
    }));
    setPinUnlockedUntil(Date.now() + PIN_UNLOCK_MS);
  }, [update]);

  const unlockParent = useCallback(() => {
    setPinUnlockedUntil(Date.now() + PIN_UNLOCK_MS);
  }, []);

  const isParentUnlocked = useCallback(
    () => isUnlockWindowOpen(pinUnlockedUntil),
    [pinUnlockedUntil],
  );

  const checkPin = useCallback(
    async (pin: string): Promise<PinResult> => {
      const now = Date.now();
      if (persist.pinLockedUntil > now) {
        return { ok: false, reason: "locked", message: lockoutMessage(persist.pinLockedUntil, now) };
      }

      const ok = await verifyPin(pin, persist);
      if (ok) {
        const needsUpgrade = !persist.pinSalt;
        if (needsUpgrade) {
          const record = await createPinRecord(pin);
          update((prev) => ({
            ...prev,
            ...record,
            pinFailedAttempts: 0,
            pinLockedUntil: 0,
          }));
        } else {
          update((prev) => ({ ...prev, pinFailedAttempts: 0, pinLockedUntil: 0 }));
        }
        setPinUnlockedUntil(now + PIN_UNLOCK_MS);
        return { ok: true };
      }

      const next = applyFailedPinAttempt(persist.pinFailedAttempts, now);
      update((prev) => ({ ...prev, ...next }));
      if (next.pinLockedUntil > now) {
        return { ok: false, reason: "locked", message: lockoutMessage(next.pinLockedUntil, now) };
      }
      return { ok: false, reason: "mismatch", message: mismatchMessage(next.pinFailedAttempts) };
    },
    [persist, update],
  );

  const addKid = useCallback(
    (name: string, avatar: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const kid: KidProfile = {
        id: crypto.randomUUID(),
        name: trimmed.slice(0, 18),
        avatar: AVATARS.includes(avatar as (typeof AVATARS)[number]) ? avatar : AVATARS[0],
        createdAt: new Date().toISOString(),
        lesson1Complete: false,
      };
      update((prev) => ({
        ...prev,
        kids: [...prev.kids, kid],
        activeKidId: prev.activeKidId ?? kid.id,
      }));
    },
    [update],
  );

  const removeKid = useCallback(
    (id: string) => {
      update((prev) => {
        const kids = prev.kids.filter((kid) => kid.id !== id);
        return {
          ...prev,
          kids,
          activeKidId: prev.activeKidId === id ? (kids[0]?.id ?? null) : prev.activeKidId,
        };
      });
    },
    [update],
  );

  const setActiveKid = useCallback(
    (id: string) => {
      update((prev) => ({ ...prev, activeKidId: id }));
      setSessionStartedAt(Date.now());
    },
    [update],
  );

  const markLesson1Complete = useCallback(() => {
    update((prev) => ({
      ...prev,
      kids: prev.kids.map((kid) =>
        kid.id === prev.activeKidId ? { ...kid, lesson1Complete: true } : kid,
      ),
    }));
  }, [update]);

  const updateSettings = useCallback(
    (patch: Partial<Pick<PersistedState, "sessionLimitMinutes" | "showFingerNumbers" | "calibrationCents">>) => {
      update((prev) => ({ ...prev, ...patch }));
    },
    [update],
  );

  const resetAll = useCallback(() => {
    setPersist(persistNow({ ...DEFAULT_STATE, kids: [] }));
    setScreen("welcome");
    setSessionStartedAt(null);
    setPinUnlockedUntil(0);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      persist,
      screen,
      setScreen,
      sessionStartedAt,
      beginSession: () => setSessionStartedAt(Date.now()),
      extendSession: () => setSessionStartedAt(Date.now()),
      pinUnlockedUntil,
      isParentUnlocked,
      unlockParent,
      setPin,
      checkPin,
      addKid,
      removeKid,
      setActiveKid,
      markLesson1Complete,
      updateSettings,
      resetAll,
    }),
    [
      persist,
      screen,
      sessionStartedAt,
      pinUnlockedUntil,
      isParentUnlocked,
      unlockParent,
      setPin,
      checkPin,
      addKid,
      removeKid,
      setActiveKid,
      markLesson1Complete,
      updateSettings,
      resetAll,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}

export function useActiveKid(): KidProfile | null {
  const { persist } = useApp();
  return persist.kids.find((kid) => kid.id === persist.activeKidId) ?? persist.kids[0] ?? null;
}
