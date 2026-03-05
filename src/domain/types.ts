export type NoteId = string;

export type Point = { x: number; y: number };

export type Rect = { x: number; y: number; w: number; h: number };

export type Note = {
  id: NoteId;
  rect: Rect;
  zIndex: number;
  color: string;
  text: string;
  createdAt: number;
  updatedAt: number;
};

export type NotesState = {
  notes: Note[];
  maxZ: number;
};

export const MIN_SIZE = 80;

export const NOTE_COLORS = [
  "#FFE58A",
  "#B7F7D1",
  "#B8E1FF",
  "#F4B6FF",
  "#FFC1A1",
] as const;

export type NoteColor = (typeof NOTE_COLORS)[number];