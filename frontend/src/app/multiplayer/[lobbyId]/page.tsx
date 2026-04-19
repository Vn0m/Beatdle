'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import GuessInput from '@/components/game/GuessInput';
import FilterSelector from '@/components/game/FilterSelector';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { isFuzzyTitleMatch } from '@/lib/normalizeTitle';
import type { TrackSuggestion, GameFilters } from '@/types';
import { MAX_ATTEMPTS, MAX_ROUNDS, SNIPPET_DURATIONS } from '@/config/constants';

const MEDALS = ['🥇', '🥈', '🥉'];

function MultiplayerLobbyContent({ lobbyId }: { lobbyId: string }) {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Anonymous';
  const initialIsHost = searchParams.get('host') === 'true';

  const [customFilters, setCustomFilters] = useState<GameFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const {
    myId,
    players,
    track,
    round,
    gameStarted,
    gameOver,
    roundOver,
    error,
    timeLeft,
    startGame,
    submitGuess,
    nextRound,
  } = useWebSocket({ lobbyId, name, isHost: initialIsHost });

  const me = players.find((p) => p.id === myId);
  const isHost = me?.isHost ?? false;
  const won = me?.isCorrect ?? false;
  const duration = me ? SNIPPET_DURATIONS[me.currentAttempt] || 15 : 3;

  const { audioRef, isPlaying, currentTime, play } = useAudioPlayer({
    previewUrl: track?.previewUrl || null,
    duration,
  });

  function onGuess(selected: TrackSuggestion) {
    if (!me || !track || roundOver) return;
    const correct = selected.id === track.id || (
      isFuzzyTitleMatch(selected.name, track.name) &&
      selected.artists.some(a => track.artists.some(ta => ta.toLowerCase() === a.toLowerCase()))
    );
    submitGuess(correct);
  }

  const getFilterDisplay = () => {
    const parts = [];
    if (customFilters.genre) parts.push(`Genre: ${customFilters.genre}`);
    if (customFilters.artist) parts.push(`Artist: ${customFilters.artist}`);
    if (customFilters.decadeStart && customFilters.decadeEnd) parts.push(`Decade: ${customFilters.decadeStart}s`);
    return parts.join(' · ');
  };

  const hasFilters = Object.keys(customFilters).length > 0;

  function renderScoreboard() {
    return (
      <div className="w-56 sticky top-4 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest px-4 py-3 border-b border-gray-100 text-center">
          Players
        </h3>
        <div className="overflow-y-auto divide-y divide-gray-100" style={{ maxHeight: 'calc(100vh - 24rem)' }}>
          {[...players].sort((a, b) => b.score - a.score).map((p, idx) => (
            <div
              key={p.id}
              className={`px-4 py-3 flex justify-between items-center text-sm ${p.id === myId ? 'bg-[#EEF2F8]' : ''}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-gray-400 text-xs w-4">{idx + 1}</span>
                <span className={`font-semibold truncate ${p.id === myId ? 'text-[#4A6FA5]' : 'text-dark'}`}>
                  {p.name} {p.isHost && '👑'}
                </span>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="font-bold text-dark">{p.score}</span>
                {p.isCorrect && <span className="text-xs text-[#1C1C1E] ml-1">✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderLobby() {
    return (
      <div className="flex flex-col items-center w-full max-w-sm mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold text-center text-dark mb-1" style={{ fontFamily: 'Georgia, Times, serif' }}>
          Waiting Room
        </h2>
        <p className="text-sm text-gray-400 text-center mb-8">
          Lobby code: <span className="font-bold text-dark tracking-widest">{lobbyId}</span>
          {isHost && <span className="ml-2 text-[#1C1C1E] font-semibold">· Host</span>}
        </p>

        {isHost && (
          <div className="w-full mb-6 space-y-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-dark transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Game Filters {hasFilters && <span className="text-[#1C1C1E]">· Active</span>}</span>
              </div>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFilters && (
              <div className="w-full">
                <FilterSelector onFiltersChange={setCustomFilters} initialFilters={customFilters} />
              </div>
            )}

            <Button
              onClick={() => startGame(hasFilters ? customFilters : undefined)}
              className="w-full h-11 text-sm font-bold bg-[#1C1C1E] hover:bg-[#0A0A0A] text-white rounded-full transition-colors cursor-pointer"
            >
              Start Game
            </Button>
          </div>
        )}

        {!isHost && (
          <p className="text-sm text-gray-400 mb-6 text-center">Waiting for the host to start...</p>
        )}

        <div className="w-full">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Players ({players.length})
          </p>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {players.map((p) => (
              <div
                key={p.id}
                className={`px-4 py-3 flex justify-between items-center text-sm ${
                  p.id === myId ? 'bg-[#EEF2F8]' : 'bg-white'
                }`}
              >
                <span className={`font-semibold ${p.id === myId ? 'text-[#4A6FA5]' : 'text-dark'}`}>
                  {p.name} {p.isHost && '👑'}
                </span>
                <span className="text-xs text-gray-400">{p.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderGame() {
    if (!track || !me) return <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const meAttempt = me.currentAttempt;

    const seed = track.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const freq1 = 0.2 + (seed % 10) / 50;
    const freq2 = 0.1 + (seed % 7) / 40;
    const freq3 = 0.4 + (seed % 5) / 30;
    const offset1 = (seed % 31) / 10;
    const offset2 = (seed % 23) / 10;
    const currentUnlockedDuration = SNIPPET_DURATIONS[Math.min(meAttempt, SNIPPET_DURATIONS.length - 1)] || 0;

    return (
      <div className="relative max-w-7xl mx-auto w-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_40rem_1fr] gap-8">
          <div className="hidden lg:block" />

          <div className="w-full max-w-2xl mx-auto flex flex-col items-center mt-10">
            {track.previewUrl && <audio ref={audioRef} src={track.previewUrl} />}

            <div className="w-full flex justify-between items-center mb-6">
              <div className="text-sm font-semibold text-gray-400">
                <span className="text-dark font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</span>
                <span className="ml-1">left</span>
              </div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Round {round} / {MAX_ROUNDS}
              </div>
            </div>

            <button
              onClick={play}
              disabled={isPlaying || won || roundOver || me.currentAttempt >= MAX_ATTEMPTS}
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm bg-white border-2 border-gray-200 text-[#1C1C1E] hover:border-[#1C1C1E] hover:shadow-md active:scale-95 transition-all duration-150 ${
                isPlaying || won || roundOver || me.currentAttempt >= MAX_ATTEMPTS ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
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
              <div className="flex gap-0.5 h-14 items-end">
                {[...Array(40)].map((_, i) => {
                  const isUnlocked = i < (currentUnlockedDuration / 15) * 40;
                  const wave1 = Math.sin(i * freq1 + offset1) * 0.4;
                  const wave2 = Math.sin(i * freq2 + offset2) * 0.3;
                  const wave3 = Math.sin(i * freq3 + seed) * 0.2;
                  const heightPercent = 25 + (wave1 + wave2 + wave3 + 0.9) * 28;
                  const barProgress = (i / 40) * currentUnlockedDuration;
                  const hasPlayed = currentTime > barProgress;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${
                        !isUnlocked ? 'bg-gray-200' : hasPlayed ? 'bg-[#0A0A0A]' : 'bg-[#1C1C1E]'
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

            {!won && !roundOver && (
              <div className="w-full max-w-md mb-6">
                <GuessInput onSelect={onGuess} disabled={won || roundOver || me.currentAttempt >= MAX_ATTEMPTS} />
              </div>
            )}

            <div className="flex gap-2.5 mb-6">
              {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                const guess = me.guesses[i];
                let boxClass = 'bg-white border-gray-200 text-gray-300';
                if (guess === 'correct') boxClass = 'bg-[#f6f7f8] border-[#1C1C1E] text-[#1C1C1E]';
                else if (guess === 'wrong') boxClass = 'bg-[#fee2e2] border-red-400 text-red-400';
                if (i === me.currentAttempt && !won && !roundOver) boxClass = 'border-[#1C1C1E] bg-white text-[#1C1C1E]';
                return (
                  <div key={i} className={`w-14 h-14 border-2 rounded-xl flex items-center justify-center text-sm font-bold ${boxClass}`}>
                    {i + 1}
                  </div>
                );
              })}
            </div>

            {(won || roundOver) && (
              <div className="text-center mt-2 mb-5">
                <p className="text-lg font-bold text-dark">{track.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{track.artists.join(', ')}</p>
              </div>
            )}

            {!roundOver && (won || me.currentAttempt >= MAX_ATTEMPTS) && (
              <p className="text-sm text-gray-400 mt-2 text-center">Waiting for other players...</p>
            )}

            {roundOver && round < MAX_ROUNDS && isHost && (
              <Button
                onClick={nextRound}
                className="mt-4 h-11 px-8 font-bold bg-[#1C1C1E] hover:bg-[#0A0A0A] text-white rounded-full transition-colors cursor-pointer"
              >
                Next Song →
              </Button>
            )}
          </div>

          <div className="hidden lg:block">{renderScoreboard()}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-dark font-sans">
      <AppHeader />

      <main className="flex flex-col items-center grow">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl m-4">{error}</div>
        )}
        {gameStarted ? renderGame() : renderLobby()}
      </main>

      <Dialog open={gameOver} onOpenChange={() => {}}>
        <DialogContent className="max-w-[85vw] sm:max-w-sm bg-white border border-gray-200 text-dark font-sans shadow-xl rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
          <DialogTitle className="sr-only">Game Complete</DialogTitle>
          <DialogDescription className="sr-only">Final scores and rankings</DialogDescription>
          <div className="text-center">
            <div className="text-4xl mb-3">🏆</div>
            <h2 className="text-xl font-bold text-dark mb-5" style={{ fontFamily: 'Georgia, Times, serif' }}>Game Over</h2>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden mb-6">
              {[...players]
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className={`py-3 px-4 flex justify-between items-center text-sm ${idx === 0 ? 'bg-[#f6f7f8]' : 'bg-white'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{idx < 3 ? MEDALS[idx] : <span className="text-gray-400 text-xs w-5 inline-block">{idx + 1}</span>}</span>
                      <span className={`font-semibold ${idx === 0 ? 'text-dark' : 'text-gray-700'}`}>{p.name}</span>
                    </div>
                    <span className={`font-bold ${idx === 0 ? 'text-[#1C1C1E]' : 'text-gray-500'}`}>{p.score} pts</span>
                  </div>
                ))}
            </div>
            <Link href="/">
              <Button className="w-full h-11 font-semibold text-sm bg-[#1C1C1E] hover:bg-[#0A0A0A] text-white rounded-full transition-colors cursor-pointer">
                Back to Home
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MultiplayerLobbyPage({ params }: { params: Promise<{ lobbyId: string }> }) {
  const { lobbyId } = use(params);
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">Loading...</div>}>
      <MultiplayerLobbyContent lobbyId={lobbyId} />
    </Suspense>
  );
}
