import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const Home: React.FC = () => {
  const [showMultiplayerDropdown, setShowMultiplayerDropdown] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-dark">
      <main className="flex flex-col items-center justify-center grow px-6 sm:px-4">
        <div className="flex flex-col items-center justify-center mb-8 px-4">
          <img
            src="/Beatdle_Logo.png"
            alt="Beatdle Logo"
            className="w-28 h-28 mb-4 object-contain"
          />
          <h1 className="text-5xl font-bold tracking-tight mb-3 text-dark" style={{fontFamily: 'Georgia, Times, serif'}}>
            Beatdle
          </h1>
          <p className="text-2xl font-normal text-gray-500 text-center max-w-lg px-2">
            Guess the song in 5 tries
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-8 w-full max-w-[210px] sm:max-w-2xl">
          <Link to="/daily" className="w-full sm:w-auto">
            <Button className="w-full sm:w-48 h-12 text-base font-semibold bg-dark hover:bg-gray-600 text-white rounded border-none shadow transition-colors cursor-pointer">
              Play Daily
            </Button>
          </Link>
          
          <div className="relative w-full sm:w-auto">
            <Button 
              onClick={() => setShowMultiplayerDropdown(!showMultiplayerDropdown)}
              className="w-full sm:w-48 h-12 text-base font-semibold bg-white text-dark border-2 border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer inline-flex items-center justify-center gap-1"
            >
              Multiplayer
              <ChevronDown className="w-4 h-4" />
            </Button>
            {showMultiplayerDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMultiplayerDropdown(false)}
                />
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border-2 border-gray-300 rounded shadow-lg z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowMultiplayerDropdown(false);
                      navigate('/create-lobby');
                    }}
                    className="w-full px-4 py-2.5 text-left text-dark hover:bg-gray-50 transition-colors cursor-pointer text-sm font-medium"
                  >
                    Create Lobby
                  </button>
                  <div className="h-px bg-gray-200" />
                  <button
                    onClick={() => {
                      setShowMultiplayerDropdown(false);
                      navigate('/join-lobby');
                    }}
                    className="w-full px-4 py-2.5 text-left text-dark hover:bg-gray-50 transition-colors cursor-pointer text-sm font-medium"
                  >
                    Join Lobby
                  </button>
                </div>
              </>
            )}
          </div>

          <Link to="/custom-daily" className="w-full sm:w-auto">
            <Button className="w-full sm:w-48 h-12 text-base font-semibold bg-white text-dark border-2 border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer">
              Custom Game
            </Button>
          </Link>
        </div>

        <div className="w-16 h-px bg-gray-300 mb-6"></div>

        <div className="flex flex-row justify-center items-center gap-8 sm:gap-12 mb-6">
          <Link to="/signup" className="text-base text-gray-500 hover:text-dark transition-colors font-medium">
            Sign Up
          </Link>
          <Link to="/login" className="text-base text-gray-500 hover:text-dark transition-colors font-medium">
            Log In
          </Link>
        </div>

        <div className="text-center px-4">
          <div className="text-sm sm:text-base text-gray-400 mb-2">
            Daily music challenges. Test your ears. Share your results.
          </div>
          <div className="text-xs sm:text-sm text-gray-400">
            © 2026 Beatdle
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;