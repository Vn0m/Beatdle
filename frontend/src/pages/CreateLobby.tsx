import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppHeader from "../components/AppHeader";

export default function CreateLobby() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const createLobby = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    navigate(`/multiplayer/${code}?host=true&name=${trimmedName}`);
  };

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

          <h1 className="text-2xl font-bold text-dark">Create Lobby</h1>

          <div className="w-full flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded border-2 border-gray-300 bg-white text-dark font-sans text-base focus:border-gray-500 focus:outline-none transition-colors placeholder:text-gray-400"
              autoFocus/>

            <Button
              onClick={createLobby}
              className="w-full h-14 text-lg font-semibold bg-dark hover:bg-gray-600 text-white rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!name.trim()}>
              Create Lobby
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}