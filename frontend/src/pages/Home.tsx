import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaPlus, FaSignInAlt } from 'react-icons/fa';
import Header from '../components/Header';
import { Button } from '@/components/ui/button';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black font-sans text-white">
      <Header />
      <main className="flex flex-col items-center justify-center grow p-4">
        <div className="text-center mb-8">
        <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
          <img
            src="/Beatdle_Logo.png"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
          <div className="bg-zinc-900 border border-zinc-800 px-12 py-3 rounded-lg text-white text-2xl font-bold tracking-wider">BEATDLE</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 w-full max-w-3xl text-center mb-12 flex items-center justify-center text-gray-100 text-lg rounded-xl leading-relaxed">
        It is a music guessing game that combines daily Wordle-style challenges with customizable multiplayer sessions. Each day, all users get the same "Daily Beatdle" where they have 5 attempts to guess the track using progressive audio snippets.
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-12 w-full max-w-4xl">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-zinc-900 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 font-bold mb-4">
              <FaCalendarAlt size={48} />
            </div>
            <Link to="/daily" className="w-48">
              <Button className="w-full h-16 text-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">Play</Button>
            </Link>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-zinc-900 border-2 border-purple-500 rounded-full flex items-center justify-center text-purple-400 font-bold mb-4">
              <FaPlus size={48} />
            </div>
            <Link to="/create-lobby" className="w-48">
              <Button className="w-full h-16 text-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">Create</Button>
            </Link>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-zinc-900 border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-400 font-bold mb-4">
              <FaSignInAlt size={48} />
            </div>
            <Link to="/join-lobby" className="w-48">
              <Button className="w-full h-16 text-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">Join</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;