# Beatdle

Designed and developed by: Thomas Huang, Juan Apolo, and Nanzib Chowdhury

Deployed app: https://beatdle-app.onrender.com/

## About

### Description and Purpose

It is a music guessing game that combines daily Wordle-style challenges with customizable multiplayer sessions. Each day, all users get the same "Song of the Day" where they have 5 attempts to guess the track using progressive audio snippets (starting at 3 seconds, expanding with each attempt) and optional hints like genre, artist clues, or release era, with results shareable as emoji grids and streak tracking for daily players. Users can also create live multiplayer sessions via shareable links where the host customizes the experience by selecting specific genres, artists, and difficulty levels, Easy mode features mainstream hits with 500M+ Spotify listens, Medium includes popular songs with fewer streams, and Hard showcases deep cuts and obscure tracks with minimal plays. Friends join to compete by guessing songs with the same hint system while watching a live leaderboard update based on speed and how many guesses it took for them to get it right. The platform uses real-time gameplay with music APIs like Spotify for metadata and audio previews, and stores user statistics, daily challenges, session configurations, and leaderboards in PostgreSQL.

### Inspiration

This project draws inspiration from several popular games and platforms, blending their best mechanics into a single, music-focused experience:

    Wordle: The core concept for the daily challenge mode is heavily inspired by Wordle. This includes the "one-puzzle-per-day" model, the 5-attempt limit, simple streak tracking, and the iconic shareable emoji grid to show off your results without spoilers.

    Heardle: The most direct predecessor for the daily game. Heardle pioneered the "Wordle-for-music" format, and this project adopts its brilliant mechanic of using progressively longer audio snippets as the primary guessing tool.

    Kahoot!: The entire live multiplayer mode is modeled after Kahoot!'s real-time, social quiz format. The idea of a host creating a custom game, sharing a simple link for friends to join, and competing against a live leaderboard comes directly from this model.

    Jackbox Games: A major influence on the "social party game" feel. The concept of creating a "room" (or session) for friends to join instantly from their own devices (phones, laptops) for a fun, real-time competition is a hallmark of the Jackbox suite.

    SongPop: A classic in the music quiz genre. Its influence is seen in the fast-paced, competitive guessing format and the deep customization of playlists based on specific genres, artists, and decades.

## Tech Stack

### Frontend
* **Core:** React, TypeScript, Vite
* **Styling:** Tailwind CSS
* **Routing:** React Router

### Backend
* **Core:** Node.js, Express, TypeScript
* **Database:** PostgreSQL
* **API:** Spotify Web API (with `spotify-preview-finder` fallback)
* **Real-time:** Socket.IO

### Deployment
* **Platform:** Render

## Features

### Daily Song Challenge ✅ 

A Wordle-style daily game where all users have a limited number of attempts to guess the same "Song of the Day." Players can listen to progressively longer audio snippets with each guess to help them identify the track.

    Sub Feature - Score System ✅ 

    Players see their score based on how accurate they guess. Rewards early correct guesses and encourages careful listening

[Kapture 2025-11-11 at 23 20 59](https://github.com/user-attachments/assets/c996b28b-a825-463b-8ee0-8df726d336b3)

### Live Multiplayer Sessions

Users can create or join real-time multiplayer games via a shareable link. The host customizes the game, and all players compete simultaneously to guess songs, with a live leaderboard tracking scores after each round.

[gif goes here]

### Leaderboards ✅

Displays high scores and player rankings. This includes a leaderboard for the Daily Song Challenge (ranking players by speed and attempts) and a separate all-time leaderboard for total points earned in multiplayer games.

![GIF](https://i.imgur.com/VeGlDzJ.gif)

### User Profiles & Stats ✅

Registered users have a personal profile page that tracks their game history, daily challenge streaks, average guess speed, win/loss ratio, and other key statistics.

![GIF](https://i.imgur.com/ml9M3Us.gif)

### Shareable Results ✅

After completing the Daily Song Challenge, users can copy their results to the clipboard as a spoiler-free grid of emojis. This allows them to share their performance on social media without revealing the song title.

![GIF](https://i.imgur.com/TnsED0I.gif)

### Autofill Guessing

An intelligent search bar that provides autofill suggestions as the user types their guess. This connects to the music database to prevent misspellings and help users quickly find and submit the correct song title and artist.

[gif goes here]

### Progressive Audio Snippets

The core mechanic where players first hear a very short audio clip (e.g., 3 seconds). With each failed or skipped attempt, a longer snippet of the song is unlocked, making it progressively easier to guess.

[gif goes here]

### Custom Game Settings

The host of a multiplayer session can customize the game's content. Settings include selecting specific genres (e.g., Rock, Hip-Hop), decades (e.g., 80s, 90s), or even creating a quiz based on a single artist.

[gif goes here]

### Optional Hints

[short description goes here]

[gif goes here]

### Dynamic Scoring System

A points-based system that rewards players for both speed and accuracy. In multiplayer, players who guess the song correctly and quickly earn the most points. In the daily challenge, the final score is based on the number of attempts used.

[gif goes here]

### [ADDITIONAL FEATURES GO HERE - ADD ALL FEATURES HERE IN THE FORMAT ABOVE; you will check these off and add gifs as you complete them]

## Installation Instructions

[instructions go here]
