// Reducer and state utilities for note management. This mimics a
// lightweight Redux-style approach using useReducer. Actions capture
// all mutations allowing easy testing and time-travel if needed.

import type { Note, NotesState, Rect, NoteId } from "./types";
import { NOTE_COLORS } from "./types";

export type NotesAction =
  | { type: "NOTES_HYDRATE"; payload: NotesState }
  | { type: "NOTE_CREATE"; payload: { rect: Rect; color?: string } }
  | { type: "NOTE_UPDATE_RECT"; payload: { id: NoteId; rect: Rect } }
  | { type: "NOTE_UPDATE_TEXT"; payload: { id: NoteId; text: string } }
  | { type: "NOTE_DELETE"; payload: { id: NoteId } }
  | { type: "NOTE_BRING_TO_FRONT"; payload: { id: NoteId } }
  | { type: "NOTES_CLEAR" };

export function createInitialState(): NotesState {
  // Produce a fresh state with no notes and z-index counter starting at 1
  return { notes: [], maxZ: 1 };
}

function genId(): string {
  // Simple unique id generator combining timestamp with random fraction
  return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function now(): number {
  return Date.now();
}

function pickColor(): string {
  return NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
}

export function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case "NOTES_HYDRATE":
      // Replace entire state, used on startup when restoring from storage
      return action.payload;

    case "NOTE_CREATE": {
      // Generate a new note based on payload rect and optional color.
      // assign unique id, timestamp, and bump maxZ so newer notes float above.
      const ts = now();
      const id = genId();
      const z = state.maxZ + 1;
      const note: Note = {
        id,
        rect: action.payload.rect,
        zIndex: z,
        color: action.payload.color ?? pickColor(),
        text: "",
        createdAt: ts,
        updatedAt: ts,
      };
      return { notes: [...state.notes, note], maxZ: z };
    }

    case "NOTE_UPDATE_RECT": {
      // Update a note's rectangle coordinates; keep timestamp for ordering
      const ts = now();
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.payload.id
            ? { ...n, rect: action.payload.rect, updatedAt: ts }
            : n
        ),
      };
    }

    case "NOTE_UPDATE_TEXT": {
      // Update note text
      const ts = now();
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.payload.id
            ? { ...n, text: action.payload.text, updatedAt: ts }
            : n
        ),
      };
    }

    case "NOTE_DELETE":
      // Remove by id
      return { ...state, notes: state.notes.filter((n) => n.id !== action.payload.id) };

    case "NOTE_BRING_TO_FRONT": {
      // Increase zIndex of a note so it renders above others; also bump maxZ
      const z = state.maxZ + 1;
      return {
        notes: state.notes.map((n) =>
          n.id === action.payload.id ? { ...n, zIndex: z } : n
        ),
        maxZ: z,
      };
    }

    case "NOTES_CLEAR":
      // Wipe everything (used by toolbar clear button)
      return createInitialState();

    default:
      // Unrecognized action: return state unchanged
      return state;
  }
}