import { useState, useRef, useEffect, useCallback } from 'react';

const PLAYLIST = [
  '/audio/Neon_Dreams.mp3',
  '/audio/Virtual_Dreamscape.mp3',
  '/audio/Digital_Dreamscape.mp3'
];

type AudioStore = {
  audio: HTMLAudioElement;
  enabled: boolean;
  trackIndex: number;
  listenerAttached: boolean;
};

const getAudioStore = (): AudioStore => {
  const w = window as any;
  if (!w.__APP_AUDIO_STORE__) {
    const audio = new Audio(PLAYLIST[0]);
    audio.volume = 0.3;
    audio.loop = false;
    w.__APP_AUDIO_STORE__ = {
      audio,
      enabled: false,
      trackIndex: 0,
      listenerAttached: false
    } as AudioStore;
    console.log('Audio store initialized');
  }
  return w.__APP_AUDIO_STORE__ as AudioStore;
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
        store.trackIndex = nextIndex;
        store.audio.src = PLAYLIST[nextIndex];
        store.audio.currentTime = 0;
        store.audio
          .play()
          .then(() => setCurrentTrack(nextIndex))
          .catch((err) => console.error('Failed to play next track:', err));
      };
      store.audio.addEventListener('ended', handleTrackEnd);
      store.listenerAttached = true;
    }

    // Do not tear down on unmount to avoid HMR double-audio issues
  }, []);

  // Reflect external store changes (e.g., other toggles) - basic polling-free sync
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
      // Turn OFF
      store.enabled = false;
      try {
        store.audio.pause();
      } catch {}
      setIsEnabled(false);
      console.log('Music stopped');
    } else {
      // Turn ON
      store.enabled = true;
      if (!store.audio.src) store.audio.src = PLAYLIST[store.trackIndex];
      store.audio.currentTime = store.audio.currentTime || 0;
      store.audio
        .play()
        .then(() => {
          setIsEnabled(true);
          setCurrentTrack(store.trackIndex);
          console.log(`Music started: ${PLAYLIST[store.trackIndex]}`);
        })
        .catch((err) => {
          store.enabled = false;
          setIsEnabled(false);
          console.error('Failed to start music:', err);
        });
    }
  }, []);

  return {
    isEnabled,
    isPlaying: isEnabled && !(storeRef.current?.audio.paused ?? true),
    currentTrack: PLAYLIST[currentTrack],
    toggleMusic
  };
};