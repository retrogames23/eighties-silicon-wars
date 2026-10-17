// Tiny synthesized 8-bit sound effects (Web Audio, no files).
// Respects the same on/off preference as the music toggle.
import { STORAGE_KEYS } from '@/lib/constants';

type Note = { f: number; d: number; t?: OscillatorType };
let ctx: AudioContext | null = null;

const enabled = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEYS.MUSIC_ENABLED) !== 'false';
  } catch {
    return true;
  }
};

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
};

const play = (notes: Note[], volume = 0.06) => {
  if (!enabled()) return;
  const ac = getCtx();
  if (!ac) return;
  let at = ac.currentTime;
  for (const n of notes) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = n.t ?? 'square';
    osc.frequency.setValueAtTime(n.f, at);
    gain.gain.setValueAtTime(volume, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + n.d);
    osc.connect(gain).connect(ac.destination);
    osc.start(at);
    osc.stop(at + n.d);
    at += n.d * 0.9;
  }
};

export const sfx = {
  click: () => play([{ f: 1320, d: 0.05 }], 0.04),
  turn: () => play([{ f: 523, d: 0.09 }, { f: 659, d: 0.09 }, { f: 784, d: 0.16 }]),
  success: () => play([{ f: 523, d: 0.1 }, { f: 659, d: 0.1 }, { f: 784, d: 0.1 }, { f: 1047, d: 0.25 }]),
  warning: () => play([{ f: 180, d: 0.18, t: 'sawtooth' }, { f: 140, d: 0.25, t: 'sawtooth' }], 0.05),
};
