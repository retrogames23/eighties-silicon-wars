import { useState, useRef, useEffect, useCallback } from 'react';
import midnightSaveFile from '@/assets/Midnight_Save_File.mp3.asset.json';

type Track = { src: string; title: string };

const PLAYLIST: Track[] = [
  { src: '/audio/Neon_Dreams.mp3', title: 'Neon Dreams' },
  { src: '/audio/Virtual_Dreamscape.mp3', title: 'Virtual Dreamscape' },
  { src: '/audio/Digital_Dreamscape.mp3', title: 'Digital Dreamscape' },
  { src: midnightSaveFile.url, title: 'Midnight Save File' },
];


const TARGET_VOLUME = 0.3;
const FADE_MS = 1200;

type AudioStore = {
  audio: HTMLAudioElement;
  enabled: boolean;
  trackIndex: number;
  listenerAttached: boolean;
  fadeRaf: number | null;
};

type WindowWithStore = Window & { __APP_AUDIO_STORE__?: AudioStore };

const getAudioStore = (): AudioStore => {
  const w = window as WindowWithStore;
  if (!w.__APP_AUDIO_STORE__) {
    const audio = new Audio(PLAYLIST[0].src);
    audio.volume = 0;
    audio.loop = false;
    w.__APP_AUDIO_STORE__ = {
      audio,
      enabled: false,
      trackIndex: 0,
      listenerAttached: false,
      fadeRaf: null,
    };
    console.log('Audio store initialized');
  }
  return w.__APP_AUDIO_STORE__;
};

const fadeTo = (
  store: AudioStore,
  target: number,
  duration = FADE_MS,
  onDone?: () => void,
) => {
  if (store.fadeRaf !== null) cancelAnimationFrame(store.fadeRaf);
  const startVol = store.audio.volume;
  const t0 = performance.now();
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / duration);
    // Smooth ease-in-out
    const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    store.audio.volume = Math.max(0, Math.min(1, startVol + (target - startVol) * eased));
    if (k < 1) {
      store.fadeRaf = requestAnimationFrame(step);
    } else {
      store.fadeRaf = null;
      onDone?.();
    }
  };
  store.fadeRaf = requestAnimationFrame(step);
};

const swapTrack = (store: AudioStore, nextIndex: number, onTrack: (i: number) => void) => {
  fadeTo(store, 0, FADE_MS, () => {
    store.trackIndex = nextIndex;
    store.audio.src = PLAYLIST[nextIndex].src;
    store.audio.currentTime = 0;
    if (!store.enabled) return;
    store.audio
      .play()
      .then(() => {
        onTrack(nextIndex);
        fadeTo(store, TARGET_VOLUME);
      })
      .catch((err) => console.error('Failed to play next track:', err));
  });
};

export const useAudioManager = () => {
  const storeRef = useRef<AudioStore | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  // Initialize once per app (singleton)
  useEffect(() => {
    const store = getAudioStore();
    storeRef.current = store;
    setIsEnabled(store.enabled);
    setCurrentTrack(store.trackIndex);

    if (!store.listenerAttached) {
      const handleTrackEnd = () => {
        if (!store.enabled) return;
        const nextIndex = (store.trackIndex + 1) % PLAYLIST.length;
        swapTrack(store, nextIndex, (i) => setCurrentTrack(i));
      };
      store.audio.addEventListener('ended', handleTrackEnd);
      store.listenerAttached = true;
    }
    // Do not tear down on unmount to avoid HMR double-audio issues
  }, []);

  // Reflect external store changes
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = storeRef.current || getAudioStore();
      if (s.enabled !== isEnabled) setIsEnabled(s.enabled);
      if (s.trackIndex !== currentTrack) setCurrentTrack(s.trackIndex);
    }, 500);
    return () => window.clearInterval(id);
  }, [isEnabled, currentTrack]);

  const toggleMusic = useCallback(() => {
    const store = storeRef.current || getAudioStore();

    if (store.enabled) {
      // Fade out then pause
      store.enabled = false;
      setIsEnabled(false);
      fadeTo(store, 0, FADE_MS, () => {
        try { store.audio.pause(); } catch { /* ignore */ }
      });
    } else {
      store.enabled = true;
      if (!store.audio.src) store.audio.src = PLAYLIST[store.trackIndex].src;
      store.audio.volume = 0;
      store.audio
        .play()
        .then(() => {
          setIsEnabled(true);
          setCurrentTrack(store.trackIndex);
          fadeTo(store, TARGET_VOLUME);
        })
        .catch((err) => {
          store.enabled = false;
          setIsEnabled(false);
          console.error('Failed to start music:', err);
        });
    }
  }, []);

  const goToTrack = useCallback((offset: number) => {
    const store = storeRef.current || getAudioStore();
    const nextIndex = (store.trackIndex + offset + PLAYLIST.length) % PLAYLIST.length;
    if (!store.enabled) {
      // Just preload silently
      store.trackIndex = nextIndex;
      store.audio.src = PLAYLIST[nextIndex].src;
      store.audio.currentTime = 0;
      setCurrentTrack(nextIndex);
      return;
    }
    swapTrack(store, nextIndex, (i) => setCurrentTrack(i));
  }, []);

  const nextTrack = useCallback(() => goToTrack(1), [goToTrack]);
  const prevTrack = useCallback(() => goToTrack(-1), [goToTrack]);

  return {
    isEnabled,
    isPlaying: isEnabled && !(storeRef.current?.audio.paused ?? true),
    currentTrack: PLAYLIST[currentTrack].src,
    currentTrackTitle: PLAYLIST[currentTrack].title,
    trackIndex: currentTrack,
    trackCount: PLAYLIST.length,
    toggleMusic,
    nextTrack,
    prevTrack,
  };
};
