import { useState, useRef, useEffect, useCallback } from 'react';
import midnightSaveFile from '@/assets/Midnight_Save_File.mp3.asset.json';
import { STORAGE_KEYS } from '@/lib/constants';

type Track = { src: string; title: string };

const PLAYLIST: Track[] = [
  { src: '/audio/Neon_Dreams.mp3', title: 'Neon Dreams' },
  { src: '/audio/Virtual_Dreamscape.mp3', title: 'Virtual Dreamscape' },
  { src: '/audio/Digital_Dreamscape.mp3', title: 'Digital Dreamscape' },
  { src: midnightSaveFile.url, title: 'Midnight Save File' },
];

const TARGET_VOLUME = 0.3;
const FADE_MS = 2500;
const CROSSFADE_LEAD_S = 3.5; // start next track this many seconds before the end

const readEnabledPreference = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MUSIC_ENABLED);
    if (raw === null) return true; // first ever visit → music on
    return raw === 'true';
  } catch {
    return true;
  }
};

const writeEnabledPreference = (value: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MUSIC_ENABLED, String(value));
  } catch {
    /* ignore */
  }
};

type Deck = {
  audio: HTMLAudioElement;
  fadeRaf: number | null;
};

type AudioStore = {
  decks: [Deck, Deck];
  active: 0 | 1;
  enabled: boolean;
  trackIndex: number;
  listenerAttached: boolean;
  crossfading: boolean;
  onTrackChange: ((i: number) => void) | null;
};

type WindowWithStore = Window & { __APP_AUDIO_STORE__?: AudioStore };

const makeDeck = (): Deck => {
  const audio = new Audio();
  audio.volume = 0;
  audio.loop = false;
  audio.preload = 'auto';
  return { audio, fadeRaf: null };
};

const getAudioStore = (): AudioStore => {
  const w = window as WindowWithStore;
  if (!w.__APP_AUDIO_STORE__) {
    const decks: [Deck, Deck] = [makeDeck(), makeDeck()];
    decks[0].audio.src = PLAYLIST[0].src;
    w.__APP_AUDIO_STORE__ = {
      decks,
      active: 0,
      enabled: readEnabledPreference(),
      trackIndex: 0,
      listenerAttached: false,
      crossfading: false,
      onTrackChange: null,
    };
  }
  return w.__APP_AUDIO_STORE__;
};

const fadeDeck = (deck: Deck, target: number, duration = FADE_MS, onDone?: () => void) => {
  if (deck.fadeRaf !== null) cancelAnimationFrame(deck.fadeRaf);
  const startVol = deck.audio.volume;
  if (duration <= 0) {
    deck.audio.volume = target;
    onDone?.();
    return;
  }
  const t0 = performance.now();
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / duration);
    // equal-power curve keeps perceived loudness constant during crossfades
    const eased = Math.sin((k * Math.PI) / 2);
    deck.audio.volume = Math.max(0, Math.min(1, startVol + (target - startVol) * eased));
    if (k < 1) {
      deck.fadeRaf = requestAnimationFrame(step);
    } else {
      deck.fadeRaf = null;
      onDone?.();
    }
  };
  deck.fadeRaf = requestAnimationFrame(step);
};

const crossfadeTo = (store: AudioStore, nextIndex: number, duration = FADE_MS) => {
  if (store.crossfading) return;
  store.crossfading = true;

  const from = store.decks[store.active];
  const toIdx: 0 | 1 = store.active === 0 ? 1 : 0;
  const to = store.decks[toIdx];

  to.audio.src = PLAYLIST[nextIndex].src;
  to.audio.currentTime = 0;
  to.audio.volume = 0;

  const finish = () => {
    store.active = toIdx;
    store.trackIndex = nextIndex;
    store.onTrackChange?.(nextIndex);
    fadeDeck(from, 0, duration, () => {
      try {
        from.audio.pause();
      } catch {
        /* ignore */
      }
      store.crossfading = false;
    });
    fadeDeck(to, TARGET_VOLUME, duration);
  };

  to.audio
    .play()
    .then(finish)
    .catch(() => {
      // could not start next deck — fall back to a plain fade on the current deck
      store.crossfading = false;
    });
};

