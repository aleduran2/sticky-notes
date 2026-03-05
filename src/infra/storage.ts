// Simple persistence wrapper around browser localStorage. Serialize the notes state and perform basic validation when
// deserializing to avoid corrupted data. The module is resilient to failures by swallowing exceptions.

import type { NotesState } from "../domain/types";
import { CONFIG } from "../config/constants";

export function loadState(): NotesState | null {
  // Attempt to read from localStorage; return null if anything goes wrong
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE.KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NotesState;
    if (!parsed || !Array.isArray(parsed.notes) || typeof parsed.maxZ !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: NotesState): void {
  // Serialize current state; failures are safe to ignore because persistence is merely a convenience
  try {
    localStorage.setItem(CONFIG.STORAGE.KEY, JSON.stringify(state));
  } catch {
    // ignore (storage full / disabled)
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(CONFIG.STORAGE.KEY);
  } catch {
    // ignore
  }
}