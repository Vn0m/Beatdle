'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import AudioPlayer from '@/components/game/AudioPlayer';
import GuessInput from '@/components/game/GuessInput';
import GuessGrid from '@/components/game/GuessGrid';
import FilterSelector from '@/components/game/FilterSelector';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { fetchCustomTrack } from '@/lib/api';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { MAX_ATTEMPTS, SNIPPET_DURATIONS, MAX_CUSTOM_ROUNDS, CUSTOM_SCORE_POINTS } from '@/config/constants';
import type { SpotifyTrack, TrackSuggestion, GameFilters } from '@/types';

export default function CustomGame() {
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
  const [gameStarted, setGameStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);

  const duration = roundOver ? 15 : (SNIPPET_DURATIONS[currentAttempt] || 15);
  const { audioRef, isPlaying, currentTime, play, pause, playFullSong } = useAudioPlayer({
    previewUrl: track?.previewUrl || null,
    duration,
  });

  const loadCustomTrack = async () => {
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
    const isCorrect = selectedTrack.id === track.id;
    const newGuesses = [...guesses, { correct: isCorrect, guess: `${selectedTrack.name} - ${selectedTrack.artists.join(', ')}` }];
    setGuesses(newGuesses);

    if (isCorrect) {
      const pointsEarned = CUSTOM_SCORE_POINTS[guesses.length] || 0;
      setScore(prev => prev + pointsEarned);
      setWon(true);
      setRoundOver(true);
      playFullSong();
      if (round >= maxRounds) { setGameOver(true); setShowModal(true); }
    } else if (currentAttempt + 1 >= MAX_ATTEMPTS) {
      setRoundOver(true);
      setWon(false);
      playFullSong();
      if (round >= maxRounds) { setGameOver(true); setShowModal(true); }
    } else {
      setCurrentAttempt(currentAttempt + 1);
    }
  };

  const handleNextRound = async () => {
    pause();
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
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-center mb-2">Custom Game</h1>
            <p className="text-center text-gray-600 mb-8">Choose your filters and test your music knowledge</p>

            <div className="w-full mb-6">
              <FilterSelector onFiltersChange={setFilters} initialFilters={filters} />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Rounds</label>
              <input
                type="number"
                min="1"
                max={MAX_CUSTOM_ROUNDS}
                value={maxRounds}
                onChange={(e) => setMaxRounds(Math.min(MAX_CUSTOM_ROUNDS, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-gray-400 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Play between 1–{MAX_CUSTOM_ROUNDS} rounds</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={loadCustomTrack}
                disabled={loading}
                className="flex-1 bg-dark hover:bg-gray-600 text-white font-semibold py-3 rounded transition-colors cursor-pointer"
              >
                {loading ? 'Loading...' : 'Start Game'}
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full font-semibold py-3 bg-white text-dark border-2 border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer">
                  Cancel
                </Button>
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
          <div className="mb-4 text-center">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-semibold text-gray-600">Round {round}/{maxRounds}</p>
              <p className="text-sm font-semibold text-gray-600">Score: {score}</p>
            </div>
            <p className="text-xs text-gray-500 font-medium">{getFilterDisplay()}</p>
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
                <div className="mb-4">
                  <p className="text-xl font-bold text-dark mb-2">{won ? '🎉 Correct!' : '😔 Incorrect'}</p>
                  <p className="text-lg font-semibold text-dark">{track.name}</p>
                  <p className="text-md text-gray-600">{track.artists.join(', ')}</p>
                  <p className="text-sm text-gray-500 mt-1">{track.album.name}</p>
                </div>
                {!gameOver && (
                  <Button
                    onClick={handleNextRound}
                    className="bg-dark hover:bg-gray-600 text-white font-sans font-semibold px-8 py-3 rounded transition-colors cursor-pointer"
                  >
                    Next Round
                  </Button>
                )}
              </div>
            )}

            {gameOver && (
              <Button
                onClick={() => setShowModal(true)}
                className="mb-6 bg-dark hover:bg-gray-600 text-white font-sans font-semibold px-8 py-3 rounded transition-colors cursor-pointer"
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
        <DialogContent className="max-w-[85vw] sm:max-w-md bg-white border-2 border-gray-300 text-dark font-sans shadow-lg rounded">
          <DialogTitle className="sr-only">Game Complete!</DialogTitle>
          <DialogDescription className="sr-only">Your final score for the custom game</DialogDescription>
          <div className="text-4xl sm:text-5xl mb-3 text-center">🎉</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center text-dark font-sans">Game Complete!</h2>
          <p className="text-lg font-semibold text-center text-dark mb-6">
            Final Score: {score}/{maxRounds * 5}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handlePlayAgain}
              className="flex-1 text-white bg-dark hover:bg-gray-600 font-sans font-semibold py-3 rounded transition-colors cursor-pointer"
            >
              Play Again
            </Button>
            <Link href="/" className="flex-1">
              <Button className="w-full font-sans font-semibold py-3 bg-white text-dark border-2 border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer">
                Home
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
