import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function JoinLobby() {
  const [name, setName] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const navigate = useNavigate();

  const joinLobby = () => {
    const trimmedName = name.trim();
    const trimmedCode = lobbyCode.trim().toUpperCase(); 
    if (!trimmedName || !trimmedCode) return;

    navigate(`/multiplayer/${trimmedCode}?name=${trimmedName}`);
  };

  const canJoin = name.trim() !== "" && lobbyCode.trim() !== "";

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
        {/* Title */}
        <div className="grow text-center">
          <div className="bg-zinc-900 border border-zinc-800 px-6 py-2 rounded-lg text-white text-xl font-bold tracking-wider inline-block">
            JOIN LOBBY
          </div>
        </div>
        {/* Placeholder */}
        <div className="w-10 h-10"></div>
      </header> 

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center grow p-4">
        <div className="w-full max-w-md flex flex-col items-center space-y-8">
          {/* Logo (from Home) */}
          <div className="w-32 h-32 mx-auto flex items-center justify-center">
            <img
              src="/Beatdle_Logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
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

            <input
              type="text"
              placeholder="Lobby code"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value.toUpperCase())} // Force uppercase for lobby codes
              className="bg-zinc-900 border-2 border-zinc-800 text-white text-lg rounded-lg p-4 w-full focus:outline-none focus:border-emerald-500 transition-colors"
              maxLength={5} //lobby codes are 5 characters long
            />

            <Button
              onClick={joinLobby}
              className="w-full h-16 text-xl font-semibold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
              disabled={!canJoin}
            >
              Join
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}