'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { HelpCircle, Headphones, Clock, Search, Share2, Menu, X, Music, Award, User, Users, Plus } from 'lucide-react';

function NavMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black opacity-30 z-40" onClick={onClose} />
      )}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 border-l border-gray-200 transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <nav className="flex flex-col p-6 font-sans">
          <button
            onClick={onClose}
            className="self-end text-dark mb-6 hover:text-primary-500 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="space-y-2">
            <Link href="/daily" onClick={onClose} className="flex items-center gap-3 text-dark text-base font-semibold p-3 rounded hover:bg-gray-100 transition-colors">
              <Music className="h-5 w-5" /> Daily Challenge
            </Link>
            <Link href="/multiplayer/create" onClick={onClose} className="flex items-center gap-3 text-dark text-base font-semibold p-3 rounded hover:bg-gray-100 transition-colors">
              <Plus className="h-5 w-5" /> Create Lobby
            </Link>
            <Link href="/multiplayer/join" onClick={onClose} className="flex items-center gap-3 text-dark text-base font-semibold p-3 rounded hover:bg-gray-100 transition-colors">
              <Users className="h-5 w-5" /> Join Lobby
            </Link>
            <div className="border-t border-gray-200 my-4" />
            <Link href="/leaderboard" onClick={onClose} className="flex items-center gap-3 text-dark text-base font-semibold p-3 rounded hover:bg-gray-100 transition-colors">
              <Award className="h-5 w-5" /> Leaderboard
            </Link>
            <Link href="/profile" onClick={onClose} className="flex items-center gap-3 text-dark text-base font-semibold p-3 rounded hover:bg-gray-100 transition-colors">
              <User className="h-5 w-5" /> Profile
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}

export default function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  return (
    <>
      <header className="w-full flex justify-center items-center bg-white border-b border-gray-200 font-sans">
        <nav className="w-full max-w-3xl grid grid-cols-3 items-center px-4 py-4">
          <div className="flex items-center">
            <button
              title="How to Play"
              className="flex items-center group cursor-pointer"
              onClick={() => setShowHowTo(true)}
            >
              <HelpCircle className="h-6 w-6 text-dark group-hover:text-primary-500 transition-colors" />
            </button>
          </div>

          <Link href="/" className="flex items-center justify-center group">
            <h1 className="text-3xl font-bold text-dark tracking-tight" style={{ fontFamily: 'Georgia, Times, serif' }}>
              Beatdle
            </h1>
          </Link>

          <div className="flex items-center justify-end">
            <button
              title="Menu"
              className="flex items-center group cursor-pointer"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-6 w-6 text-dark group-hover:text-primary-500 transition-colors" />
            </button>
          </div>
        </nav>
      </header>

      <NavMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <Dialog open={showHowTo} onOpenChange={setShowHowTo}>
        <DialogContent className="max-w-[85vw] sm:max-w-lg bg-white border-2 border-gray-300 text-dark font-sans shadow-lg rounded p-6 sm:p-8">
          <DialogTitle className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">How to Play</DialogTitle>
          <DialogDescription className="sr-only">Instructions for playing Beatdle</DialogDescription>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex gap-3 sm:gap-4 items-center">
              <Headphones className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 shrink-0" />
              <p className="text-sm sm:text-base">Listen to the audio snippet</p>
            </div>
            <div className="flex gap-3 sm:gap-4 items-center">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 shrink-0" />
              <p className="text-sm sm:text-base">You get 5 tries, each unlocks more audio</p>
            </div>
            <div className="flex gap-3 sm:gap-4 items-center">
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 shrink-0" />
              <p className="text-sm sm:text-base">Type your guess and select from suggestions</p>
            </div>
            <div className="flex gap-3 sm:gap-4 items-center">
              <Share2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 shrink-0" />
              <p className="text-sm sm:text-base">Share your results. New song daily!</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
