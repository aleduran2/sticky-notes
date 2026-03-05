// NoteView represents a single sticky note. It handles its own drag, resize, and text editing interactions. To keep performance high, visual
// dragging uses CSS transforms and transient state; actual changes are committed via callbacks only when the pointer action ends.

import React, { useMemo, useRef, useState, useEffect } from "react";
import type { Note, Rect } from "../domain/types";
import { applyMinSize, moveRect, resizeRect } from "../domain/geometry";
import { MIN_SIZE } from "../domain/types";
import { TEXTS } from "../constants/text";

type Props = {
  note: Note;
  boardBounds: DOMRect | null;
  onBringToFront: (id: string) => void;
  onCommitRect: (id: string, rect: Rect) => void;
  onCommitText: (id: string, text: string) => void;
  onDragEndCheckTrash: (id: string, rect: Rect) => void;

  // Trash feedback: optional callback to inform parent of current rect during drag so the board can highlight the trash zone.
  onDraggingRect?: (rect: Rect | null) => void;
  isOverTrash?: boolean;
};

type DragMode = "none" | "move" | "resize";

export const NoteView = React.memo(function NoteView({
  note,
  boardBounds,
  onBringToFront,
  onCommitRect,
  onCommitText,
  onDragEndCheckTrash,
  onDraggingRect,
  isOverTrash,
}: Props) {
  const noteRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<DragMode>("none");

  const startPointer = useRef<{ x: number; y: number } | null>(null);
  const startRect = useRef<Rect | null>(null);

  // Rect “final” rect to commit at end of drag (updated during drag for trash feedback)
  const pendingRect = useRef<Rect | null>(null);

  const [dragging, setDragging] = useState(false);

  // Blur textarea when note changes
  useEffect(() => {
    if (noteRef.current?.querySelector("textarea") === document.activeElement) {
      (document.activeElement as HTMLTextAreaElement).blur();
    }
  }, [note.id]);

  const style = useMemo<React.CSSProperties>(() => {
    return {
      left: note.rect.x,
      top: note.rect.y,
      width: note.rect.w,
      height: note.rect.h,
      zIndex: note.zIndex,
      background: note.color,
    };
  }, [note.rect.x, note.rect.y, note.rect.w, note.rect.h, note.zIndex, note.color]);

  function setTransform(dx: number, dy: number) {
    // Apply a temporary transform during dragging; avoids re-rendering the
    // whole component on every mousemove event for better responsiveness
    if (!noteRef.current) return;
    noteRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  }

  function clearTransform() {
    if (!noteRef.current) return;
    noteRef.current.style.transform = "";
  }

  function beginPointer(e: React.PointerEvent, mode: DragMode) {
    if (!boardBounds) return;

    // Bring this note to the top of z-order as soon as interaction starts
    onBringToFront(note.id);
    modeRef.current = mode;

    startPointer.current = { x: e.clientX, y: e.clientY };
    startRect.current = note.rect;
    pendingRect.current = note.rect;

    noteRef.current?.setPointerCapture(e.pointerId);

    setDragging(true);
    e.preventDefault();
    e.stopPropagation();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!boardBounds) return;
    if (modeRef.current === "none") return;
    if (!startPointer.current || !startRect.current) return;

    const dx = e.clientX - startPointer.current.x;
    const dy = e.clientY - startPointer.current.y;

    if (modeRef.current === "move") {
      // Visual: transform only
      setTransform(dx, dy);

      // Logical rect for trash + commit at end
      const r = moveRect(startRect.current, dx, dy);
      pendingRect.current = r;
      onDraggingRect?.(r);
      return;
    }

    if (modeRef.current === "resize") {
      // For resize we can still do transform-less update (we need width/height to change)
      // We'll update via style width/height directly for smoothness
      const r = applyMinSize(resizeRect(startRect.current, dx, dy), MIN_SIZE);
      pendingRect.current = r;
      onDraggingRect?.(r);

      if (noteRef.current) {
        noteRef.current.style.width = `${r.w}px`;
        noteRef.current.style.height = `${r.h}px`;
      }
    }
  }

  function endPointer(e: React.PointerEvent) {
    if (modeRef.current === "none") return;

    const finalRect = pendingRect.current ?? note.rect;

    // Reset transient styles
    clearTransform();
    if (noteRef.current) {
      noteRef.current.style.width = "";
      noteRef.current.style.height = "";
    }

    modeRef.current = "none";
    startPointer.current = null;
    startRect.current = null;
    pendingRect.current = null;

    setDragging(false);
    onDraggingRect?.(null);

    // Commit + check trash at end
    onCommitRect(note.id, finalRect);
    onDragEndCheckTrash(note.id, finalRect);

    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div
      ref={noteRef}
      className={`note ${dragging ? "noteDragging" : ""} ${isOverTrash ? "noteOverTrash" : ""}`}
      style={style}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerDownCapture={() => onBringToFront(note.id)}
    >
      <div className="noteHeader" onPointerDown={(e) => beginPointer(e, "move")}>
        <span className="noteTitle">{TEXTS.NOTE_TITLE}</span>
        <span className="noteMeta">
          {Math.round(note.rect.w)}×{Math.round(note.rect.h)}
        </span>
      </div>

      <div className="noteBody">
        <textarea
          className="noteTextarea"
          placeholder={TEXTS.TEXTAREA_PLACEHOLDER}
          value={note.text}
          onChange={(e) => onCommitText(note.id, e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
        />
      </div>

      <div className="resizeHandle" onPointerDown={(e) => beginPointer(e, "resize")} />
    </div>
  );
});