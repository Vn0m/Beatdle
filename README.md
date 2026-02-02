<div align="center">

<img src="frontend/public/Beatdle_Logo.png" alt="Beatdle Logo" width="80" height="80" />

# Beatdle

**Real-time multiplayer music guessing game with daily challenges**

[Live Demo](https://beatdle-app.onrender.com/)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white)

</div>

---

A music guessing game inspired by Wordle. Listen to audio snippets and guess the song in 5 tries. Play the daily challenge solo or compete with friends in real-time multiplayer.

## Features

- Daily song challenge (new song every day)
- Custom games with filter options (genre, artist, decade)
- Real-time multiplayer lobbies with custom game settings
- Progressive audio reveals (3s → 15s)
- Hint system (reveal year, artist initial, or album name)
- User profiles and leaderboards
- Spotify API integration

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS

**Backend:** Node.js, Express, PostgreSQL, WebSocket (ws), Spotify Web API

## How to Run

**1. Clone the repo**

```bash
git clone https://github.com/Vn0m/Beatdle.git
cd Beatdle
```

**2. Install dependencies**

```bash
cd backend && npm install
cd ../frontend && npm install
```

**3. Set up environment variables**

Create `backend/.env`:
```
DATABASE_URL=your_postgres_url
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

**4. Start the servers**

In one terminal:
```bash
cd backend && npm run dev
```

In another terminal:
```bash
cd frontend && npm run dev
```

Visit `http://localhost:5173`
