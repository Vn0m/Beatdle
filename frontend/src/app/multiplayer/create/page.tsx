'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function CreateLobbyPage() {
  const [name, setName] = useState('');
  const router = useRouter();

  const createLobby = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    router.push(`/multiplayer/${code}?host=true&name=${encodeURIComponent(trimmedName)}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-dark">
      <AppHeader />
      <main className="flex flex-col items-center justify-center grow p-4">
        <div className="w-full max-w-md flex flex-col items-center space-y-8">
          <div className="w-24 h-24 mx-auto flex items-center justify-center">
            <Image src="/Beatdle_Logo.png" alt="Beatdle Logo" width={96} height={96} className="object-contain" />
          </div>

          <h1 className="text-2xl font-bold text-dark">Create Lobby</h1>

          <div className="w-full flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createLobby()}
              className="w-full px-4 py-3.5 rounded border-2 border-gray-300 bg-white text-dark font-sans text-base focus:border-gray-500 focus:outline-none transition-colors placeholder:text-gray-400"
              autoFocus
            />
            <Button
              onClick={createLobby}
              disabled={!name.trim()}
              className="w-full h-14 text-lg font-semibold bg-dark hover:bg-gray-600 text-white rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Lobby
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
