import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
    <div className="flex flex-col min-h-screen bg-gray-900 font-sans text-white">
      {/* Header */}
      <header className="flex items-center p-4 bg-gray-800 shadow-lg relative">
        <Link
          to="/"
          className="p-2 rounded-full hover:bg-gray-700 transition-colors absolute"
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
        <div className="flex-grow text-center">
          <div className="bg-gray-700 px-6 py-2 rounded text-white text-xl font-bold tracking-wider inline-block">
            CREATE LOBBY
          </div>
        </div>
        {/* Placeholder for hamburger menu, keeps title centered */}
        <div className="w-10 h-10"></div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow p-4">
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
              className="bg-gray-800 border-2 border-gray-700 text-white text-lg rounded-lg p-4 w-full focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />

            <button
              onClick={createLobby}
              // Use button styles from Home, and add a disabled state
              className="bg-blue-600 text-white text-xl font-semibold rounded-lg py-4 w-full hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:opacity-70"
              disabled={!name.trim()}
            >
              Create
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}