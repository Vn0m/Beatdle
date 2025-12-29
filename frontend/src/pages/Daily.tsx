import { useEffect, useState } from "react";
import { fetchDailySong, type TrackSuggestion } from "../api/spotify";
import type { SpotifyTrack } from "../types";
import Autocomplete from "../components/Autocomplete";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { MAX_ATTEMPTS, SNIPPET_DURATIONS } from "../constants";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

export default function Daily() {
  const navigate = useNavigate();
  
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [guesses, setGuesses] = useState<{ correct: boolean; guess: string }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const duration = SNIPPET_DURATIONS[currentAttempt] || 15;
  const { audioRef, isPlaying, play, playFullSong } = useAudioPlayer({
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

  // NEW: Function to generate the emoji grid for sharing
  const generateShareGrid = () => {
    if (!track) return "";
    
    // Create the Heardle-style 1-line grid
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

    // Get a unique-ish ID for the day (last 5 chars of track ID)
    const dailyId = track.id.slice(-5);
    const tries = won ? guesses.length : "X";
    
    return `Beatdle #${dailyId} ${tries}/${MAX_ATTEMPTS}\n\n${grid}`;
  };

  // NEW: Function to copy the results to the clipboard
  const handleShare = async () => {
    const gridText = generateShareGrid();
    try {
      // Use the modern Clipboard API
      await navigator.clipboard.writeText(gridText);
      setCopied(true);
      // Reset the "Copied!" message after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy results: ", err);
      alert("Failed to copy results. You may need to grant clipboard permissions.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-2xl">Loading today's song...</div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-2xl">Failed to load song. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-emerald-400">🎵 Daily Challenge</h1>
        <Button onClick={() => navigate("/")} className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">
          Back
        </Button>
      </div>

      {/* Hidden audio element */}
      {track.previewUrl && (
        <audio ref={audioRef} src={track.previewUrl} />
      )}

      {/* Play Button */}
      <button
        onClick={play}
        disabled={isPlaying || gameOver}
        className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-6 transition ${
          isPlaying
            ? "bg-zinc-800 cursor-not-allowed"
            : gameOver && won
            ? "bg-zinc-800" 
            : gameOver && !won
            ? "bg-zinc-800 cursor-not-allowed"
            : "bg-zinc-800 hover:bg-zinc-700"
        }`}
      >
        {isPlaying ? "⏸" : "▶️"}
      </button>

      {/* Waveform visualization */}
      <div className="flex gap-1 mb-8 h-16 items-end">
        {[...Array(30)].map((_, i) => {
          // Adjust logic to correctly show the *current* snippet length, not the next one
          const currentDuration = SNIPPET_DURATIONS[currentAttempt] || 0;
          const isUnlocked = i < (currentDuration / 15) * 30; // 15s is max, 30 bars
          return (
            <div
              key={i}
              className={`w-2 rounded-t ${
                isUnlocked ? "bg-emerald-500" : "bg-zinc-800"
              }`}
              style={{
                height: `${20 + Math.random() * 80}%`,
              }}
            />
          );
        })}
      </div>

      {/* Search/Autocomplete */}
      {!gameOver && (
        <div className="w-full max-w-md mb-8">
          <Autocomplete onSelect={handleGuess} disabled={gameOver} />
          <p className="text-sm text-gray-400 mt-2 text-center">
            Attempt {currentAttempt + 1} of {MAX_ATTEMPTS} • {SNIPPET_DURATIONS[currentAttempt]}s unlocked
          </p>
        </div>
      )}

      {/* View Results Button */}
      {gameOver && (
        <Button 
          onClick={() => setShowModal(true)} 
          className="mb-6 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
        >
          View Results
        </Button>
      )}

      {/* Guess History */}
      <div className="w-full max-w-2xl mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-300">Your Guesses</h3>
        <div className="space-y-2">
          {guesses.map((guess, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border-2 flex items-center justify-between ${
                guess.correct
                  ? "bg-emerald-600/20 border-emerald-500"
                  : "bg-red-600/20 border-red-500"
              }`}
            >
              <span className="text-sm">{guess.guess}</span>
              <span className="text-xl">{guess.correct ? "✅" : "❌"}</span>
            </div>
          ))}
          {/* Show remaining attempts */}
          {[...Array(MAX_ATTEMPTS - guesses.length)].map((_, i) => (
            <div
              key={`remaining-${i}`}
              className="p-3 rounded-lg border-2 border-zinc-800 bg-zinc-900/50 text-zinc-600 text-sm"
            >
              Attempt {guesses.length + i + 1} of {MAX_ATTEMPTS}
            </div>
          ))}
        </div>
      </div>

      {/* Game Over Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <div className="text-4xl mb-4 text-center">{won ? "🎉" : "😢"}</div>
          <h2 className="text-2xl font-bold mb-4 text-center">
            {won ? `You got it in ${guesses.length} ${guesses.length === 1 ? "try" : "tries"}!` : "Game Over!"}
          </h2>

          <Button
            onClick={handleShare}
            className={`mb-6 w-full text-white border border-zinc-700 ${copied ? "bg-zinc-700" : "bg-zinc-800 hover:bg-zinc-700"}`}
          >
            {copied ? "Copied!" : "Share Results"}
          </Button>
          
          {/* Answer details */}
          {track && (
            <div className="bg-black border border-zinc-800 rounded-lg p-4">
              <img
                src={track.album.image}
                alt={track.name}
                className="w-32 h-32 mx-auto rounded mb-3"
              />
              <p className="text-xl font-bold">{track.name}</p>
              <p className="text-gray-400">{track.artists.join(", ")}</p>
              <p className="text-sm text-gray-500 mt-1">{track.album.name}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}