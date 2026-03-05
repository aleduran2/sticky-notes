import { describe, it, expect, beforeEach } from "vitest";
import { notesReducer, createInitialState } from "../domain/reducer";
import type { NotesState, Rect } from "../domain/types";

describe("notesReducer", () => {
  let initialState: NotesState;

  beforeEach(() => {
    initialState = createInitialState();
  });

  describe("createInitialState", () => {
    it("creates empty notes array with maxZ=1", () => {
      expect(initialState.notes).toEqual([]);
      expect(initialState.maxZ).toBe(1);
    });
  });

  describe("NOTE_CREATE action", () => {
    it("creates a new note with provided rect", () => {
      const rect: Rect = { x: 10, y: 20, w: 200, h: 150 };
      const newState = notesReducer(initialState, {
        type: "NOTE_CREATE",
        payload: { rect },
      });

      expect(newState.notes).toHaveLength(1);
      expect(newState.notes[0].rect).toEqual(rect);
      expect(newState.notes[0].text).toBe("");
      expect(newState.notes[0].zIndex).toBe(2);
      expect(newState.maxZ).toBe(2);
    });

    it("assigns unique IDs to notes", () => {
      const rect: Rect = { x: 0, y: 0, w: 200, h: 150 };
      let state = initialState;

      state = notesReducer(state, {
        type: "NOTE_CREATE",
        payload: { rect },
      });

      state = notesReducer(state, {
        type: "NOTE_CREATE",
        payload: { rect },
      });

      const ids = state.notes.map((n) => n.id);
      expect(new Set(ids).size).toBe(2); // All unique
    });

    it("uses provided color or picks a default one", () => {
      const rect: Rect = { x: 0, y: 0, w: 200, h: 150 };

      const stateWithColor = notesReducer(initialState, {
        type: "NOTE_CREATE",
        payload: { rect, color: "#FF0000" },
      });

      expect(stateWithColor.notes[0].color).toBe("#FF0000");

      const stateWithoutColor = notesReducer(initialState, {
        type: "NOTE_CREATE",
        payload: { rect },
      });

      expect(stateWithoutColor.notes[0].color).toBeTruthy();
    });

    it("increments maxZ for each new note", () => {
      const rect: Rect = { x: 0, y: 0, w: 200, h: 150 };
      let state = initialState;

      state = notesReducer(state, {
        type: "NOTE_CREATE",
        payload: { rect },
      });
      expect(state.maxZ).toBe(2);

      state = notesReducer(state, {
        type: "NOTE_CREATE",
        payload: { rect },
      });
      expect(state.maxZ).toBe(3);
    });
  });

  describe("NOTE_UPDATE_RECT action", () => {
    it("updates rectangle of existing note", () => {
      const rect: Rect = { x: 10, y: 20, w: 200, h: 150 };
      let state = notesReducer(initialState, {
        type: "NOTE_CREATE",
        payload: { rect },
      });

      const noteId = state.notes[0].id;
      const newRect: Rect = { x: 50, y: 60, w: 300, h: 200 };

      state = notesReducer(state, {
        type: "NOTE_UPDATE_RECT",
        payload: { id: noteId, rect: newRect },
      });

      expect(state.notes[0].rect).toEqual(newRect);
    });

    it("does not affect other notes", () => {
      const rect: Rect = { x: 0, y: 0, w: 200, h: 150 };
      let state = initialState;

      state = notesReducer(state, {
        type: "NOTE_CREATE",
        payload: { rect },
      });
      state = notesReducer(state, {
        type: "NOTE_CREATE",
        payload: { rect },
      });

      const firstNoteId = state.notes[0].id;
      const secondNoteRect = state.notes[1].rect;

      const newRect: Rect = { x: 100, y: 100, w: 100, h: 100 };
      state = notesReducer(state, {
        type: "NOTE_UPDATE_RECT",
        payload: { id: firstNoteId, rect: newRect },
      });

      expect(state.notes[0].rect).toEqual(newRect);
      expect(state.notes[1].rect).toEqual(secondNoteRect);
    });
  });

  describe("NOTE_UPDATE_TEXT action", () => {
    it("updates text of existing note", () => {
      const rect: Rect = { x: 0, y: 0, w: 200, h: 150 };
      let state = notesReducer(initialState, {
        type: "NOTE_CREATE",
        payload: { rect },
      });

      const noteId = state.notes[0].id;
      const newText = "Hello, World!";

      state = notesReducer(state, {
        type: "NOTE_UPDATE_TEXT",
        payload: { id: noteId, text: newText },
      });

      expect(state.notes[0].text).toBe(newText);
    });
  });

  describe("NOTE_DELETE action", () => {
    it("removes note by id", () => {
      const rect: Rect = { x: 0, y: 0, w: 200, h: 150 };
      let state = initialState;

      state = notesReducer(state, {
        type: "NOTE_CREATE",
        payload: { rect },
      });
      state = notesReducer(state, {
        type: "NOTE_CREATE",
        payload: { rect },
      });

      expect(state.notes).toHaveLength(2);

      const firstNoteId = state.notes[0].id;
      state = notesReducer(state, {
        type: "NOTE_DELETE",
        payload: { id: firstNoteId },
      });

      expect(state.notes).toHaveLength(1);
      expect(state.notes[0].id).not.toBe(firstNoteId);
    });
  });

  describe("NOTE_BRING_TO_FRONT action", () => {
    it("updates zIndex of note and increments maxZ", () => {
      const rect: Rect = { x: 0, y: 0, w: 200, h: 150 };
      let state = initialState;

      state = notesReducer(state, {
        type: "NOTE_CREATE",
        payload: { rect },
      });
      state = notesReducer(state, {
        type: "NOTE_CREATE",
        payload: { rect },
      });

      const firstNoteId = state.notes[0].id;
      const initialMaxZ = state.maxZ;

      state = notesReducer(state, {
        type: "NOTE_BRING_TO_FRONT",
        payload: { id: firstNoteId },
      });

      expect(state.notes[0].zIndex).toBe(initialMaxZ + 1);
      expect(state.maxZ).toBe(initialMaxZ + 1);
    });
  });

  describe("NOTES_CLEAR action", () => {
    it("resets state to initial", () => {
      const rect: Rect = { x: 0, y: 0, w: 200, h: 150 };
      let state = initialState;

      state = notesReducer(state, {
        type: "NOTE_CREATE",
        payload: { rect },
      });
      state = notesReducer(state, {
        type: "NOTE_CREATE",
        payload: { rect },
      });

      expect(state.notes).toHaveLength(2);

      state = notesReducer(state, {
        type: "NOTES_CLEAR",
      });

      expect(state).toEqual(createInitialState());
    });
  });

  describe("NOTES_HYDRATE action", () => {
    it("replaces state with provided one", () => {
      const customState: NotesState = {
        notes: [
          {
            id: "test-1",
            rect: { x: 10, y: 20, w: 200, h: 150 },
            text: "Test note",
            color: "#FF0000",
            zIndex: 5,
            createdAt: 1000,
            updatedAt: 1000,
          },
        ],
        maxZ: 5,
      };

      const newState = notesReducer(initialState, {
        type: "NOTES_HYDRATE",
        payload: customState,
      });

      expect(newState).toEqual(customState);
    });
  });
});
