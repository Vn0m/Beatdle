import type { SpotifyTrack, TrackSuggestion, GameFilters } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchTrack(id: string): Promise<SpotifyTrack> {
    const res = await fetch(`${API_URL}/api/spotify/track/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch track: ${res.status}`);
    return await res.json();
}

export async function fetchDailySong(): Promise<SpotifyTrack> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const userDate = `${year}-${month}-${day}`;
    
    const res = await fetch(`${API_URL}/api/spotify/daily-song?date=${userDate}`);
    if (!res.ok) throw new Error(`Failed to fetch daily song: ${res.status}`);
    return await res.json();
}

export async function fetchCustomTrack(filters: GameFilters): Promise<SpotifyTrack> {
    const params = new URLSearchParams();
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.artist) params.append('artist', filters.artist);
    if (filters.decadeStart) params.append('decadeStart', filters.decadeStart.toString());
    if (filters.decadeEnd) params.append('decadeEnd', filters.decadeEnd.toString());
    
    const res = await fetch(`${API_URL}/api/spotify/custom-track?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch custom track: ${res.status}`);
    return await res.json();
}

export async function searchTracks(query: string): Promise<TrackSuggestion[]> {
    const res = await fetch(`${API_URL}/api/spotify/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
}

export type { SpotifyTrack, TrackSuggestion };

