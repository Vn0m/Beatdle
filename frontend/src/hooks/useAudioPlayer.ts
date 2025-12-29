import { useRef, useState, useEffect } from 'react';

interface UseAudioPlayerOptions {
  previewUrl: string | null;
  duration: number;
  onEnded?: () => void;
}

export function useAudioPlayer({ previewUrl, duration, onEnded }: UseAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const play = () => {
    if (!audioRef.current || !previewUrl) return;

    const audio = audioRef.current;
    audio.currentTime = 0;
    audio.play();
    setIsPlaying(true);

    // Auto-pause after duration
    timeoutRef.current = setTimeout(() => {
      audio.pause();
      setIsPlaying(false);
      onEnded?.();
    }, duration * 1000);
  };

  const pause = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    setIsPlaying(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const playFullSong = () => {
    if (!audioRef.current || !previewUrl) return;

    const audio = audioRef.current;
    audio.currentTime = 0;
    audio.play();
    setIsPlaying(true);
  };

  return {
    audioRef,
    isPlaying,
    play,
    pause,
    playFullSong,
  };
}
