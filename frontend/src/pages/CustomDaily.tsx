import { useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import FilterSelector from "../components/FilterSelector";
import { fetchCustomTrack, type TrackSuggestion } from "../api/spotify";
import type { SpotifyTrack, GameFilters } from "../types";
import Autocomplete from "../components/Autocomplete";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MAX_ATTEMPTS, SNIPPET_DURATIONS, MAX_CUSTOM_ROUNDS, CUSTOM_SCORE_POINTS } from "../constants";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

export default function CustomDaily() {
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
  const [usedTrackIds, setUsedTrackIds] = useState<string[]>([]);

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
      setUsedTrackIds([...usedTrackIds, data.id]);
      setGameStarted(true);
    } catch (error) {
      console.error("Failed to load custom track:", error);
      alert("Failed to load song. Please try different filters.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = (selectedTrack: TrackSuggestion) => {
    if (roundOver || !track) return;

    const isCorrect = selectedTrack.id === track.id;
    
    setGuesses([...guesses, { correct: isCorrect, guess: `${selectedTrack.name} - ${selectedTrack.artists.join(", ")}` }]);

    if (isCorrect) {
      const pointsIndex = guesses.length;
      const pointsEarned = CUSTOM_SCORE_POINTS[pointsIndex] || 0;
      setScore(score + pointsEarned);
      setWon(true);
      setRoundOver(true);
      playFullSong();
      
      if (round >= maxRounds) {
        setGameOver(true);
        setShowModal(true);
      }
    } else if (currentAttempt + 1 >= MAX_ATTEMPTS) {
      setRoundOver(true);
      setWon(false);
      playFullSong();
      
      if (round >= maxRounds) {
        setGameOver(true);
        setShowModal(true);
      }
    } else {
      setCurrentAttempt(currentAttempt + 1);
    }
  };

  const handleNextRound = async () => {
    pause();
    
    setRound(round + 1);
    setCurrentAttempt(0);
    setGuesses([]);
    setRoundOver(false);
    setWon(false);
    
    try {
      const data = await fetchCustomTrack(filters);
      setTrack(data);
      setUsedTrackIds([...usedTrackIds, data.id]);
    } catch (error) {
      console.error("Failed to load next track:", error);
      alert("Failed to load next song.");
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
    setUsedTrackIds([]);
  };

  const getFilterDisplay = () => {
    const parts = [];
    if (filters.genre) parts.push(`Genre: ${filters.genre}`);
    if (filters.artist) parts.push(`Artist: ${filters.artist}`);
    if (filters.decadeStart && filters.decadeEnd) {
      parts.push(`Decade: ${filters.decadeStart}s`);
    }
    return parts.length > 0 ? parts.join(" • ") : "No filters";
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
              <FilterSelector 
                onFiltersChange={setFilters} 
                initialFilters={filters} 
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Rounds
              </label>
              <input
                type="number"
                min="1"
                max={MAX_CUSTOM_ROUNDS}
                value={maxRounds}
                onChange={(e) => setMaxRounds(Math.min(MAX_CUSTOM_ROUNDS, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-gray-400 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Play between 1-{MAX_CUSTOM_ROUNDS} rounds</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={loadCustomTrack}
                disabled={loading}
                className="flex-1 bg-dark hover:bg-gray-600 text-white font-semibold py-3 rounded transition-colors cursor-pointer"
              >
                {loading ? "Loading..." : "Start Game"}
              </Button>
              <Link to="/" className="flex-1">
                <Button
                  className="w-full font-semibold py-3 bg-white text-dark border-2 border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <footer className="w-full py-4 text-center text-sm text-gray-400 bg-white border-t border-gray-200 font-sans">
          <span className="text-dark font-semibold">Beatdle</span> © 2026 · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </footer>
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
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-gray-600">Round {round}/{maxRounds}</p>
              <p className="text-sm font-semibold text-gray-600">Score: {score}</p>
            </div>
            <p className="text-xs text-gray-500 font-medium">{getFilterDisplay()}</p>
          </div>

          <div className="w-full bg-white flex flex-col items-center">
            {track.previewUrl && (
              <audio ref={audioRef} src={track.previewUrl} />
            )}
            <button
              onClick={isPlaying ? pause : play}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md bg-white border-2 border-gray-300 text-primary-500 hover:border-primary-500 hover:shadow-lg active:scale-95 transition-all duration-150 cursor-pointer">
              {isPlaying ? (
                <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-9 h-9 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            <div className="relative w-full max-w-md mx-auto mb-8">
              <div className="flex gap-0.5 h-16 items-end">
                {[...Array(40)].map((_, i) => {
                  const currentDuration = gameOver ? 15 : (SNIPPET_DURATIONS[currentAttempt] || 0);
                  const isUnlocked = i < (currentDuration / 15) * 40;
                  
                  const seed = track.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const freq1 = 0.2 + (seed % 10) / 50;
                  const freq2 = 0.1 + (seed % 7) / 40;
                  const freq3 = 0.4 + (seed % 5) / 30;
                  const offset1 = (seed % 31) / 10;
                  const offset2 = (seed % 23) / 10;
                  
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
                          ? "bg-gray-200" 
                          : hasPlayed
                            ? "bg-primary-600"
                            : "bg-primary-500"
                      } ${isPlaying && isUnlocked ? "animate-wave-pulse" : ""}`}
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
            {!roundOver && (
              <div className="w-full max-w-md mb-8">
                <Autocomplete onSelect={handleGuess} disabled={roundOver} />
                <p className="text-sm text-gray-500 mt-3 text-center font-sans">
                  Attempt <span className="font-semibold text-dark">{currentAttempt + 1}</span> of <span className="font-semibold text-dark">{MAX_ATTEMPTS}</span> · <span className="font-semibold text-dark">{SNIPPET_DURATIONS[currentAttempt]}s</span> unlocked
                </p>
              </div>
            )}
            {roundOver && (
              <div className="w-full max-w-md mb-8 text-center">
                <div className="mb-4">
                  <p className="text-xl font-bold text-dark mb-2">
                    {won ? "🎉 Correct!" : "😔 Incorrect"}
                  </p>
                  <p className="text-lg font-semibold text-dark">{track.name}</p>
                  <p className="text-md text-gray-600">{track.artists.join(", ")}</p>
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
            <div className="w-full max-w-md mb-8">
              <h3 className="text-base font-bold mb-4 text-dark uppercase tracking-wide">Your Guesses</h3>
              <div className="space-y-2">
                {guesses.map((guess, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded border-2 flex items-center justify-between text-sm font-sans font-medium transition-all duration-200 ${
                      guess.correct
                        ? "bg-correct-light border-correct text-dark"
                        : "bg-wrong-light border-wrong text-dark"
                    }`}
                  >
                    <span className="flex-1">{guess.guess}</span>
                    <span className="text-lg ml-2">{guess.correct ? "✓" : "✗"}</span>
                  </div>
                ))}
                {[...Array(MAX_ATTEMPTS - guesses.length)].map((_, i) => (
                  <div
                    key={`remaining-${i}`}
                    className="p-4 rounded border-2 border-gray-300 bg-white text-gray-400 text-sm font-sans"
                  >
                    Attempt {guesses.length + i + 1} of {MAX_ATTEMPTS}
                  </div>
                ))}
              </div>
            </div>
            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogContent className="max-w-[85vw] sm:max-w-md bg-white border-2 border-gray-300 text-dark font-sans shadow-lg rounded">
                <DialogTitle className="sr-only">
                  {won ? "Congratulations!" : "Game Over"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {won ? `You guessed the song correctly in ${guesses.length} attempts` : "You did not guess the song correctly"}
                </DialogDescription>
                <div className="text-4xl sm:text-5xl mb-3 text-center">🎉</div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center text-dark font-sans">
                  Game Complete!
                </h2>
                <p className="text-lg font-semibold text-center text-dark mb-6">
                  Final Score: {score}/{maxRounds * 5}
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={handlePlayAgain}
                    className="flex-1 text-white bg-dark hover:bg-gray-600 font-sans font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded transition-all duration-150 cursor-pointer"
                  >
                    Play Again
                  </Button>
                  <Link to="/" className="flex-1">
                    <Button
                      className="w-full font-sans font-semibold py-2.5 sm:py-3 text-sm sm:text-base bg-white text-dark border-2 border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                    >
                      Home
                    </Button>
                  </Link>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
      <footer className="w-full py-4 text-center text-sm text-gray-400 bg-white border-t border-gray-200 font-sans">
        <span className="text-dark font-semibold">Beatdle</span> © 2026 · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </footer>
    </div>
  );
}
