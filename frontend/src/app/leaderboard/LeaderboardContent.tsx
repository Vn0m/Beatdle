'use client';

import { useEffect, useState } from 'react';
import { Trophy, Flame, Music2 } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import { API_URL } from '@/config/constants';

type Tab = 'overall' | 'daily' | 'custom';

interface OverallEntry {
  username: string;
  games_won: number;
  games_played: number;
  best_streak: number;
}

interface DailyEntry {
  username: string;
  best_streak: number;
  games_won: number;
}

interface CustomEntry {
  username: string;
  games_won: number;
  games_played: number;
}

type LeaderboardEntry = OverallEntry | DailyEntry | CustomEntry;

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardContent() {
  const [tab, setTab] = useState<Tab>('overall');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/leaderboard?type=${tab}`);
        if (!response.ok) throw new Error('Failed to load leaderboard');
        setEntries(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [tab]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overall', label: 'Overall' },
    { key: 'daily', label: 'Daily' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-dark font-sans">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-md">

          <h1 className="text-2xl font-bold text-center mb-6 text-dark" style={{ fontFamily: 'Georgia, Times, serif' }}>
            Leaderboard
          </h1>

          <div className="flex border-b border-gray-200 mb-6">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors cursor-pointer ${
                  tab === key
                    ? 'border-b-2 border-[#1C1C1E] text-dark -mb-px'
                    : 'text-gray-400 hover:text-dark'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
          )}

          {error && (
            <div className="text-center py-16 text-red-500 text-sm">{error}</div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">
              No scores yet — be the first to play!
            </div>
          )}

          {!loading && !error && entries.length > 0 && (
            <div className="divide-y divide-gray-100">
              {entries.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 py-4 px-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 text-center shrink-0">
                    {index < 3 ? (
                      <span className="text-xl">{MEDALS[index]}</span>
                    ) : (
                      <span className="text-sm font-semibold text-gray-400">{index + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 text-base font-semibold text-dark truncate">
                    {entry.username}
                  </div>

                  {tab === 'overall' && (
                    <div className="flex gap-5 shrink-0">
                      <div className="text-center">
                        <div className="text-base font-bold text-dark">{(entry as OverallEntry).games_won}</div>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <Trophy className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400 uppercase tracking-wide">Won</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-base font-bold text-[#1C1C1E]">{(entry as OverallEntry).best_streak}</div>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <Flame className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400 uppercase tracking-wide">Streak</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === 'daily' && (
                    <div className="flex gap-5 shrink-0">
                      <div className="text-center">
                        <div className="text-base font-bold text-dark">{(entry as DailyEntry).games_won}</div>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <Trophy className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400 uppercase tracking-wide">Wins</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-base font-bold text-[#1C1C1E]">{(entry as DailyEntry).best_streak}</div>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <Flame className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400 uppercase tracking-wide">Streak</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === 'custom' && (
                    <div className="flex gap-5 shrink-0">
                      <div className="text-center">
                        <div className="text-base font-bold text-dark">{(entry as CustomEntry).games_won}</div>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <Trophy className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400 uppercase tracking-wide">Won</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-base font-bold text-gray-500">{(entry as CustomEntry).games_played}</div>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <Music2 className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400 uppercase tracking-wide">Played</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
