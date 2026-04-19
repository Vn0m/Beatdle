'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

export default function CreateLobbyPage() {
  const [name, setName] = useState('');
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-dark">
      <AppHeader />
      <main className="flex flex-col items-center justify-center grow" />
      <Footer />
    </div>
  );

  if (!user) return null;

  const createLobby = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    router.push(`/multiplayer/${code}?host=true&name=${encodeURIComponent(trimmedName)}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-dark">
      <AppHeader />
      <main className="flex flex-col items-center justify-center grow px-4">
        <div className="w-full max-w-xs">

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-dark" style={{ fontFamily: 'Georgia, Times, serif' }}>
              Create Lobby
            </h1>
            <p className="text-sm text-gray-400 mt-1">Host a game for your friends</p>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createLobby()}
              className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:border-[#1C1C1E] transition-colors placeholder:text-gray-300"
              autoFocus
            />
            <button
              onClick={createLobby}
              disabled={!name.trim()}
              className="w-full h-11 bg-[#1C1C1E] hover:bg-[#0A0A0A] text-white rounded-full text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Lobby
            </button>
            <Link href="/" className="w-full">
              <button className="w-full h-11 font-semibold text-sm bg-white text-gray-500 border border-gray-200 rounded-full hover:border-gray-400 hover:text-dark transition-colors cursor-pointer">
                Cancel
              </button>
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
