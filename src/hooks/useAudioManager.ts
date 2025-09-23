import { useState, useRef, useEffect } from 'react';
import { RetroMusicGenerator } from '@/utils/retroMusicGenerator';

export const useAudioManager = () => {
  const [isEnabled, setIsEnabled] = useState(true); // Standardmäßig an
  const [isPlaying, setIsPlaying] = useState(false);
  const audioGeneratorRef = useRef<RetroMusicGenerator | null>(null);

  // Audio Generator initialisieren
  useEffect(() => {
    try {
      audioGeneratorRef.current = new RetroMusicGenerator();
      console.log('RetroMusicGenerator initialized');
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }

    return () => {
      if (audioGeneratorRef.current) {
        audioGeneratorRef.current.stop();
      }
    };
  }, []);

  // Musik automatisch starten wenn enabled
  useEffect(() => {
    if (isEnabled && audioGeneratorRef.current && !isPlaying) {
      const startMusic = async () => {
        try {
          await audioGeneratorRef.current!.play();
          setIsPlaying(true);
          console.log('Music started automatically');
        } catch (error) {
          console.error('Failed to start music:', error);
        }
      };
      
      // Warte kurz nach Initialisierung
      const timer = setTimeout(startMusic, 500);
      return () => clearTimeout(timer);
    }
  }, [isEnabled, audioGeneratorRef.current]);

  const toggleMusic = async () => {
    if (!audioGeneratorRef.current) return;

    try {
      if (isEnabled && isPlaying) {
        // Musik aus
        audioGeneratorRef.current.stop();
        setIsPlaying(false);
        setIsEnabled(false);
        console.log('Music stopped');
      } else {
        // Musik an
        await audioGeneratorRef.current.play();
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