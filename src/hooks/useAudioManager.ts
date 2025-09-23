import { useState, useRef, useEffect } from 'react';

interface Track {
  name: string;
  src: string;
  title: string;
}

const tracks: Track[] = [
  {
    name: 'scifi',
    src: '/audio/scifi-80s.mp3',
    title: 'Scifi'
  },
  {
    name: 'jungle',
    src: '/audio/jungle-80s.mp3', 
    title: 'Jungle'
  },
  {
    name: 'monkey',
    src: '/audio/monkey-80s.mp3',
    title: 'Monkey'
  }
];

export const useAudioManager = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Background music volume
      audioRef.current.loop = false;
    }
  }, []);

  const playTrack = (index: number) => {
    if (!isEnabled || !audioRef.current) return;

    const track = tracks[index];
    audioRef.current.src = track.src;
    audioRef.current.play().catch(console.error);
    setIsPlaying(true);
    setCurrentTrackIndex(index);
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    playTrack(nextIndex);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (isEnabled) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const setEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (enabled && !isPlaying) {
      playTrack(currentTrackIndex);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      nextTrack();
    };

    const handleCanPlay = () => {
      if (isEnabled && !isPlaying) {
        audio.play().catch(console.error);
        setIsPlaying(true);
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentTrackIndex, isEnabled, isPlaying]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    playTrack(0);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    isPlaying,
    isEnabled,
    currentTrack: tracks[currentTrackIndex],
    toggleMusic,
    setEnabled,
    nextTrack
  };
};