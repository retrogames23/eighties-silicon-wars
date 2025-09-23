import { useState, useRef, useEffect } from 'react';
import { Audio80sGenerator } from '@/utils/audioGenerator';

interface Track {
  name: 'scifi' | 'jungle' | 'monkey';
  title: string;
}

const tracks: Track[] = [
  {
    name: 'scifi',
    title: 'Scifi'
  },
  {
    name: 'jungle', 
    title: 'Jungle'
  },
  {
    name: 'monkey',
    title: 'Monkey'
  }
];

export const useAudioManager = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);
  const audioGeneratorRef = useRef<Audio80sGenerator | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize audio generator
  useEffect(() => {
    try {
      audioGeneratorRef.current = new Audio80sGenerator();
      audioGeneratorRef.current.setVolume(0.3);
    } catch (error) {
      console.error('Web Audio API not supported:', error);
    }

    return () => {
      if (currentSourceRef.current) {
        try {
          currentSourceRef.current.stop();
        } catch (e) {
          // Source might already be stopped
        }
      }
    };
  }, []);

  const playTrack = async (index: number) => {
    if (!isEnabled || !audioGeneratorRef.current) return;

    // Stop current track
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {
        // Source might already be stopped
      }
    }

    try {
      const track = tracks[index];
      const source = await audioGeneratorRef.current.playTrack(track.name);
      currentSourceRef.current = source;
      
      // Set up ended listener for auto-next
      source.onended = () => {
        setIsPlaying(false);
        // Auto-play next track after 1 second
        setTimeout(() => {
          nextTrack();
        }, 1000);
      };

      setIsPlaying(true);
      setCurrentTrackIndex(index);
    } catch (error) {
      console.error('Error playing track:', error);
      setIsPlaying(false);
    }
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    playTrack(nextIndex);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      // Stop current track
      if (currentSourceRef.current) {
        try {
          currentSourceRef.current.stop();
          currentSourceRef.current = null;
        } catch (e) {
          // Source might already be stopped
        }
      }
      setIsPlaying(false);
    } else if (isEnabled) {
      // Start playing current track
      playTrack(currentTrackIndex);
    }
  };

  const setEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled) {
      // Stop current track
      if (currentSourceRef.current) {
        try {
          currentSourceRef.current.stop();
          currentSourceRef.current = null;
        } catch (e) {
          // Source might already be stopped
        }
      }
      setIsPlaying(false);
    } else if (!isPlaying) {
      // Start playing when enabling
      playTrack(currentTrackIndex);
    }
  };

  // Auto-start music when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isEnabled && audioGeneratorRef.current) {
        playTrack(0);
      }
    }, 1000); // Wait 1 second before auto-starting

    return () => clearTimeout(timer);
  }, [isEnabled]);

  return {
    isPlaying,
    isEnabled,
    currentTrack: tracks[currentTrackIndex],
    toggleMusic,
    setEnabled,
    nextTrack
  };
};