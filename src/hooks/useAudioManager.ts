import { useState, useRef, useEffect, useCallback } from 'react';

const PLAYLIST = [
  '/audio/Neon_Dreams.mp3',
  '/audio/Virtual_Dreamscape.mp3',
  '/audio/Digital_Dreamscape.mp3'
];

export const useAudioManager = () => {
  const [isEnabled, setIsEnabled] = useState(false); // Startet deaktiviert
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  // Audio Element initialisieren
  useEffect(() => {
    audioRef.current = new Audio(PLAYLIST[0]);
    audioRef.current.volume = 0.3;
    audioRef.current.loop = false;
    
    console.log('Audio initialized');

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Track-Ende Handler
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTrackEnd = () => {
      if (!isEnabled) return;
      
      const nextTrackIndex = (currentTrack + 1) % PLAYLIST.length;
      console.log(`Track ended, playing next: ${PLAYLIST[nextTrackIndex]}`);
      
      audio.src = PLAYLIST[nextTrackIndex];
      audio.currentTime = 0;
      
      audio.play()
        .then(() => {
          setCurrentTrack(nextTrackIndex);
        })
        .catch(error => {
          console.error('Failed to play next track:', error);
          isPlayingRef.current = false;
        });
    };

    audio.addEventListener('ended', handleTrackEnd);
    return () => audio.removeEventListener('ended', handleTrackEnd);
  }, [currentTrack, isEnabled]);

  // Musik starten/stoppen basierend auf isEnabled
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlayback = async () => {
      if (isEnabled && !isPlayingRef.current) {
        try {
          await audio.play();
          isPlayingRef.current = true;
          console.log(`Music started: ${PLAYLIST[currentTrack]}`);
        } catch (error) {
          console.error('Failed to start music:', error);
          isPlayingRef.current = false;
        }
      } else if (!isEnabled && isPlayingRef.current) {
        audio.pause();
        isPlayingRef.current = false;
        console.log('Music stopped');
      }
    };

    handlePlayback();
  }, [isEnabled, currentTrack]);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsEnabled(prev => {
      const newState = !prev;
      
      if (!newState) {
        // Musik ausschalten
        audio.pause();
        isPlayingRef.current = false;
        console.log('Music toggle: OFF');
      } else {
        console.log('Music toggle: ON');
      }
      
      return newState;
    });
  }, []);

  return {
    isEnabled,
    isPlaying: isPlayingRef.current,
    currentTrack: PLAYLIST[currentTrack],
    toggleMusic
  };
};