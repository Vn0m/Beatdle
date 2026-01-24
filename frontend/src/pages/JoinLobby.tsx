import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppHeader from "../components/AppHeader";
import AdUnit from "../components/AdUnit";

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
    <div className="flex flex-col min-h-screen bg-white font-sans text-dark">
      <AppHeader />

      <main className="flex flex-col items-center justify-center grow p-4">
        <div className="w-full max-w-md flex flex-col items-center space-y-8">
          <div className="w-24 h-24 mx-auto flex items-center justify-center">
            <img
              src="/Beatdle_Logo.png"
              alt="Beatdle Logo"
              className="w-full h-full object-contain"/>
          </div>

          <h1 className="text-2xl font-bold text-dark">Join Lobby</h1>

          <div className="w-full flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded border-2 border-gray-300 bg-white text-dark font-sans text-base focus:border-gray-500 focus:outline-none transition-colors placeholder:text-gray-400"
              autoFocus/>

            <input
              type="text"
              placeholder="Lobby code"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3.5 rounded border-2 border-gray-300 bg-white text-dark font-sans text-base focus:border-gray-500 focus:outline-none transition-colors placeholder:text-gray-400 uppercase tracking-wider"
              maxLength={5}/>

            <Button
              onClick={joinLobby}
              className="w-full h-14 text-lg font-semibold bg-dark hover:bg-gray-600 text-white rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canJoin}>
              Join Lobby
            </Button>
          </div>
        </div>
        
        <div className="hidden lg:block w-full max-w-3xl mt-8">
          <AdUnit 
            adSlot={import.meta.env.VITE_ADSENSE_SLOT_LEADERBOARD}
            style={{ display: 'block', minHeight: '90px' }}
          />
        </div>
      </main>
    </div>
  );
}