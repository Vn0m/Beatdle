import React, { useState, useEffect } from 'react';
import AppHeader from '../components/AppHeader';

interface LeaderboardEntry {
  username: string;
  max_streak: number;
  games_won: number;
}

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to load leaderboard');
        }
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

  const renderContent = () => {
    if (loading) {
      return <div className="text-dark text-center p-8 font-sans">Loading leaderboard...</div>;
    }

    if (error) {
      return <div className="text-red-600 text-center p-8 font-sans">{error}</div>;
    }

    if (entries.length === 0) {
      return <div className="text-gray-400 text-center p-8 font-sans">The leaderboard is empty.</div>;
    }

    return (
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
            <tr key={entry.username} className="hover:bg-gray-100 transition-colors font-sans">
              <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-dark">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-dark">{entry.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{entry.max_streak}</td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{entry.games_won}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="min-h-screen bg-white text-dark font-sans">
      <AppHeader />

      <div className="max-w-4xl mx-auto bg-white border-2 border-gray-300 rounded shadow overflow-hidden mt-8 mb-8">
        <h1 className="text-3xl font-bold p-6 text-center text-dark border-b-2 border-gray-200">Leaderboard</h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default Leaderboard;