'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { SpotifyTrack } from '@/types';

interface ResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  won: boolean;
  guesses: { correct: boolean; guess: string }[];
  maxAttempts: number;
  track: SpotifyTrack;
  onShare: () => void;
  copied: boolean;
}

export default function ResultModal({
  open,
  onOpenChange,
  won,
  guesses,
  track,
  onShare,
  copied,
}: ResultModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[85vw] sm:max-w-md bg-white border-2 border-gray-300 text-dark font-sans shadow-lg rounded">
        <DialogTitle className="sr-only">
          {won ? 'Congratulations!' : 'Game Over'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {won
            ? `You guessed the song correctly in ${guesses.length} attempts`
            : 'You did not guess the song correctly'}
        </DialogDescription>

        <div className="text-4xl sm:text-5xl mb-3 text-center">{won ? '🎉' : '😔'}</div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-dark font-sans">
          {won
            ? `You got it in ${guesses.length} ${guesses.length === 1 ? 'try' : 'tries'}!`
            : 'Better luck next time!'}
        </h2>

        <Button
          onClick={onShare}
          className={`mb-4 sm:mb-6 w-full text-white bg-correct hover:bg-green-700 font-sans font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded transition-all duration-150 cursor-pointer ${copied ? 'opacity-75' : ''}`}
        >
          {copied ? 'Copied to Clipboard!' : 'Share Results'}
        </Button>

        <div className="bg-gray-100 border border-gray-300 rounded p-3 sm:p-4 text-center">
          <Image
            src={track.album.image}
            alt={track.name}
            width={112}
            height={112}
            className="mx-auto rounded shadow mb-2 sm:mb-3"
          />
          <p className="text-base sm:text-lg font-bold text-dark font-sans">{track.name}</p>
          <p className="text-sm sm:text-base text-gray-500 font-sans mt-1">{track.artists.join(', ')}</p>
          <p className="text-xs sm:text-sm text-gray-400 font-sans mt-1">{track.album.name}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
