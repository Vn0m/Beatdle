import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import { fetchDailySong, type TrackSuggestion } from "../api/spotify";
import type { SpotifyTrack } from "../types";
import Autocomplete from "../components/Autocomplete";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MAX_ATTEMPTS, SNIPPET_DURATIONS } from "../constants";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import AdUnit from "../components/AdUnit";

export default function Daily() {
  
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [guesses, setGuesses] = useState<{ correct: boolean; guess: string }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const duration = gameOver ? 15 : (SNIPPET_DURATIONS[currentAttempt] || 15);
  const { audioRef, isPlaying, currentTime, play, pause, playFullSong } = useAudioPlayer({
    previewUrl: track?.previewUrl || null,
    duration,
  });

  useEffect(() => {
    loadDailySong();
  }, []);

  const loadDailySong = async () => {
    try {
      setLoading(true);
      const data = await fetchDailySong();
      setTrack(data);
    } catch (error) {
      console.error("Failed to load daily song:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = (selectedTrack: TrackSuggestion) => {
    if (gameOver || !track) return;

    const isCorrect = selectedTrack.id === track.id;
    
    setGuesses([...guesses, { correct: isCorrect, guess: `${selectedTrack.name} - ${selectedTrack.artists.join(", ")}` }]);

    if (isCorrect) {
      setWon(true);
      setGameOver(true);
      setShowModal(true);
      playFullSong();
    } else if (currentAttempt + 1 >= MAX_ATTEMPTS) {
      setGameOver(true);
      setShowModal(true);
      setWon(false);
    } else {
      setCurrentAttempt(currentAttempt + 1);
    }
  };

  const generateShareGrid = () => {
    if (!track) return "";
    
    let grid = "";
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const guess = guesses[i];
      if (guess && guess.correct) {
        grid += "🟩";
      } else if (guess && !guess.correct) {
        grid += "🟥";
      } else {
        grid += "⬜️";
      }
    }

    const dailyId = track.id.slice(-5);
    const tries = won ? guesses.length : "X";
    
    return `Beatdle #${dailyId} ${tries}/${MAX_ATTEMPTS}\n\n${grid}`;
  };

  const handleShare = async () => {
    const gridText = generateShareGrid();
    try {
      await navigator.clipboard.writeText(gridText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy results: ", err);
      alert("Failed to copy results. You may need to grant clipboard permissions.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-dark font-sans">
        <div className="text-xl font-medium">Loading today's song...</div>
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
      <div className="hidden lg:block w-full py-2">
        <div className="max-w-7xl mx-auto px-4">
          <AdUnit 
            adSlot={import.meta.env.VITE_ADSENSE_SLOT_POST_GAME}
            style={{ display: 'block', minHeight: '90px' }}
          />
        </div>
      </div>
      <AppHeader />
      <main className="flex grow">
        <div className="hidden lg:block w-48 xl:w-60 sticky top-0 h-screen">
          <div className="p-4 flex items-center justify-center" style={{ height: '100%' }}>
            <AdUnit 
              adSlot={import.meta.env.VITE_ADSENSE_SLOT_LEADERBOARD}
              style={{ display: 'block', minHeight: '600px', width: '100%' }}
            />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-start py-8 px-4">
          <div className="w-full max-w-lg mx-auto">
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
            {!gameOver && (
              <div className="w-full max-w-md mb-8">
                <Autocomplete onSelect={handleGuess} disabled={gameOver} />
                <p className="text-sm text-gray-500 mt-3 text-center font-sans">
                  Attempt <span className="font-semibold text-dark">{currentAttempt + 1}</span> of <span className="font-semibold text-dark">{MAX_ATTEMPTS}</span> · <span className="font-semibold text-dark">{SNIPPET_DURATIONS[currentAttempt]}s</span> unlocked
                </p>
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
              <div className="text-4xl sm:text-5xl mb-3 text-center">{won ? "🎉" : "😔"}</div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-dark font-sans">
                {won ? `You got it in ${guesses.length} ${guesses.length === 1 ? "try" : "tries"}!` : "Better luck next time!"}
              </h2>
              <Button
                onClick={handleShare}
                className={`mb-4 sm:mb-6 w-full text-white bg-correct hover:bg-green-700 font-sans font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded transition-all duration-150 cursor-pointer ${copied ? "opacity-75" : ""}`}
              >
                {copied ? "Copied to Clipboard!" : "Share Results"}
              </Button>
              {track && (
                <div className="bg-gray-100 border border-gray-300 rounded p-3 sm:p-4 text-center">
                  <img
                    src={track.album.image}
                    alt={track.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded shadow mb-2 sm:mb-3"
                  />
                  <p className="text-base sm:text-lg font-bold text-dark font-sans">{track.name}</p>
                  <p className="text-sm sm:text-base text-gray-500 font-sans mt-1">{track.artists.join(", ")}</p>
                  <p className="text-xs sm:text-sm text-gray-400 font-sans mt-1">{track.album.name}</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
          </div>
        </div>
        </div>
        
        <div className="hidden lg:block w-48 xl:w-60 sticky top-0 h-screen">
          <div className="p-4 flex items-center justify-center" style={{ height: '100%' }}>
            <AdUnit 
              adSlot={import.meta.env.VITE_ADSENSE_SLOT_HOME_BANNER}
              style={{ display: 'block', minHeight: '600px', width: '100%' }}
            />
          </div>
        </div>
      </main>
      <footer className="w-full py-4 text-center text-sm text-gray-400 bg-white border-t border-gray-200 font-sans">
        <span className="text-dark font-semibold">Beatdle</span> © 2026 · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </footer>
    </div>
  );
}