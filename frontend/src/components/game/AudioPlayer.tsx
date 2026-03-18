'use client';

interface AudioPlayerProps {
  trackId: string;
  previewUrl: string | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  currentTime: number;
  currentAttempt: number;
  gameOver: boolean;
  disabled?: boolean;
  onPlay: () => void;
  onPause: () => void;
}

const SNIPPET_DURATIONS = [3, 6, 9, 12, 15] as const;

export default function AudioPlayer({
  trackId,
  previewUrl,
  audioRef,
  isPlaying,
  currentTime,
  currentAttempt,
  gameOver,
  disabled = false,
  onPlay,
  onPause,
}: AudioPlayerProps) {
  const currentDuration = gameOver ? 15 : (SNIPPET_DURATIONS[currentAttempt] || 0);

  const seed = trackId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const freq1 = 0.2 + (seed % 10) / 50;
  const freq2 = 0.1 + (seed % 7) / 40;
  const freq3 = 0.4 + (seed % 5) / 30;
  const offset1 = (seed % 31) / 10;
  const offset2 = (seed % 23) / 10;

  return (
    <div className="flex flex-col items-center w-full">
      {previewUrl && <audio ref={audioRef} src={previewUrl} />}

      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md bg-white border-2 border-gray-300 text-primary-500 hover:border-primary-500 hover:shadow-lg active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:shadow-md"
      >
        {isPlaying ? (
          <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-9 h-9 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="relative w-full max-w-md mx-auto mb-8">
        <div className="flex gap-0.5 h-16 items-end">
          {[...Array(40)].map((_, i) => {
            const isUnlocked = i < (currentDuration / 15) * 40;
            const wave1 = Math.sin(i * freq1 + offset1) * 0.4;
            const wave2 = Math.sin(i * freq2 + offset2) * 0.3;
            const wave3 = Math.sin(i * freq3 + seed) * 0.2;
            const heightPercent = 25 + (wave1 + wave2 + wave3 + 0.9) * 28;
            const barProgress = (i / 40) * currentDuration;
            const hasPlayed = currentTime > barProgress;

            return (
              <div
                key={i}
                className={`flex-1 rounded-sm ${
                  !isUnlocked
                    ? 'bg-gray-200'
                    : hasPlayed
                    ? 'bg-primary-600'
                    : 'bg-primary-500'
                } ${isPlaying && isUnlocked ? 'animate-wave-pulse' : ''}`}
                style={{
                  height: `${heightPercent}%`,
                  opacity: isUnlocked ? 0.9 : 0.4,
                  animationDelay: `${(i % 5) * 0.08}s`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
