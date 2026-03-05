import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Note, Rect } from "../domain/types";
import { applyMinSize, normalizeRect, rectFromClient, intersects } from "../domain/geometry";
import { MIN_SIZE } from "../domain/types";
import { NoteView } from "./NoteView";
import { TrashZone } from "./TrashZone";

type Props = {
  notes: Note[];
  onCreateRect: (rect: Rect) => void;
  onCommitRect: (id: string, rect: Rect) => void;
  onCommitText: (id: string, text: string) => void;
  onBringToFront: (id: string) => void;
  onDelete: (id: string) => void;
};

export function Board({
  notes,
  onCreateRect,
  onCommitRect,
  onCommitText,
  onBringToFront,
  onDelete,
}: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null!);

  const [boardBounds, setBoardBounds] = useState<DOMRect | null>(null);
  const [ghost, setGhost] = useState<Rect | null>(null);
  const [trashActive, setTrashActive] = useState(false);

  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const drawing = useRef(false);

  const [overTrashNoteId, setOverTrashNoteId] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      if (!boardRef.current) return;
      setBoardBounds(boardRef.current.getBoundingClientRect());
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => a.zIndex - b.zIndex);
  }, [notes]);

  function isEmptyBoardPointerDown(target: EventTarget | null): boolean {
    // start drawing only if you clicked directly on board (not on a note)
    return target === boardRef.current;
  }

  function onBoardPointerDown(e: React.PointerEvent) {
    if (!boardBounds) return;
    if (!isEmptyBoardPointerDown(e.target)) return;

    drawing.current = true;
    startPoint.current = rectFromClient(e.clientX, e.clientY, boardBounds);

    setGhost({ x: startPoint.current.x, y: startPoint.current.y, w: 1, h: 1 });

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function onBoardPointerMove(e: React.PointerEvent) {
    if (!boardBounds) return;
    if (!drawing.current || !startPoint.current) return;

    const current = rectFromClient(e.clientX, e.clientY, boardBounds);
    const rect = normalizeRect(startPoint.current, current);
    setGhost(rect);
    e.preventDefault();
  }

  function onBoardPointerUp(e: React.PointerEvent) {
    if (!drawing.current) return;
    drawing.current = false;

    const r = ghost;
    setGhost(null);
    startPoint.current = null;

    if (!r) return;

    const normalized = applyMinSize(r, MIN_SIZE);
    // If user just clicked (very small box), create a default note
    if (normalized.w <= MIN_SIZE && normalized.h <= MIN_SIZE) {
      onCreateRect(applyMinSize({ x: normalized.x, y: normalized.y, w: 220, h: 160 }, MIN_SIZE));
    } else {
      onCreateRect(normalized);
    }

    e.preventDefault();
  }

  function trashRectInBoardCoords(): Rect | null {
    if (!boardBounds || !trashRef.current) return null;
    const t = trashRef.current.getBoundingClientRect();
    return {
      x: t.left - boardBounds.left,
      y: t.top - boardBounds.top,
      w: t.width,
      h: t.height,
    };
  }

  function checkTrash(id: string, rect: Rect) {
    const tRect = trashRectInBoardCoords();
    if (!tRect) return;
    const hit = intersects(rect, tRect);
    if (hit) onDelete(id);
  }

  // optional: visual feedback while moving/resizing
  function setTrashHoverFromRect(rect: Rect | null, noteId?: string) {
    const tRect = trashRectInBoardCoords();
    if (!tRect || !rect) {
      setTrashActive(false);
      setOverTrashNoteId(null);
      return;
    }
    const hit = intersects(rect, tRect);
    setTrashActive(hit);
    setOverTrashNoteId(hit ? noteId ?? null : null);
  }

  return (
    <div
      ref={boardRef}
      className="board"
      onPointerDown={onBoardPointerDown}
      onPointerMove={onBoardPointerMove}
      onPointerUp={onBoardPointerUp}
      onPointerCancel={onBoardPointerUp}
    >
      {ghost && (
        <div
          className="ghostRect"
          style={{ left: ghost.x, top: ghost.y, width: ghost.w, height: ghost.h }}
        />
      )}

      {sortedNotes.map((n) => (
        <NoteView
          key={n.id}
          note={n}
          boardBounds={boardBounds}
          onBringToFront={onBringToFront}
          onCommitRect={(id, rect) => {
            onCommitRect(id, rect);
            setTrashHoverFromRect(null);
          }}
          onCommitText={onCommitText}
          onDragEndCheckTrash={(id, rect) => checkTrash(id, rect)}
          onDraggingRect={(r) => setTrashHoverFromRect(r, n.id)}
          isOverTrash={overTrashNoteId === n.id}
        />
      ))}

      <TrashZone active={trashActive} trashRef={trashRef} />
    </div>
  );
}