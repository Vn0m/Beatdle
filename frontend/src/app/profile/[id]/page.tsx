'use client';

import { use, useEffect, useState, type ReactNode } from 'react';
import { Music2, Trophy, Flame, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import { API_URL } from '@/config/constants';
import { useAuth } from '@/context/AuthContext';
import { getAvatarColor, getAvatarUrl } from '@/lib/avatar';

interface GameTypeStats {
  games_played: number;
  games_won: number;
}

interface UserStats {
  games_played: number;
  games_won: number;
  current_streak: number;
  best_streak: number;
  total_attempts: number;
  guess_distribution: Record<string, number>;
}

interface UserProfile {
  id: string;
  username: string;
  created_at: string;
  stats: UserStats | null;
  daily: GameTypeStats | null;
  custom: GameTypeStats | null;
}

function StatTile({ value, label, sublabel, icon }: { value: string | number; label: string; sublabel?: string; icon?: ReactNode }) {
  return (
    <div className="text-center py-4">
      <div className="text-3xl font-bold text-dark">{value}</div>
      <div className="flex items-center justify-center gap-1.5 mt-1.5">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      {sublabel && <div className="text-[10px] text-gray-400 mt-0.5">{sublabel}</div>}
    </div>
  );
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: authUser } = useAuth();

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
        <div className="text-sm text-gray-400">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white text-dark font-sans gap-4">
        <p className="text-gray-500">{error || 'Profile not found'}</p>
        <Link href="/" className="text-sm text-[#1C1C1E] hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const winRate = user.stats && user.stats.games_played > 0
    ? Math.round((user.stats.games_won / user.stats.games_played) * 100)
    : 0;

  const dist = user.stats?.guess_distribution ?? {};
  const maxDist = Math.max(...[1,2,3,4,5].map(n => dist[n] ?? 0), 1);

  const initial = user.username.charAt(0).toUpperCase();
  const isOwnProfile = authUser?.id === id;
  const avatarUrl = isOwnProfile ? getAvatarUrl(authUser?.user_metadata) : null;
  const avatarColor = getAvatarColor(user.username);

  return (
    <div className="min-h-screen flex flex-col bg-white text-dark font-sans">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-sm space-y-8">

          <div className="text-center">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={user.username} width={80} height={80} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4" style={{ backgroundColor: avatarColor }}>
                {initial}
              </div>
            )}
            <h1 className="text-2xl font-bold text-dark" style={{ fontFamily: 'Georgia, Times, serif' }}>
              {user.username}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="grid grid-cols-2 gap-2">
            <StatTile value={user.stats?.games_played ?? 0} label="Played" sublabel="Total games" icon={<Music2 className="w-4 h-4" />} />
            <StatTile value={`${winRate}%`} label="Win Rate" sublabel="Games won" icon={<Trophy className="w-4 h-4" />} />
            <StatTile value={user.stats?.current_streak ?? 0} label="Streak" sublabel="Days in a row" icon={<Flame className="w-4 h-4" />} />
            <StatTile value={user.stats?.best_streak ?? 0} label="Best Streak" sublabel="All time" icon={<Star className="w-4 h-4" />} />
          </div>

          <div className="h-px bg-gray-100" />

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-4">Guess Distribution</p>
            <div className="space-y-2">
              {[1,2,3,4,5].map(n => {
                const count = dist[n] ?? 0;
                const pct = Math.round((count / maxDist) * 100);
                return (
                  <div key={n} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 w-3 shrink-0">{n}</span>
                    <div className="flex-1 h-7 bg-gray-100 rounded-md overflow-hidden">
                      <div
                        className="h-full bg-[#1C1C1E] rounded-md flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: count === 0 ? '0%' : `${Math.max(pct, 8)}%` }}
                      >
                        {count > 0 && <span className="text-white text-xs font-bold">{count}</span>}
                      </div>
                    </div>
                    {count === 0 && <span className="text-xs text-gray-400 w-3">0</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-5">By Mode</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl px-4 py-4 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Daily</p>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold text-dark">{user.daily?.games_played ?? 0}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Played</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-dark">{user.daily?.games_won ?? 0}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Won</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-4 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Custom</p>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold text-dark">{user.custom?.games_played ?? 0}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Played</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-dark">{user.custom?.games_won ?? 0}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Won</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
