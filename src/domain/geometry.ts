import type { Point, Rect } from "./types";
import { MIN_SIZE } from "./types";

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function normalizeRect(a: Point, b: Point): Rect {
  const x1 = Math.min(a.x, b.x);
  const y1 = Math.min(a.y, b.y);
  const x2 = Math.max(a.x, b.x);
  const y2 = Math.max(a.y, b.y);
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

export function applyMinSize(rect: Rect, minSize = MIN_SIZE): Rect {
  return {
    ...rect,
    w: Math.max(minSize, rect.w),
    h: Math.max(minSize, rect.h),
  };
}

export function rectFromClient(
  clientX: number,
  clientY: number,
  boardBounds: DOMRect
): Point {
  return { x: clientX - boardBounds.left, y: clientY - boardBounds.top };
}

export function intersects(a: Rect, b: Rect): boolean {
  return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  );
}

export function moveRect(rect: Rect, dx: number, dy: number): Rect {
  return { ...rect, x: rect.x + dx, y: rect.y + dy };
}

export function resizeRect(rect: Rect, dw: number, dh: number): Rect {
  return { ...rect, w: rect.w + dw, h: rect.h + dh };
}