// client/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Daily from './pages/Daily';
import './index.css'; // Make sure Tailwind CSS is imported here or main.tsx
import CreateLobby from './pages/CreateLobby';
import JoinLobby from './pages/JoinLobby';
import MultiplayerLobby from './pages/MultiplayerLobby';
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