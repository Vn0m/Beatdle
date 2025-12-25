import type { SpotifyTrack, TrackSuggestion } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchTrack(id: string): Promise<SpotifyTrack> {
    const res = await fetch(`${API_URL}/api/spotify/track/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch track: ${res.status}`);
    return await res.json();
}

export async function fetchDailySong(): Promise<SpotifyTrack> {
    const res = await fetch(`${API_URL}/api/spotify/daily-song`);
    if (!res.ok) throw new Error(`Failed to fetch daily song: ${res.status}`);
    return await res.json();
}

export async function searchTracks(query: string): Promise<TrackSuggestion[]> {
    const res = await fetch(`${API_URL}/api/spotify/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
}

export type { SpotifyTrack, TrackSuggestion };

