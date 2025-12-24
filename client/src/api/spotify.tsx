
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface SpotifyTrack {
    id: string;
    name: string;
    artists: string[];
    album: {
      name: string;
      image: string;
    };
    previewUrl: string | null;
    duration: number;
    releaseDate: string;
  }
  
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

export interface TrackSuggestion {
    id: string;
    name: string;
    artists: string[];
    album: {
        name: string;
        image: string | null;
    };
    previewUrl: string | null;
}

export async function searchTracks(query: string): Promise<TrackSuggestion[]> {
    const res = await fetch(`${API_URL}/api/spotify/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
}

