import { useCallback, useEffect, useRef } from "react";

type ThrottledFunction<T extends (...args: unknown[]) => unknown> = (
  ...args: Parameters<T>
) => void;

export function useRafThrottle<T extends (...args: unknown[]) => unknown>(
  fn: T
): ThrottledFunction<T> {
  const fnRef = useRef<T>(fn);
  const frame = useRef<number | null>(null);
  const lastArgs = useRef<unknown[] | null>(null);

  // Update the function ref when fn changes
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    return () => {
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return useCallback((...args: unknown[]) => {
    lastArgs.current = args;
    if (frame.current != null) return;

    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (lastArgs.current) fnRef.current(...lastArgs.current);
    });
  }, []) as ThrottledFunction<T>;
}