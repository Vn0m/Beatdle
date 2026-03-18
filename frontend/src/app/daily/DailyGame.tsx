'use client';

import { useEffect, useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import AudioPlayer from '@/components/game/AudioPlayer';
import GuessInput from '@/components/game/GuessInput';
import GuessGrid from '@/components/game/GuessGrid';
import ResultModal from '@/components/game/ResultModal';
import HintButton from '@/components/game/HintButton';
import { Button } from '@/components/ui/button';
import { fetchDailySong } from '@/lib/api';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { MAX_ATTEMPTS, SNIPPET_DURATIONS } from '@/config/constants';
import type { SpotifyTrack, TrackSuggestion, HintState } from '@/types';
import { Lightbulb } from 'lucide-react';

export default function DailyGame() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [guesses, setGuesses] = useState<{ correct: boolean; guess: string }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [usedHints, setUsedHints] = useState<HintState>({ year: false, artist: false, album: false });
  const [showHints, setShowHints] = useState(false);

  const duration = gameOver ? 15 : (SNIPPET_DURATIONS[currentAttempt] || 15);
  const { audioRef, isPlaying, currentTime, play, pause, playFullSong } = useAudioPlayer({
    previewUrl: track?.previewUrl || null,
    duration,
  });

  useEffect(() => {
    loadDailySong();
  }, []);

  useEffect(() => {
    if (!track) return;
    const saved = localStorage.getItem(`beatdle-hints-${track.id}`);
    if (saved) {
      try { setUsedHints(JSON.parse(saved)); } catch {}
    }
  }, [track]);

  useEffect(() => {
    if (!track) return;
    localStorage.setItem(`beatdle-hints-${track.id}`, JSON.stringify(usedHints));
  }, [usedHints, track]);

  const loadDailySong = async () => {
    try {
      setLoading(true);
      setTrack(await fetchDailySong());
    } catch (error) {
      console.error('Failed to load daily song:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = (selectedTrack: TrackSuggestion) => {
    if (gameOver || !track) return;
    const isCorrect = selectedTrack.id === track.id;
    setGuesses([...guesses, { correct: isCorrect, guess: `${selectedTrack.name} - ${selectedTrack.artists.join(', ')}` }]);

    if (isCorrect) {
      setWon(true);
      setGameOver(true);
      setShowModal(true);
      playFullSong();
    } else if (currentAttempt + 1 >= MAX_ATTEMPTS) {
      setGameOver(true);
      setShowModal(true);
    } else {
      setCurrentAttempt(currentAttempt + 1);
    }
  };

  const generateShareGrid = () => {
    if (!track) return '';
    let grid = '';
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const guess = guesses[i];
      grid += guess ? (guess.correct ? '🟩' : '🟥') : '⬜';
    }
    const dailyId = track.id.slice(-5);
    const tries = won ? guesses.length : 'X';
    const hintsUsedCount = Object.values(usedHints).filter(Boolean).length;
    const hintsText = hintsUsedCount > 0 ? ` (${hintsUsedCount} hint${hintsUsedCount > 1 ? 's' : ''})` : '';
    return `Beatdle #${dailyId} ${tries}/${MAX_ATTEMPTS}${hintsText}\n${grid}`;
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(generateShareGrid());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Failed to copy results. Please grant clipboard permissions.');
    }
  };

  const getYearFromDate = (d: string) => new Date(d).getFullYear().toString();
  const getArtistInitial = (artists: string[]) => artists[0]?.[0]?.toUpperCase() || '?';

  if (!track && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-dark font-sans">
        <div className="text-xl font-medium">Failed to load song. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-dark font-sans">
      <AppHeader />
      <main className="flex grow">
        <div className="flex-1 flex flex-col items-center justify-start py-8 px-4">
          <div className="w-full max-w-lg mx-auto">
            <div className="w-full bg-white flex flex-col items-center">
              <AudioPlayer
                trackId={track?.id ?? 'loading'}
                previewUrl={track?.previewUrl ?? null}
                audioRef={audioRef}
                isPlaying={isPlaying}
                currentTime={currentTime}
                currentAttempt={currentAttempt}
                gameOver={gameOver}
                disabled={loading}
                onPlay={play}
                onPause={pause}
              />

              {!gameOver && (
                <div className="w-full max-w-md mb-8">
                  <GuessInput onSelect={handleGuess} disabled={gameOver || loading} />
                  <p className="text-sm text-gray-500 mt-3 text-center font-sans">
                    Attempt <span className="font-semibold text-dark">{currentAttempt + 1}</span> of{' '}
                    <span className="font-semibold text-dark">{MAX_ATTEMPTS}</span> ·{' '}
                    <span className="font-semibold text-dark">{SNIPPET_DURATIONS[currentAttempt]}s</span> unlocked
                  </p>

                  <div className="mt-6">
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="w-full py-2 px-4 text-sm font-medium text-gray-600 hover:text-primary-500 transition-colors font-sans cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Lightbulb className="w-4 h-4" />
                      {showHints ? 'Hide Hints' : 'Need a hint?'}
                    </button>

                    {showHints && track && (
                      <div className="mt-3 flex gap-2 flex-wrap sm:flex-nowrap">
                        <HintButton
                          label="Reveal Year"
                          revealedInfo={`Year: ${getYearFromDate(track.releaseDate)}`}
                          isRevealed={usedHints.year}
                          onReveal={() => !usedHints.year && setUsedHints({ ...usedHints, year: true })}
                        />
                        <HintButton
                          label="Artist Initial"
                          revealedInfo={`Starts with: ${getArtistInitial(track.artists)}`}
                          isRevealed={usedHints.artist}
                          onReveal={() => !usedHints.artist && setUsedHints({ ...usedHints, artist: true })}
                        />
                        <HintButton
                          label="Album Name"
                          revealedInfo={`Album: ${track.album.name}`}
                          isRevealed={usedHints.album}
                          onReveal={() => !usedHints.album && setUsedHints({ ...usedHints, album: true })}
                        />
                      </div>
                    )}
                  </div>
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

              {track && (
                <ResultModal
                  open={showModal}
                  onOpenChange={setShowModal}
                  won={won}
                  guesses={guesses}
                  maxAttempts={MAX_ATTEMPTS}
                  track={track}
                  onShare={handleShare}
                  copied={copied}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
