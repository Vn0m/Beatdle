interface Guess {
  correct: boolean;
  guess: string;
}

interface GuessGridProps {
  guesses: Guess[];
  maxAttempts: number;
}

export default function GuessGrid({ guesses, maxAttempts }: GuessGridProps) {
  return (
    <div className="w-full max-w-md mb-8">
      <h3 className="text-base font-bold mb-4 text-dark uppercase tracking-wide">Your Guesses</h3>
      <div className="space-y-2">
        {guesses.map((guess, i) => (
          <div
            key={i}
            className={`p-4 rounded border-2 flex items-center justify-between text-sm font-sans font-medium transition-all duration-200 ${
              guess.correct
                ? 'bg-correct-light border-correct text-dark'
                : 'bg-wrong-light border-wrong text-dark'
            }`}
          >
            <span className="flex-1">{guess.guess}</span>
            <span className="text-lg ml-2">{guess.correct ? '✓' : '✗'}</span>
          </div>
        ))}
        {[...Array(maxAttempts - guesses.length)].map((_, i) => (
          <div
            key={`remaining-${i}`}
            className="p-4 rounded border-2 border-gray-300 bg-white text-gray-400 text-sm font-sans"
          >
            Attempt {guesses.length + i + 1} of {maxAttempts}
          </div>
        ))}
      </div>
    </div>
  );
}
