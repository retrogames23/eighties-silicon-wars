import { useState, useRef, useEffect, useCallback } from 'react';

const PLAYLIST = [
  '/audio/Neon_Dreams.mp3',
  '/audio/Virtual_Dreamscape.mp3'
];

export const useAudioManager = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fade-Funktion
  const fadeAudio = useCallback((from: HTMLAudioElement, to: HTMLAudioElement, callback?: () => void) => {
    const fadeTime = 2000; // 2 Sekunden
    const steps = 50;
    const stepTime = fadeTime / steps;
    const volumeStep = 0.3 / steps;
    
    let step = 0;
    
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }
    
    fadeIntervalRef.current = setInterval(() => {
      step++;
      from.volume = Math.max(0, 0.3 - (volumeStep * step));
      to.volume = Math.min(0.3, volumeStep * step);
      
      if (step >= steps) {
        clearInterval(fadeIntervalRef.current!);
        from.pause();
        from.currentTime = 0;
        callback?.();
      }
    }, stepTime);
  }, []);

  // Audio Elemente initialisieren
  useEffect(() => {
    try {
      audioRef.current = new Audio(PLAYLIST[0]);
      audioRef.current.volume = 0.3;
      nextAudioRef.current = new Audio(PLAYLIST[1]);
      nextAudioRef.current.volume = 0;
      
      console.log('Audio playlist initialized');
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (nextAudioRef.current) {
        nextAudioRef.current.pause();
        nextAudioRef.current = null;
      }
    };
  }, []);

  // Track-Ende Handler
  useEffect(() => {
    const currentAudio = audioRef.current;
    if (!currentAudio) return;

    const handleTrackEnd = () => {
      if (!isEnabled || !isPlaying) return;
      
      const nextTrackIndex = (currentTrack + 1) % PLAYLIST.length;
      const nextAudio = nextAudioRef.current;
      
      if (nextAudio) {
        nextAudio.src = PLAYLIST[nextTrackIndex];
        nextAudio.currentTime = 0;
        nextAudio.volume = 0;
        
        nextAudio.play().then(() => {
          fadeAudio(currentAudio, nextAudio, () => {
            setCurrentTrack(nextTrackIndex);
            // Tausche die Referenzen
            const temp = audioRef.current;
            audioRef.current = nextAudioRef.current;
            nextAudioRef.current = temp;
          });
        }).catch(console.error);
      }
    };

    currentAudio.addEventListener('ended', handleTrackEnd);
    return () => currentAudio.removeEventListener('ended', handleTrackEnd);
  }, [currentTrack, isEnabled, isPlaying, fadeAudio]);

  // Musik automatisch starten wenn enabled
  useEffect(() => {
    if (isEnabled && audioRef.current && !isPlaying) {
      const startMusic = async () => {
        try {
          await audioRef.current!.play();
          setIsPlaying(true);
          console.log(`Started track: ${PLAYLIST[currentTrack]}`);
        } catch (error) {
          console.error('Failed to start music:', error);
        }
      };
      
      const timer = setTimeout(startMusic, 500);
      return () => clearTimeout(timer);
    }
  }, [isEnabled, currentTrack]);

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    try {
      if (isEnabled && isPlaying) {
        // Musik aus
        audioRef.current.pause();
        if (nextAudioRef.current) {
          nextAudioRef.current.pause();
        }
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
        setIsPlaying(false);
        setIsEnabled(false);
        console.log('Music stopped');
      } else {
        // Musik an
        await audioRef.current.play();
        setIsPlaying(true);
        setIsEnabled(true);
        console.log(`Music started: ${PLAYLIST[currentTrack]}`);
      }
    } catch (error) {
      console.error('Failed to toggle music:', error);
    }
  };

  return {
    isEnabled,
    isPlaying,
    currentTrack: PLAYLIST[currentTrack],
    toggleMusic
  };
};