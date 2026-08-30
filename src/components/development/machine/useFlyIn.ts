import { useEffect, useRef, useState } from 'react';
import { SLOT_ORDER, type SlotType } from '../partTokens';

const FRAMES = 6;
const FRAME_MS = 45;

export type SlotSignature = Partial<Record<SlotType, string>>;

/**
 * Stepped fly-in animation state per slot.
 * Returns a progress value 0..1 in discrete frames so parts snap in like sprites.
 */
export const useFlyIn = (signature: SlotSignature) => {
  const prev = useRef<SlotSignature>({});
  const [frames, setFrames] = useState<Partial<Record<SlotType, number>>>({});
  const key = SLOT_ORDER.map((s) => signature[s] ?? '').join('|');

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const started: Partial<Record<SlotType, number>> = {};
    let changed = false;
    SLOT_ORDER.forEach((slot) => {
      const next = signature[slot];
      if (next && next !== prev.current[slot]) {
        started[slot] = reduced ? FRAMES : 0;
        changed = true;
      }
    });
    prev.current = { ...signature };
    if (changed) setFrames((f) => ({ ...f, ...started }));
    // signature is captured through `key`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    const running = SLOT_ORDER.some((s) => (frames[s] ?? FRAMES) < FRAMES);
    if (!running) return;
    const timer = window.setTimeout(() => {
      setFrames((f) => {
        const next = { ...f };
        SLOT_ORDER.forEach((s) => {
          const v = next[s];
          if (v !== undefined && v < FRAMES) next[s] = v + 1;
        });
        return next;
      });
    }, FRAME_MS);
    return () => window.clearTimeout(timer);
  }, [frames]);

  return (slot: SlotType) => (frames[slot] ?? FRAMES) / FRAMES;
};
