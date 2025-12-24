<div align="center">

# 🎵 Beatdle

**Real-time multiplayer music guessing game with daily challenges**

[Live Demo](https://beatdle-app.onrender.com/)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white)

</div>

---

## 🎯 What It Does

A full-stack music game combining Wordle's daily challenge with Kahoot's live multiplayer. Guess songs from progressively expanding audio snippets (3s → 15s), compete in real-time lobbies with friends, and track performance on global leaderboards.

**Key Features:** Daily challenges • Live multiplayer • Real-time WebSocket updates • Spotify API integration • User profiles & stats • Progressive audio reveals

---

## 🛠️ Tech Stack

**Frontend:** React • TypeScript • Vite • Tailwind CSS • WebSocket Client

**Backend:** Node.js • Express • PostgreSQL • WebSocket (ws) • Spotify Web API

**Deployment:** Render 

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/Vn0m/Beatdle.git
cd Beatdle
cd frontend && npm install
cd ../backend && npm install

# Configure environment (.env files)
# backend/.env: DATABASE_URL, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
# frontend/.env: VITE_API_URL=http://localhost:8000

# Run
cd backend && npm run dev  # Terminal 1
cd frontend && npm run dev  # Terminal 2
```

Visit `http://localhost:5173`

---

## 💡 Technical Highlights

- **Real-time WebSocket architecture** for instant multiplayer updates
- **Progressive audio snippet system** with controlled reveal timing
- **Debounced Spotify API queries** with intelligent search caching
- **PostgreSQL** for user stats, leaderboards, and game history
- **Type-safe** full-stack TypeScript implementation

---

## 👤 Author

**Juan Apolo**  
GitHub: [@Vn0m](https://github.com/Vn0m) • LinkedIn: [Juan Apolo](https://linkedin.com/in/juan-apolo-swe/)


