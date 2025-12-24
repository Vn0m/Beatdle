// client/src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
// Import the new reusable Header
import Header from '../components/Header';

// Define a type for our user data to match the database table
interface UserProfile {
  user_id: number;
  username: string;
  created_at: string;
  games_played: number;
  games_won: number;
  current_streak: number;
  max_streak: number;
}

const Profile: React.FC = () => {
  // We'll get the user ID from the URL, e.g., /profile/1
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch data from our new API endpoint.
        // Vite will proxy this request from /api/users to http://localhost:8000/api/users
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
          throw new Error('Profile not found');
        }
        const data: UserProfile = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]); // Re-run effect if the ID in the URL changes

  if (loading) {
    // Simple loading state
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
            Loading profile...
        </div>
    );
  }

  if (error) {
    // Simple error state
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-white">
            <p className="text-red-500">{error}</p>
            <Link to="/" className="mt-4 text-blue-400 hover:underline">&larr; Back to Home</Link>
        </div>
    );
  }

  if (!user) {
    // This case should be covered by loading/error, but good to have
    return null;
  }

  return (
    // Main profile page UI
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Use the new reusable Header */}
      <Header />

      <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6 mt-4">
        <h1 className="text-3xl font-bold mb-4 text-center">{user.username}</h1>
        <p className="text-gray-400 mb-6 text-center">
          Member since: {new Date(user.created_at).toLocaleDateString()}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{user.games_played}</div>
            <div className="text-gray-400">Games Played</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{user.games_won}</div>
            <div className="text-gray-400">Games Won</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{user.current_streak}</div>
            <div className="text-gray-400">Current Streak</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{user.max_streak}</div>
            <div className="text-gray-400">Max Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;