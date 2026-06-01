'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { hasReachedCustomGameLimit, incrementGuestCustomGames } from '@/lib/guestLimits';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import AudioPlayer from '@/components/game/AudioPlayer';
import GuessInput from '@/components/game/GuessInput';
import GuessGrid from '@/components/game/GuessGrid';
import FilterSelector from '@/components/game/FilterSelector';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { fetchCustomTrack, saveScore } from '@/lib/api';
import { isFuzzyTitleMatch } from '@/lib/normalizeTitle';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { MAX_ATTEMPTS, SNIPPET_DURATIONS, MAX_CUSTOM_ROUNDS, CUSTOM_SCORE_POINTS } from '@/config/constants';
import type { SpotifyTrack, TrackSuggestion, GameFilters } from '@/types';

export default function CustomGame() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<GameFilters>({});
  const [maxRounds, setMaxRounds] = useState(5);
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [guesses, setGuesses] = useState<{ correct: boolean; guess: string }[]>([]);
  const [roundOver, setRoundOver] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);

  const duration = roundOver ? 15 : (SNIPPET_DURATIONS[currentAttempt] || 15);
  const { audioRef, isPlaying, currentTime, play, pause, playFullSong } = useAudioPlayer({
    previewUrl: track?.previewUrl || null,
    duration,
  });

  const loadCustomTrack = async () => {
    if (!user && hasReachedCustomGameLimit()) {
      alert('You\'ve played 3 custom games today. Sign up for unlimited!');
      return;
    }
    if (!user) {
      incrementGuestCustomGames();
    }
    try {
      setLoading(true);
      const data = await fetchCustomTrack(filters);
      setTrack(data);
      setGameStarted(true);
    } catch {
      alert('Failed to load song. Please try different filters.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = (selectedTrack: TrackSuggestion) => {
    if (roundOver || !track) return;
    const isCorrect = selectedTrack.id === track.id || (
      isFuzzyTitleMatch(selectedTrack.name, track.name) &&
      selectedTrack.artists.some(a => track.artists.some(ta => ta.toLowerCase() === a.toLowerCase()))
    );
    const newGuesses = [...guesses, { correct: isCorrect, guess: `${selectedTrack.name} - ${selectedTrack.artists.join(', ')}` }];
    setGuesses(newGuesses);

    if (isCorrect) {
      const pointsEarned = CUSTOM_SCORE_POINTS[guesses.length] || 0;
      setScore(prev => prev + pointsEarned);
      setWon(true);
      setRoundOver(true);
      playFullSong();
      saveScore({ game_type: 'custom', attempts: newGuesses.length, completed: true });
      if (round >= maxRounds) { setGameOver(true); setShowModal(true); }
    } else if (currentAttempt + 1 >= MAX_ATTEMPTS) {
      setRoundOver(true);
      setWon(false);
      playFullSong();
      saveScore({ game_type: 'custom', attempts: MAX_ATTEMPTS, completed: false });
      if (round >= maxRounds) { setGameOver(true); setShowModal(true); }
    } else {
      setCurrentAttempt(currentAttempt + 1);
    }
  };

  const handleNextRound = async () => {
    pause();
    setIsTransitioning(true);
    setRound(r => r + 1);
    setCurrentAttempt(0);
    setGuesses([]);
    setRoundOver(false);
    setWon(false);
    try {
      const data = await fetchCustomTrack(filters);
      setTrack(data);
    } catch {
      alert('Failed to load next song.');
    } finally {
      setIsTransitioning(false);
    }
  };

  const handlePlayAgain = () => {
    pause();
    setTrack(null);
    setCurrentAttempt(0);
    setGuesses([]);
    setRoundOver(false);
    setGameOver(false);
    setShowModal(false);
    setWon(false);
    setGameStarted(false);
    setRound(1);
    setScore(0);
  };

  const getFilterDisplay = () => {
    const parts = [];
    if (filters.genre) parts.push(`Genre: ${filters.genre}`);
    if (filters.artist) parts.push(`Artist: ${filters.artist}`);
    if (filters.decadeStart && filters.decadeEnd) parts.push(`Decade: ${filters.decadeStart}s`);
    return parts.length > 0 ? parts.join(' · ') : 'No filters';
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-dark font-sans">
        <AppHeader />
        <main className="flex-1 flex flex-col items-center justify-center py-8 px-4">
          <div className="w-full max-w-sm mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-dark" style={{ fontFamily: 'Georgia, Times, serif' }}>Custom Game</h1>
              <p className="text-sm text-gray-400 mt-1">Pick your filters and test your ears</p>
            </div>

            <div className="w-full mb-6">
              <FilterSelector onFiltersChange={setFilters} initialFilters={filters} />
            </div>

            <div className="mb-8">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Rounds</label>
              <input
                type="number"
                min="1"
                max={MAX_CUSTOM_ROUNDS}
                value={maxRounds}
                onChange={(e) => setMaxRounds(Math.min(MAX_CUSTOM_ROUNDS, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1.5">1–{MAX_CUSTOM_ROUNDS} rounds</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={loadCustomTrack}
                disabled={loading}
                className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-full text-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Loading...' : 'Start Game'}
              </Button>
              <Link href="/" className="w-full">
                <button className="w-full h-11 font-semibold text-sm bg-white text-gray-500 border border-gray-200 rounded-full hover:border-gray-400 hover:text-dark transition-colors cursor-pointer">
                  Cancel
                </button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-dark font-sans">
        <div className="text-xl font-medium">Loading song...</div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-dark font-sans">
        <div className="text-xl font-medium">Failed to load song. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-dark font-sans">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center justify-start py-8 px-4">
        <div className="w-full max-w-lg mx-auto">
          <div className="mb-5 text-center">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Round {round}/{maxRounds}</p>
              <p className="text-sm font-semibold text-primary-500">Score: {score}</p>
            </div>
            {getFilterDisplay() !== 'No filters' && (
              <p className="text-xs text-gray-400">{getFilterDisplay()}</p>
            )}
          </div>

          <div className="w-full bg-white flex flex-col items-center">
            <AudioPlayer
              trackId={track.id}
              previewUrl={track.previewUrl}
              audioRef={audioRef}
              isPlaying={isPlaying}
              currentTime={currentTime}
              currentAttempt={currentAttempt}
              gameOver={roundOver}
              disabled={isTransitioning}
              onPlay={play}
              onPause={pause}
            />

            {!roundOver && (
              <div className="w-full max-w-md mb-8">
                <GuessInput onSelect={handleGuess} disabled={roundOver} />
                <p className="text-sm text-gray-500 mt-3 text-center font-sans">
                  Attempt <span className="font-semibold text-dark">{currentAttempt + 1}</span> of{' '}
                  <span className="font-semibold text-dark">{MAX_ATTEMPTS}</span> ·{' '}
                  <span className="font-semibold text-dark">{SNIPPET_DURATIONS[currentAttempt]}s</span> unlocked
                </p>
              </div>
            )}

            {roundOver && (
              <div className="w-full max-w-md mb-8 text-center">
                <div className="mb-5">
                  <p className="text-lg font-bold text-dark mb-3">{won ? '🎉 Correct!' : '😔 Not quite'}</p>
                  <p className="text-base font-semibold text-dark">{track.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{track.artists.join(', ')}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{track.album.name}</p>
                </div>
                {!gameOver && (
                  <Button
                    onClick={handleNextRound}
                    className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-10 h-11 rounded-full transition-colors cursor-pointer"
                  >
                    Next Round →
                  </Button>
                )}
              </div>
            )}

            {gameOver && (
              <Button
                onClick={() => setShowModal(true)}
                className="mb-6 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-10 h-11 rounded-full transition-colors cursor-pointer"
              >
                View Results
              </Button>
            )}

            <GuessGrid guesses={guesses} maxAttempts={MAX_ATTEMPTS} />
          </div>
        </div>
      </main>
      <Footer />

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-[85vw] sm:max-w-sm bg-white border border-gray-200 text-dark font-sans shadow-xl rounded-2xl p-6">
          <DialogTitle className="sr-only">Game Complete!</DialogTitle>
          <DialogDescription className="sr-only">Your final score for the custom game</DialogDescription>
          <div className="text-5xl mb-4 text-center">🎉</div>
          <h2 className="text-xl font-bold mb-1 text-center text-dark" style={{ fontFamily: 'Georgia, Times, serif' }}>Game Complete!</h2>
          <p className="text-sm text-gray-400 text-center mb-5">
            Final Score: <span className="font-bold text-dark text-base">{score}</span> / {maxRounds * 5}
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handlePlayAgain}
              className="w-full h-11 text-white bg-primary-500 hover:bg-primary-600 font-semibold rounded-full text-sm transition-colors cursor-pointer"
            >
              Play Again
            </Button>
            <Link href="/" className="w-full">
              <button className="w-full h-11 font-semibold text-sm bg-white text-gray-500 border border-gray-200 rounded-full hover:border-gray-400 hover:text-dark transition-colors cursor-pointer">
                Back to Home
              </button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
