import { DEFAULT_STATE, type PersistedState } from "../types";

export const STORAGE_KEY = "home-keys-v1";

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE, kids: [] };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      kids: Array.isArray(parsed.kids) ? parsed.kids : [],
    };
  } catch {
    return { ...DEFAULT_STATE, kids: [] };
  }
}

export function saveState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
