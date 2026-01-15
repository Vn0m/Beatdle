import { Link, useParams, useLocation } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import Autocomplete from "../components/Autocomplete";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import type { TrackSuggestion } from "../types";
import { MAX_ATTEMPTS, MAX_ROUNDS, SNIPPET_DURATIONS } from "../constants";

export default function MultiplayerLobby() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const name = query.get("name") || "Anonymous";
  const initialIsHost = query.get("host") === "true";

  const {
    myId,
    players,
    track,
    round,
    gameStarted,
    gameOver,
    roundOver,
    error,
    timeLeft,
    startGame,
    submitGuess,
    nextRound
  } = useWebSocket({ lobbyId: lobbyId || "", name, isHost: initialIsHost });

  const me = players.find(p => p.id === myId);
  const isHost = me?.isHost ?? false; 
  const won = me?.isCorrect ?? false;
  const duration = me ? SNIPPET_DURATIONS[me.currentAttempt] || 15 : 3;

  const { audioRef, isPlaying, currentTime, play } = useAudioPlayer({
    previewUrl: track?.previewUrl || null,
    duration
  });

  function onGuess(selected: TrackSuggestion) {
    if (!me || !track || roundOver) return;
    const correct = selected.id === track.id;
    submitGuess(correct);
  }

  function renderScoreboard() {
    return (
      <div className="w-64 sticky top-4 bg-white border-2 border-gray-300 text-dark rounded shadow overflow-hidden" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
        <h3 className="text-xl font-semibold p-4 pb-3 text-center text-dark border-b border-gray-200">Players ({players.length})</h3>
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 24rem)' }}>
          <ul className="space-y-3">
            {players.sort((a, b) => b.score - a.score).map(p => (
              <div 
                key={p.id} 
                className={`p-3 flex flex-col justify-between items-start text-sm bg-white border-2 text-dark rounded ${p.id === myId ? "border-primary-500" : "border-gray-300"}`}>
                <div className="font-bold truncate w-full flex justify-between items-center">
                  <span>{p.name} {p.isHost && "👑"}</span>
                  <span className="text-lg text-dark">{p.score}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    {p.isCorrect ? "✅ Correct" : `Attempts: ${p.currentAttempt}/${MAX_ATTEMPTS}`}
                </div>
              </div>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  
  function renderLobby() {
    return (
      <div className="w-full flex flex-col items-center px-4 py-8">
        <h2 className="text-2xl font-semibold mb-2 text-center text-dark">Waiting Room</h2>
        <p className="text-center text-sm mb-8 text-gray-500">
          {name} {isHost && "• Host"}
        </p>
        {isHost && (
          <Button onClick={startGame} className="w-full max-w-xs h-12 text-base font-semibold mb-8 bg-dark hover:bg-gray-600 text-white rounded transition-colors cursor-pointer">
            Start Game
          </Button>
        )}
        <div className="text-sm font-medium text-gray-500 mb-3">Players ({players.length})</div>
        <div className="w-full max-w-sm max-h-96 overflow-y-auto pr-2">
          <ul className="space-y-2.5">
            {players.map(p => (
              <div 
                key={p.id} 
                className={`px-4 py-3.5 flex justify-between items-center rounded-lg transition-all ${
                  p.id === myId 
                    ? "bg-primary-50 border-2 border-primary-500" 
                    : "bg-white border border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className={`font-medium ${p.id === myId ? "text-dark" : "text-gray-700"}`}>
                  {p.name} {p.isHost && "👑"}
                </span>
                <span className="text-sm text-gray-500">{p.score} pts</span>
              </div>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  function renderGame() {
      if (!track || !me) return <div>Loading...</div>;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
  
      const meAttempt = me.currentAttempt; 

      return (
        <div className="relative max-w-7xl mx-auto w-full p-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_40rem_1fr] xl:grid-cols-[1fr_40rem_1fr] gap-8">
              <div className="hidden lg:block"></div>
              <div className="w-full max-w-2xl mx-auto flex flex-col items-center mt-12 lg:mt-16 order-2 lg:order-1">
                <div className="w-full flex justify-between absolute top-0 lg:static mb-6 p-4 lg:p-0">
                  <div className="bg-white border-2 border-gray-300 px-3 py-1 rounded text-gray-500 font-bold shadow">
                    Timer: {minutes}:{seconds.toString().padStart(2, "0")}
                  </div>
                  <div className="bg-white border-2 border-gray-300 px-3 py-1 rounded text-gray-500 font-bold shadow">
                    Round: {round} / {MAX_ROUNDS}
                  </div>
                </div>
                {track.previewUrl && <audio ref={audioRef} src={track.previewUrl || undefined} />}
                <button
                  onClick={play}
                  disabled={isPlaying || won || roundOver || me?.currentAttempt >= MAX_ATTEMPTS}
                  className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-md bg-white border-2 border-gray-300 text-primary-500 hover:border-primary-500 hover:shadow-lg active:scale-95 transition-all duration-150 ${
                    isPlaying || won || roundOver || me?.currentAttempt >= MAX_ATTEMPTS ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}>
                  {isPlaying ? (
                    <svg className="w-11 h-11" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-11 h-11 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
  
                <div className="relative w-full max-w-md mx-auto mb-8">
                  <div className="flex gap-0.5 h-16 items-end">
                    {[...Array(40)].map((_, i) => {
                    const durationIndex = Math.min(meAttempt, SNIPPET_DURATIONS.length - 1);
                    const currentUnlockedDuration = SNIPPET_DURATIONS[durationIndex] || 0;
                      const isUnlocked = i < (currentUnlockedDuration / 15) * 40;
                      
                      const seed = track.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                      const freq1 = 0.2 + (seed % 10) / 50;
                      const freq2 = 0.1 + (seed % 7) / 40;
                      const freq3 = 0.4 + (seed % 5) / 30;
                      const offset1 = (seed % 31) / 10;
                      const offset2 = (seed % 23) / 10;
                      
                      const wave1 = Math.sin(i * freq1 + offset1) * 0.4;
                      const wave2 = Math.sin(i * freq2 + offset2) * 0.3;
                      const wave3 = Math.sin(i * freq3 + seed) * 0.2;
                      const heightPercent = 25 + (wave1 + wave2 + wave3 + 0.9) * 28;
                      
                      const barProgress = (i / 40) * currentUnlockedDuration;
                      const hasPlayed = currentTime > barProgress;
                    
                    return (
                      <div
                        key={i}
                          className={`flex-1 rounded-sm ${
                            !isUnlocked 
                              ? "bg-gray-200" 
                              : hasPlayed
                                ? "bg-primary-600"
                                : "bg-primary-500"
                          } ${isPlaying && isUnlocked ? "animate-wave-pulse" : ""}`}
                        style={{
                            height: `${heightPercent}%`,
                            opacity: isUnlocked ? 0.9 : 0.4,
                            animationDelay: `${(i % 5) * 0.08}s`,
                        }}/>
                    );
                  })}
                  </div>
                </div>

                {!won && !roundOver && (
                  <div className="w-full max-w-md mb-6">
                    <Autocomplete onSelect={onGuess} disabled={won || roundOver || me.currentAttempt >= MAX_ATTEMPTS} />
                  </div>
                )}

                <div className="flex gap-3 mb-6">
                  {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                    const guess = me.guesses[i];
                    let boxClass = "bg-white border-gray-300";
                    if (guess === "correct") boxClass = "bg-correct-light border-correct";
                    else if (guess === "wrong") boxClass = "bg-wrong-light border-wrong";
                    if (i === me.currentAttempt && !won && !roundOver) {
                      boxClass = "border-2 border-primary-500 bg-white";
                    }
                    return (
                      <div key={i} className={`w-16 h-16 border-2 rounded flex items-center justify-center text-lg font-bold shadow ${boxClass}`}>
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
                
                {(won || roundOver) && (
                  <div className="text-center mt-6 mb-4">
                    <p className="text-xl font-bold text-dark">Answer: {track.name}</p>
                    <p className="text-lg text-gray-500">Artist: {track.artists}</p> 
                  </div>
                )}

                {(!roundOver && (won || me?.currentAttempt >= MAX_ATTEMPTS)) && (
                  <p className="text-sm text-gray-500 mt-6 text-center">
                    Waiting for other players...
                  </p>
                )}
  
                {(roundOver && round < MAX_ROUNDS && isHost) && (
                  <Button
                    onClick={nextRound}
                    className="mt-6 px-6 py-3 font-bold bg-dark hover:bg-gray-600 text-white rounded transition-colors cursor-pointer"
                  >
                    Next Song
                  </Button>
                )}
  
              </div>
  
              <div className="order-1 lg:order-2 hidden lg:block">
                  {renderScoreboard()}
              </div>
          </div>
        </div>
      );
    } 

  return (
    <div className="flex flex-col min-h-screen bg-white text-dark font-sans">
      <AppHeader />
      <header className="flex items-center p-4 bg-white border-b border-gray-200 relative">
        <Link to="/" className="p-2 rounded hover:bg-gray-100 absolute left-4 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="grow text-center">
          <div className="inline-block bg-white border-2 border-gray-300 px-6 py-2 rounded text-xl font-bold shadow uppercase tracking-wide">Lobby: {lobbyId}</div>
        </div>
      </header>
      <main className="flex flex-col items-center p-4 grow">
        {error && <div className="bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded mb-6 font-sans">{error}</div>}
        {gameStarted ? renderGame() : renderLobby()}
      </main>

      <Dialog open={gameOver} onOpenChange={() => {}}>
        <DialogContent className="max-w-[85vw] sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogTitle className="sr-only">Game Complete</DialogTitle>
          <div className="text-center py-3 sm:py-4 px-2">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🏆</div>
            
            <h2 className="text-lg sm:text-2xl font-bold text-dark mb-3 sm:mb-6" style={{fontFamily: 'Georgia, Times, serif'}}>
              Game Complete
            </h2>

            <div className="space-y-2 mb-6 sm:mb-8">
              {players
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div 
                    key={p.id} 
                    className={`py-2 sm:py-3 px-3 sm:px-4 rounded flex justify-between items-center ${
                      idx === 0 
                        ? 'bg-gray-100 border border-gray-300' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className={`font-medium text-sm sm:text-base ${idx === 0 ? 'text-dark font-bold' : 'text-gray-700'}`}>
                      {idx === 0 && '👑 '}{p.name}
                    </span>
                    <span className={`font-semibold text-sm sm:text-base ${idx === 0 ? 'text-dark' : 'text-gray-600'}`}>
                      {p.score} pts
                    </span>
                  </div>
                ))}
            </div>

            <Link to="/">
              <Button className="w-full px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base bg-dark hover:bg-gray-600 text-white rounded transition-colors cursor-pointer">
                Back to Home
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}