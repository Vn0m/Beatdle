import type { SpotifyTrack, TrackSuggestion, GameFilters } from '@/types';
import { API_URL } from '@/config/constants';
import { createClient } from '@/lib/supabase';

export async function saveScore({
  game_type,
  game_date,
  attempts,
  completed,
}: {
  game_type: 'daily' | 'custom' | 'multiplayer';
  game_date?: string;
  attempts: number;
  completed: boolean;
}): Promise<void> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return;

  await fetch(`${API_URL}/api/scores`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ game_type, game_date, attempts, completed }),
  }).catch(() => {});
}

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
  const artist = filters.artist?.trim();
  if (artist) params.append('artist', artist);
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
