import { useEffect, useRef } from "react";

export function useRafThrottle<T extends (...args: any[]) => void>(fn: T): T {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const frame = useRef<number | null>(null);
  const lastArgs = useRef<any[] | null>(null);

  useEffect(() => {
    return () => {
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, []);

  const throttled = ((...args: any[]) => {
    lastArgs.current = args;
    if (frame.current != null) return;

    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (lastArgs.current) fnRef.current(...lastArgs.current);
    });
  }) as T;

  return throttled;
}