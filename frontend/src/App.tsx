import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Daily from './pages/Daily.tsx';
import './index.css'; 
import CreateLobby from './pages/CreateLobby.tsx';
import JoinLobby from './pages/JoinLobby.tsx';
import MultiplayerLobby from './pages/MultiplayerLobby.tsx';
import Profile from './pages/Profile.tsx';
import Leaderboard from './pages/Leaderboard.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/daily" element={<Daily />} />
        <Route path="/create-lobby" element={<CreateLobby />} />
        <Route path="/join-lobby" element={<JoinLobby />} />
        <Route path="/multiplayer/:lobbyId" element={<MultiplayerLobby />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
}

export default App;