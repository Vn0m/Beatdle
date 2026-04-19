'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

export default function HomeClient() {
  const [showMultiplayerDropdown, setShowMultiplayerDropdown] = useState(false);
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-dark">
      <AppHeader />

      <main className="flex flex-col items-center justify-center grow px-4 py-12">
        <div className="flex flex-col items-center w-full max-w-xs">

          <div className="mb-8 text-center">
            <Image src="/Beatdle_Logo.png" alt="Beatdle" width={72} height={72} className="mx-auto mb-4 object-contain" priority />
            <p className="text-xs text-gray-500 tracking-wide uppercase font-semibold mb-1">Daily Music Game</p>
            <p className="text-gray-400 text-sm">Guess the song in 5 tries</p>
          </div>

          <div className="w-full space-y-3">
            <Link href="/daily" className="block">
              <button className="w-full h-12 text-sm font-bold bg-[#1C1C1E] hover:bg-[#0A0A0A] text-white rounded-full transition-colors cursor-pointer tracking-wide">
                Play Daily
              </button>
            </Link>

            <div className="relative w-full">
              <button
                onClick={() => setShowMultiplayerDropdown(!showMultiplayerDropdown)}
                className="w-full h-12 text-sm font-bold bg-white text-dark border-2 border-gray-200 rounded-full hover:border-gray-400 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 tracking-wide"
              >
                Multiplayer
                <ChevronDown className="w-4 h-4" />
              </button>
              {showMultiplayerDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMultiplayerDropdown(false)} />
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-lg z-20 overflow-hidden">
                    <Link
                      href="/multiplayer/create"
                      onClick={() => setShowMultiplayerDropdown(false)}
                      className="block w-full px-4 py-3 text-sm font-semibold text-dark hover:bg-gray-50 transition-colors"
                    >
                      Create Lobby
                    </Link>
                    <div className="h-px bg-gray-100" />
                    <Link
                      href="/multiplayer/join"
                      onClick={() => setShowMultiplayerDropdown(false)}
                      className="block w-full px-4 py-3 text-sm font-semibold text-dark hover:bg-gray-50 transition-colors"
                    >
                      Join Lobby
                    </Link>
                  </div>
                </>
              )}
            </div>

            <Link href="/custom" className="block">
              <button className="w-full h-12 text-sm font-bold bg-white text-dark border-2 border-gray-200 rounded-full hover:border-gray-400 transition-colors cursor-pointer tracking-wide">
                Custom Game
              </button>
            </Link>
          </div>

          {!loading && !user && (
            <div className="flex items-center gap-4 mt-6 text-sm text-gray-400">
              <Link href="/login" className="hover:text-dark transition-colors">Log in</Link>
              <span>·</span>
              <Link href="/signup" className="hover:text-dark transition-colors">Sign up</Link>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
