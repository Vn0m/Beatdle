'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';

export default function JoinLobbyPage() {
  const [name, setName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const router = useRouter();

  const joinLobby = () => {
    const trimmedName = name.trim();
    const trimmedCode = lobbyCode.trim().toUpperCase();
    if (!trimmedName || !trimmedCode) return;
    router.push(`/multiplayer/${trimmedCode}?name=${encodeURIComponent(trimmedName)}`);
  };

  const canJoin = name.trim() !== '' && lobbyCode.trim() !== '';

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-dark">
      <AppHeader />
      <main className="flex flex-col items-center justify-center grow px-4">
        <div className="w-full max-w-xs">

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-dark" style={{ fontFamily: 'Georgia, Times, serif' }}>
              Join Lobby
            </h1>
            <p className="text-sm text-gray-400 mt-1">Enter a code to join a game</p>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:border-[#1C1C1E] transition-colors placeholder:text-gray-300"
              autoFocus
            />
            <input
              type="text"
              placeholder="Lobby code"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && joinLobby()}
              className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm font-bold tracking-widest text-center focus:outline-none focus:border-[#1C1C1E] transition-colors placeholder:text-gray-300 placeholder:font-normal placeholder:tracking-normal"
              maxLength={5}
            />
            <button
              onClick={joinLobby}
              disabled={!canJoin}
              className="w-full h-11 bg-[#1C1C1E] hover:bg-[#0A0A0A] text-white rounded-full text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Lobby
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
