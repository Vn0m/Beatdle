// client/src/pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
// Import only the icons needed for this page
import { FaCalendarAlt, FaPlus, FaSignInAlt } from 'react-icons/fa';
// Import the new reusable Header
import Header from '../components/Header';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 font-sans text-white">
      
      {/* Use the new reusable Header */}
      <Header />

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center grow p-4">
        {/* Logo & Title Area */}
        <div className="text-center mb-8">
        <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
          <img
            src="/Beatdle_Logo.png"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>

          <div className="bg-gray-700 px-12 py-3 rounded text-white text-xl font-bold tracking-wider">BEATDLE</div>
        </div>

        {/* Description Box */}
        <div className="bg-gray-800 p-6 w-full max-w-3xl text-center mb-12 h-32 flex items-center justify-center text-white text-xl rounded shadow">
        It is a music guessing game that combines daily Wordle-style challenges with customizable multiplayer sessions. Each day, all users get the same "Daily Beatdle" where they have 5 attempts to guess the track using progressive audio snippets.
        </div>

        {/* Action Buttons Area */}
        <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-12 w-full max-w-4xl">
          
          {/* Play (Daily) Button */}
          <div className="flex flex-col items-center">
            {/* Updated ICON 1 */}
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold mb-4">
              <FaCalendarAlt size={48} />
            </div>
            <Link
              to="/daily"
              className="w-48 h-16 bg-blue-600 flex items-center justify-center text-white text-xl font-semibold rounded hover:bg-blue-700 transition"
            >
              Play
            </Link>
          </div>

          {/* Create (Session) Button */}
          <div className="flex flex-col items-center">
            {/* Updated ICON 2 */}
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold mb-4">
              <FaPlus size={48} />
            </div>
            <Link
              to="/create-lobby"
              className="w-48 h-16 bg-blue-600 flex items-center justify-center text-white text-xl font-semibold rounded hover:bg-blue-700 transition"
            >
              Create
            </Link>
          </div>

          {/* Join (Session) Button */}
          <div className="flex flex-col items-center">
            {/* Updated ICON 3 */}
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold mb-4">
              <FaSignInAlt size={48} />
            </div>
            <Link
              to="/join-lobby"
              className="w-48 h-16 bg-blue-600 flex items-center justify-center text-white text-xl font-semibold rounded hover:bg-blue-700 transition"
            >
              Join
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;