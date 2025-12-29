import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CreateLobby() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const createLobby = () => {
    // Trim the name and check if it's empty
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    navigate(`/multiplayer/${code}?host=true&name=${trimmedName}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black font-sans text-white">
      {/* Header */}
      <header className="flex items-center p-4 bg-zinc-900 border-b border-zinc-800 relative">
        <Link
          to="/"
          className="p-2 rounded-full hover:bg-zinc-800 transition-colors absolute"
        >
          {/* Back Arrow SVG Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        {/* Title (inspired by BEATDLE box) */}
        <div className="grow text-center">
          <div className="bg-zinc-900 border border-zinc-800 px-6 py-2 rounded-lg text-white text-xl font-bold tracking-wider inline-block">
            CREATE LOBBY
          </div>
        </div>
        {/* Placeholder for hamburger menu, keeps title centered */}
        <div className="w-10 h-10"></div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center grow p-4">
        <div className="w-full max-w-md flex flex-col items-center space-y-8">
          {/* Logo (from Home) */}
          <div className="w-32 h-32 mx-auto flex items-center justify-center">
            <img
              src="/Beatdle_Logo.png" // Assuming this logo is in your /public folder
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback in case the image doesn't load
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.className = 'w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center text-gray-400';
                placeholder.innerText = 'Logo';
                e.currentTarget.parentNode?.replaceChild(placeholder, e.currentTarget);
              }}
            />
          </div>

          {/* Form */}
          <div className="w-full flex flex-col space-y-6">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900 border-2 border-zinc-800 text-white text-lg rounded-lg p-4 w-full focus:outline-none focus:border-emerald-500 transition-colors"
              autoFocus
            />

            <Button
              onClick={createLobby}
              className="w-full h-16 text-xl font-semibold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
              disabled={!name.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}