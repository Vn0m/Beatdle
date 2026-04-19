'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { HelpCircle, Headphones, Clock, Search, Share2, Menu, X, Music, Award, User, Users, Plus, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAvatarColor, getAvatarUrl } from '@/lib/avatar';

function NavMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, signOut } = useAuth();
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || '';
  const avatarUrl = getAvatarUrl(user?.user_metadata);
  const avatarColor = getAvatarColor(username);

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 border-l border-gray-200 transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <nav className="flex flex-col h-full font-sans">

          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <span className="text-lg font-bold text-dark" style={{ fontFamily: 'Georgia, Times, serif' }}>Menu</span>
            <button onClick={onClose} className="text-gray-400 hover:text-dark transition-colors cursor-pointer" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          {user && (
            <Link
              href={`/profile/${user.id}`}
              onClick={onClose}
              className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt={username} width={40} height={40} className="w-10 h-10 rounded-full shrink-0 object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0" style={{ backgroundColor: avatarColor }}>
                  {username?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-dark truncate">{username}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </Link>
          )}

          <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <Link href="/daily" onClick={onClose} className="flex items-center gap-3 text-dark text-base font-semibold px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Music className="h-4 w-4 text-[#1C1C1E]" /> Daily Challenge
            </Link>
            <Link href="/custom" onClick={onClose} className="flex items-center gap-3 text-dark text-base font-semibold px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Music className="h-4 w-4 text-gray-400" /> Custom Game
            </Link>
            <Link href="/multiplayer/create" onClick={onClose} className="flex items-center gap-3 text-dark text-base font-semibold px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Plus className="h-4 w-4 text-gray-400" /> Create Lobby
            </Link>
            <Link href="/multiplayer/join" onClick={onClose} className="flex items-center gap-3 text-dark text-base font-semibold px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-4 w-4 text-gray-400" /> Join Lobby
            </Link>

            <div className="h-px bg-gray-100 my-2" />

            <Link href="/leaderboard" onClick={onClose} className="flex items-center gap-3 text-dark text-base font-semibold px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Award className="h-4 w-4 text-gray-400" /> Leaderboard
            </Link>
          </div>

          <div className="px-4 py-4 border-t border-gray-100">
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 text-gray-500 text-base font-semibold px-3 py-3 rounded-lg hover:bg-gray-50 hover:text-dark transition-colors w-full text-left cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Log Out
              </button>
            ) : (
              <Link href="/login" onClick={onClose} className="flex items-center gap-3 text-gray-500 text-base font-semibold px-3 py-3 rounded-lg hover:bg-gray-50 hover:text-dark transition-colors">
                <LogIn className="h-4 w-4" /> Log In
              </Link>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

export default function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const { user, loading } = useAuth();

  const username = user?.user_metadata?.username || user?.email?.split('@')[0];

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200 font-sans">
        <div className="max-w-3xl mx-auto px-4 h-14 grid grid-cols-3 items-center">
          <div className="flex items-center">
            <button
              title="How to Play"
              className="flex items-center group cursor-pointer p-1"
              onClick={() => setShowHowTo(true)}
            >
              <HelpCircle className="h-6 w-6 text-gray-400 group-hover:text-dark transition-colors" />
            </button>
          </div>

          <Link href="/" className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-dark tracking-tight" style={{ fontFamily: 'Georgia, Times, serif' }}>
              Beatdle
            </h1>
          </Link>

          <div className="flex items-center justify-end gap-3">
            <button
              title="Menu"
              className="flex items-center group cursor-pointer p-1"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-6 w-6 text-gray-400 group-hover:text-dark transition-colors" />
            </button>
          </div>
        </div>
      </header>

      <NavMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <Dialog open={showHowTo} onOpenChange={setShowHowTo}>
        <DialogContent className="max-w-[85vw] sm:max-w-sm bg-white border border-gray-200 text-dark font-sans shadow-xl rounded-xl p-6">
          <DialogTitle className="text-xl font-bold mb-4 text-center" style={{ fontFamily: 'Georgia, Times, serif' }}>How to Play</DialogTitle>
          <DialogDescription className="sr-only">Instructions for playing Beatdle</DialogDescription>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <Headphones className="h-5 w-5 text-[#1C1C1E] shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">Listen to the audio snippet</p>
            </div>
            <div className="flex gap-3 items-start">
              <Clock className="h-5 w-5 text-[#1C1C1E] shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">You get 5 tries — each reveals more audio</p>
            </div>
            <div className="flex gap-3 items-start">
              <Search className="h-5 w-5 text-[#1C1C1E] shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">Type your guess and select from suggestions</p>
            </div>
            <div className="flex gap-3 items-start">
              <Share2 className="h-5 w-5 text-[#1C1C1E] shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">Share your results. New song every day!</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
