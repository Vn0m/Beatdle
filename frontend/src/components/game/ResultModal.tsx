'use client';

import Image from 'next/image';
import { Share2 } from 'lucide-react';
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
      <DialogContent className="max-w-[85vw] sm:max-w-sm bg-white border border-gray-200 text-dark font-sans shadow-xl rounded-2xl p-6">
        <DialogTitle className="sr-only">
          {won ? 'Congratulations!' : 'Game Over'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {won
            ? `You guessed the song correctly in ${guesses.length} attempts`
            : 'You did not guess the song correctly'}
        </DialogDescription>

        <div className="text-4xl mb-3 text-center">{won ? '🎉' : '😔'}</div>
        <h2 className="text-lg font-bold mb-1 text-center text-dark" style={{ fontFamily: 'Georgia, Times, serif' }}>
          {won
            ? `Got it in ${guesses.length} ${guesses.length === 1 ? 'try' : 'tries'}!`
            : 'Better luck tomorrow!'}
        </h2>

        <div className="flex flex-col items-center my-5 bg-gray-50 rounded-2xl p-4">
          <Image
            src={track.album.image}
            alt={track.name}
            width={96}
            height={96}
            className="rounded-xl shadow-sm mb-3"
          />
          <p className="text-base font-bold text-dark text-center">{track.name}</p>
          <p className="text-sm text-gray-500 mt-0.5 text-center">{track.artists.join(', ')}</p>
          <p className="text-xs text-gray-400 mt-0.5 text-center">{track.album.name}</p>
        </div>

        <Button
          onClick={onShare}
          className={`w-full h-11 text-white bg-[#1C1C1E] hover:bg-[#0A0A0A] font-semibold text-sm rounded-full transition-all cursor-pointer ${copied ? 'opacity-75' : ''}`}
        >
          <Share2 className="w-4 h-4 mr-2" />
          {copied ? 'Copied!' : 'Share Results'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
