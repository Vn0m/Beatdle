'use client';

import { useEffect, useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import Footer from '@/components/layout/Footer';
import { API_URL } from '@/config/constants';
import type { Metadata } from 'next';

interface LeaderboardEntry {
  username: string;
  max_streak: number;
  games_won: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${API_URL}/api/leaderboard`);
        if (!response.ok) throw new Error('Failed to load leaderboard');
        const data: LeaderboardEntry[] = await response.json();
        setEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-dark font-sans">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-4xl bg-white border-2 border-gray-300 rounded shadow overflow-hidden">
          <h1 className="text-3xl font-bold p-6 text-center text-dark border-b-2 border-gray-200">Leaderboard</h1>

          {loading && (
            <div className="text-dark text-center p-8 font-sans">Loading leaderboard...</div>
          )}

          {error && (
            <div className="text-red-600 text-center p-8 font-sans">{error}</div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div className="text-gray-400 text-center p-8 font-sans">The leaderboard is empty.</div>
          )}

          {!loading && !error && entries.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide w-1/12">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Max Streak</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Games Won</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry, index) => (
                  <tr key={entry.username} className="hover:bg-gray-50 transition-colors font-sans">
                    <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-dark">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-dark">{entry.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{entry.max_streak}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{entry.games_won}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
