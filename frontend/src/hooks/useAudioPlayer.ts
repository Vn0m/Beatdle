import { useRef, useState, useEffect } from 'react';

interface UseAudioPlayerOptions {
  previewUrl: string | null;
  duration: number;
  onEnded?: () => void;
}

export function useAudioPlayer({ previewUrl, duration, onEnded }: UseAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      intervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 50) as unknown as number;
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentTime(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  const play = () => {
    if (!audioRef.current || !previewUrl) return;

    const audio = audioRef.current;
    audio.currentTime = 0;
    audio.play();
    setIsPlaying(true);

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
    currentTime,
    play,
    pause,
    playFullSong,
  };
}
