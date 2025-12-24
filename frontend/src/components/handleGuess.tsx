import type { SpotifyTrack } from "./types"; 

export function handleGuess(
  guess: string,
  track: SpotifyTrack,
  guesses: string[],
  setGuesses: (val: string[]) => void,
  setGameOver: (val: boolean) => void
) {
  if (!track) return;

  const correct = guess.trim().toLowerCase() === track.name.toLowerCase();
  setGuesses([...guesses, correct ? "correct" : "wrong"]);

  if (correct || guesses.length + 1 >= 5) {
    setGameOver(true);
  }

  return correct;
}