export const useAudioManager = () => {
  const storeRef = useRef<AudioStore | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  useEffect(() => {
    const store = getAudioStore();
    storeRef.current = store;
    setIsEnabled(store.enabled && !store.decks[store.active].audio.paused);
    setCurrentTrack(store.trackIndex);
    store.onTrackChange = (i) => setCurrentTrack(i);

    if (!store.listenerAttached) {
      store.listenerAttached = true;
      store.decks.forEach((deck, idx) => {
        // Start the crossfade shortly before the current track ends
        deck.audio.addEventListener('timeupdate', () => {
          if (!store.enabled || store.crossfading) return;
          if (store.decks[store.active] !== deck && idx !== store.active) return;
          const { duration, currentTime } = deck.audio;
          if (!Number.isFinite(duration) || duration <= 0) return;
          if (duration - currentTime <= CROSSFADE_LEAD_S) {
            crossfadeTo(store, (store.trackIndex + 1) % PLAYLIST.length);
          }
        });
        // Safety net if metadata was missing and the track just ended
        deck.audio.addEventListener('ended', () => {
          if (!store.enabled || store.crossfading) return;
          if (store.decks[store.active] !== deck) return;
          crossfadeTo(store, (store.trackIndex + 1) % PLAYLIST.length, 800);
        });
      });
    }

    // Autostart if the user (or the default) has music enabled
    if (store.enabled && store.decks[store.active].audio.paused) {
      const deck = store.decks[store.active];
      if (!deck.audio.src) deck.audio.src = PLAYLIST[store.trackIndex].src;
      deck.audio.volume = 0;
      deck.audio
        .play()
        .then(() => {
          setIsEnabled(true);
          fadeDeck(deck, TARGET_VOLUME);
        })
        .catch(() => {
          // Autoplay blocked — start on the first user interaction
          const resume = () => {
            const d = store.decks[store.active];
            if (!store.enabled || !d.audio.paused) return;
            d.audio.volume = 0;
            d.audio
              .play()
              .then(() => {
                setIsEnabled(true);
                fadeDeck(d, TARGET_VOLUME);
              })
              .catch(() => undefined);
          };
          window.addEventListener('pointerdown', resume, { once: true });
          window.addEventListener('keydown', resume, { once: true });
        });
    }

    return () => {
      if (store.onTrackChange) store.onTrackChange = null;
    };
  }, []);

  // Reflect external store changes
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = storeRef.current || getAudioStore();
      const playing = s.enabled && !s.decks[s.active].audio.paused;
      if (playing !== isEnabled) setIsEnabled(playing);
      if (s.trackIndex !== currentTrack) setCurrentTrack(s.trackIndex);
    }, 500);
    return () => window.clearInterval(id);
  }, [isEnabled, currentTrack]);

  const toggleMusic = useCallback(() => {
    const store = storeRef.current || getAudioStore();
    const deck = store.decks[store.active];

    if (store.enabled) {
      store.enabled = false;
      writeEnabledPreference(false);
      setIsEnabled(false);
      fadeDeck(deck, 0, FADE_MS, () => {
        try {
          deck.audio.pause();
        } catch {
          /* ignore */
        }
      });
    } else {
      store.enabled = true;
      writeEnabledPreference(true);
      if (!deck.audio.src) deck.audio.src = PLAYLIST[store.trackIndex].src;
      deck.audio.volume = 0;
      deck.audio
        .play()
        .then(() => {
          setIsEnabled(true);
          setCurrentTrack(store.trackIndex);
          fadeDeck(deck, TARGET_VOLUME);
        })
        .catch((err) => {
          store.enabled = false;
          writeEnabledPreference(false);
          setIsEnabled(false);
          console.error('Failed to start music:', err);
        });
    }
  }, []);

  const goToTrack = useCallback((offset: number) => {
    const store = storeRef.current || getAudioStore();
    const nextIndex = (store.trackIndex + offset + PLAYLIST.length) % PLAYLIST.length;
    if (!store.enabled) {
      store.trackIndex = nextIndex;
      const deck = store.decks[store.active];
      deck.audio.src = PLAYLIST[nextIndex].src;
      deck.audio.currentTime = 0;
      setCurrentTrack(nextIndex);
      return;
    }
    crossfadeTo(store, nextIndex, 1200);
  }, []);

  const nextTrack = useCallback(() => goToTrack(1), [goToTrack]);
  const prevTrack = useCallback(() => goToTrack(-1), [goToTrack]);

  return {
    isEnabled,
    isPlaying: isEnabled,
    currentTrack: PLAYLIST[currentTrack].src,
    currentTrackTitle: PLAYLIST[currentTrack].title,
    trackIndex: currentTrack,
    trackCount: PLAYLIST.length,
    toggleMusic,
    nextTrack,
    prevTrack,
  };
};
