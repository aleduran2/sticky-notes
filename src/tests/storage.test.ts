import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { loadState, saveState, clearState } from "../infra/storage";
import { CONFIG } from "../config/constants";
import type { NotesState } from "../domain/types";

// Mock localStorage to ensure consistent test behavior
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe("storage", () => {
  beforeEach(() => {
    // Reset mock storage before each test
    mockLocalStorage.clear();
    // Replace global localStorage with our mock
    Object.defineProperty(globalThis, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  describe("saveState", () => {
    it("saves state to localStorage", () => {
      const state: NotesState = {
        notes: [
          {
            id: "test-1",
            rect: { x: 10, y: 20, w: 200, h: 150 },
            text: "Test note",
            color: "#FFFF00",
            zIndex: 1,
            createdAt: 1000,
            updatedAt: 1000,
          },
        ],
        maxZ: 1,
      };

      saveState(state);

      const stored = localStorage.getItem("sticky_notes_v1");
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(state);
    });

    it("handles errors gracefully", () => {
      const state: NotesState = {
        notes: [],
        maxZ: 1,
      };

      // Mock localStorage to throw error
      const mockSetItem = vi.fn(() => {
        throw new Error("Storage full");
      });
      Object.defineProperty(globalThis, "localStorage", {
        value: { ...mockLocalStorage, setItem: mockSetItem },
        writable: true,
      });

      // Should not throw
      expect(() => saveState(state)).not.toThrow();

      // Restore mock
      Object.defineProperty(globalThis, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      });
    });
  });

  describe("loadState", () => {
    it("loads state from localStorage", () => {
      const state: NotesState = {
        notes: [
          {
            id: "test-1",
            rect: { x: 10, y: 20, w: 200, h: 150 },
            text: "Test note",
            color: "#FFFF00",
            zIndex: 1,
            createdAt: 1000,
            updatedAt: 1000,
          },
        ],
        maxZ: 1,
      };

      localStorage.setItem(CONFIG.STORAGE.KEY, JSON.stringify(state));

      const loaded = loadState();
      expect(loaded).toEqual(state);
    });

    it("returns null if no state is stored", () => {
      const loaded = loadState();
      expect(loaded).toBeNull();
    });

    it("returns null if stored data is invalid JSON", () => {
      localStorage.setItem(CONFIG.STORAGE.KEY, "invalid json {");

      const loaded = loadState();
      expect(loaded).toBeNull();
    });

    it("returns null if stored data doesn't have required structure", () => {
      localStorage.setItem(CONFIG.STORAGE.KEY, JSON.stringify({ invalid: "data" }));

      const loaded = loadState();
      expect(loaded).toBeNull();
    });

    it("returns null if notes is not an array", () => {
      localStorage.setItem(
        CONFIG.STORAGE.KEY,
        JSON.stringify({ notes: "not-an-array", maxZ: 1 })
      );

      const loaded = loadState();
      expect(loaded).toBeNull();
    });

    it("returns null if maxZ is not a number", () => {
      localStorage.setItem(
        CONFIG.STORAGE.KEY,
        JSON.stringify({ notes: [], maxZ: "not-a-number" })
      );

      const loaded = loadState();
      expect(loaded).toBeNull();
    });

    it("handles read errors gracefully", () => {
      const mockGetItem = vi.fn(() => {
        throw new Error("Read error");
      });
      Object.defineProperty(globalThis, "localStorage", {
        value: { ...mockLocalStorage, getItem: mockGetItem },
        writable: true,
      });

      const loaded = loadState();
      expect(loaded).toBeNull();

      // Restore mock
      Object.defineProperty(globalThis, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      });
    });
  });

  describe("clearState", () => {
    it("removes state from localStorage", () => {
      const state: NotesState = {
        notes: [],
        maxZ: 1,
      };

      localStorage.setItem(CONFIG.STORAGE.KEY, JSON.stringify(state));
      expect(localStorage.getItem(CONFIG.STORAGE.KEY)).toBeTruthy();

      clearState();

      expect(localStorage.getItem(CONFIG.STORAGE.KEY)).toBeNull();
    });

    it("handles errors gracefully", () => {
      const mockRemoveItem = vi.fn(() => {
        throw new Error("Remove error");
      });
      Object.defineProperty(globalThis, "localStorage", {
        value: { ...mockLocalStorage, removeItem: mockRemoveItem },
        writable: true,
      });

      // Should not throw
      expect(() => clearState()).not.toThrow();

      // Restore mock
      Object.defineProperty(globalThis, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      });
    });
  });

  describe("roundtrip", () => {
    it("can save and load state without loss", () => {
      const originalState: NotesState = {
        notes: [
          {
            id: "note-1",
            rect: { x: 100, y: 200, w: 300, h: 250 },
            text: "Important note",
            color: "#FF5733",
            zIndex: 5,
            createdAt: 1234567890,
            updatedAt: 1234567890,
          },
          {
            id: "note-2",
            rect: { x: 50, y: 75, w: 250, h: 200 },
            text: "Another note",
            color: "#33FF57",
            zIndex: 3,
            createdAt: 1234567900,
            updatedAt: 1234567900,
          },
        ],
        maxZ: 5,
      };

      saveState(originalState);
      const loaded = loadState();

      expect(loaded).toEqual(originalState);
    });
  });
});
