import { CheckCircle2, XCircle } from 'lucide-react';

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
      {guesses.length > 0 && (
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Your Guesses</p>
      )}
      <div className="space-y-2">
        {guesses.map((guess, i) => (
          <div
            key={i}
            className={`px-4 py-3 rounded-xl flex items-center justify-between text-sm font-medium transition-all duration-200 ${
              guess.correct
                ? 'bg-[#e8f5e6] border border-[#6aaa64] text-dark'
                : 'bg-[#fee2e2] border border-red-300 text-dark'
            }`}
          >
            <span className="flex-1 truncate">{guess.guess}</span>
            {guess.correct
              ? <CheckCircle2 className="ml-3 w-4 h-4 shrink-0 text-[#6aaa64]" />
              : <XCircle className="ml-3 w-4 h-4 shrink-0 text-red-400" />
            }
          </div>
        ))}
        {[...Array(maxAttempts - guesses.length)].map((_, i) => (
          <div
            key={`remaining-${i}`}
            className="px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-300 text-sm"
          >
            Attempt {guesses.length + i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
