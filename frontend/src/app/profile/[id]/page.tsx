'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import { API_URL } from '@/config/constants';

interface UserProfile {
  user_id: number;
  username: string;
  created_at: string;
  games_played: number;
  games_won: number;
  current_streak: number;
  max_streak: number;
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/${id}`);
        if (!response.ok) throw new Error('Profile not found');
        const data: UserProfile = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white text-dark font-sans">
        Loading profile...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white text-dark font-sans">
        <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
        <Link href="/" className="text-gray-500 hover:text-dark transition-colors">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-dark font-sans">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-lg bg-white border-2 border-gray-300 rounded shadow p-8">
          <h1 className="text-3xl font-bold mb-2 text-center text-dark">{user.username}</h1>
          <p className="text-gray-500 mb-8 text-center text-sm">
            Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border-2 border-gray-300 p-5 rounded text-center hover:border-primary-500 transition-colors">
              <div className="text-3xl font-bold text-dark">{user.games_played}</div>
              <div className="text-sm text-gray-500 mt-1 uppercase tracking-wide font-semibold">Games Played</div>
            </div>
            <div className="bg-white border-2 border-gray-300 p-5 rounded text-center hover:border-primary-500 transition-colors">
              <div className="text-3xl font-bold text-dark">{user.games_won}</div>
              <div className="text-sm text-gray-500 mt-1 uppercase tracking-wide font-semibold">Games Won</div>
            </div>
            <div className="bg-white border-2 border-gray-300 p-5 rounded text-center hover:border-primary-500 transition-colors">
              <div className="text-3xl font-bold text-primary-500">{user.current_streak}</div>
              <div className="text-sm text-gray-500 mt-1 uppercase tracking-wide font-semibold">Current Streak</div>
            </div>
            <div className="bg-white border-2 border-gray-300 p-5 rounded text-center hover:border-primary-500 transition-colors">
              <div className="text-3xl font-bold text-primary-500">{user.max_streak}</div>
              <div className="text-sm text-gray-500 mt-1 uppercase tracking-wide font-semibold">Max Streak</div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
