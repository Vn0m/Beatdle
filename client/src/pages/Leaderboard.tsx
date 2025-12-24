// client/src/pages/Leaderboard.tsx
import React, { useState, useEffect } from 'react';
// Import the new reusable Header
import Header from '../components/Header';

// Define a type for our leaderboard entry
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
        // Fetch data from the new leaderboard API endpoint
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
  }, []); // This effect runs once when the component mounts

  const renderContent = () => {
    if (loading) {
      return <div className="text-white text-center p-8">Loading leaderboard...</div>;
    }

    if (error) {
      return <div className="text-red-500 text-center p-8">{error}</div>;
    }

    if (entries.length === 0) {
      return <div className="text-gray-400 text-center p-8">The leaderboard is empty.</div>;
    }

    return (
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Rank</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Player</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Max Streak</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Games Won</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {entries.map((entry, index) => (
            <tr key={entry.username} className="hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-lg font-medium">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-lg font-medium">{entry.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-lg">{entry.max_streak}</td>
              <td className="px-6 py-4 whitespace-nowrap text-lg">{entry.games_won}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Use the new reusable Header */}
      <Header />

      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden mt-4">
        <h1 className="text-3xl font-bold p-6 text-center">Leaderboard</h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default Leaderboard;