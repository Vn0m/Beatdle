import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
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
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
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
  }, [id]); 

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-white text-dark font-sans">
            Loading profile...
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-white text-dark font-sans">
            <p className="text-red-600 mb-4">{error}</p>
            <Link to="/" className="text-gray-500 hover:text-dark transition-colors">&larr; Back to Home</Link>
        </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-dark font-sans">
      <AppHeader />

      <div className="max-w-lg mx-auto bg-white border-2 border-gray-300 rounded shadow p-8 mt-8 mb-8">
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
    </div>
  );
};

export default Profile;