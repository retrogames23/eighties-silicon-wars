import { useState, useRef, useEffect } from 'react';

export const useAudioManager = () => {
  const [isEnabled, setIsEnabled] = useState(true); // Standardmäßig an
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio Element initialisieren
  useEffect(() => {
    try {
      audioRef.current = new Audio('/audio/Neon_Dreams.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      console.log('Audio player initialized with Neon Dreams');
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Musik automatisch starten wenn enabled
  useEffect(() => {
    if (isEnabled && audioRef.current && !isPlaying) {
      const startMusic = async () => {
        try {
          await audioRef.current!.play();
          setIsPlaying(true);
          console.log('Neon Dreams started automatically');
        } catch (error) {
          console.error('Failed to start music:', error);
        }
      };
      
      // Warte kurz nach Initialisierung
      const timer = setTimeout(startMusic, 500);
      return () => clearTimeout(timer);
    }
  }, [isEnabled, audioRef.current]);

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    try {
      if (isEnabled && isPlaying) {
        // Musik aus
        audioRef.current.pause();
        setIsPlaying(false);
        setIsEnabled(false);
        console.log('Music stopped');
      } else {
        // Musik an
        await audioRef.current.play();
        setIsPlaying(true);
        setIsEnabled(true);
        console.log('Music started');
      }
    } catch (error) {
      console.error('Failed to toggle music:', error);
    }
  };

  return {
    isEnabled,
    isPlaying,
    toggleMusic
  };
};