'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

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
      <main className="flex flex-col items-center justify-center grow p-4">
        <div className="w-full max-w-md flex flex-col items-center space-y-8">
          <div className="w-24 h-24 mx-auto flex items-center justify-center">
            <Image src="/Beatdle_Logo.png" alt="Beatdle Logo" width={96} height={96} className="object-contain" />
          </div>

          <h1 className="text-2xl font-bold text-dark">Join Lobby</h1>

          <div className="w-full flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded border-2 border-gray-300 bg-white text-dark font-sans text-base focus:border-gray-500 focus:outline-none transition-colors placeholder:text-gray-400"
              autoFocus
            />
            <input
              type="text"
              placeholder="Lobby code"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && joinLobby()}
              className="w-full px-4 py-3.5 rounded border-2 border-gray-300 bg-white text-dark font-sans text-base focus:border-gray-500 focus:outline-none transition-colors placeholder:text-gray-400 uppercase tracking-wider"
              maxLength={5}
            />
            <Button
              onClick={joinLobby}
              disabled={!canJoin}
              className="w-full h-14 text-lg font-semibold bg-dark hover:bg-gray-600 text-white rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Lobby
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
