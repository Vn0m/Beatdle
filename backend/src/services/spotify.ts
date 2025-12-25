let cachedToken: string | null = null;
let tokenExpiryTime: number = 0;

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let spotifyPreviewFinder: ((songName: string, artistName?: string, limit?: number) => Promise<any>) | null = null;
try {
    spotifyPreviewFinder = require('spotify-preview-finder');
    console.log('Spotify preview finder loaded successfully');
} catch (error) {
    console.error('Failed to load spotify-preview-finder:', error);
}

export async function getSpotifyAccessToken(): Promise<string | null> {
    if (cachedToken && Date.now() < tokenExpiryTime) {
        return cachedToken;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("Missing Spotify client ID or secret in env file");
        return null;
    }

    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + credentials,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });
        
        if (!response.ok) {
            console.error("Failed to fetch Spotify access token", await response.text());
            return null;
        }

        const data = await response.json();
        cachedToken = data.access_token;

        tokenExpiryTime = Date.now() + (data.expires_in - 60) * 1000;
        
        return cachedToken;
    } catch (error) {
        console.error("Error fetching Spotify access token", error);
        return null;
    }
}

async function getPreviewUrl(songName: string, artistName: string, apiPreviewUrl: string | null): Promise<string | null> {
    if (apiPreviewUrl) {
        return apiPreviewUrl;
    }
    
    if (!spotifyPreviewFinder) {
        console.log(`No preview URL from API and preview finder not available`);
        return null;
    }

    try {
        console.log(`No preview URL from API, searching for: "${songName}" by "${artistName}"`);
        const result = await spotifyPreviewFinder(songName, artistName, 1);
        
        if (result.success && result.results.length > 0) {
            const firstResult = result.results[0];
            if (firstResult.previewUrls && firstResult.previewUrls.length > 0) {
                const previewUrl = firstResult.previewUrls[0];
                console.log(`Preview finder found URL: ${previewUrl}`);
                return previewUrl;
            }
        }
        
        console.log('Preview finder: No preview URL found');
        return null;
    } catch (error) {
        console.error(`Preview finder failed:`, error);
        return null;
    }
}

export async function getTrack(trackId: string){
    const token = await getSpotifyAccessToken();
    
    if (!token) {
        throw new Error("Unable to get Spotify access token");
    }

    const trackUrl = `https://api.spotify.com/v1/tracks/${trackId}?market=US`;

    try {
        const response = await fetch(trackUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to fetch track from Spotify", errorText);
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        
        const songName = data.name;
        const artistName = data.artists[0]?.name || '';
        const previewUrl = await getPreviewUrl(songName, artistName, data.preview_url);

        return {
            id: data.id,
            name: data.name,
            artists: data.artists.map((artist: any) => artist.name),
            album: {
                name: data.album.name,
                image: data.album.images[0]?.url 
            },
            previewUrl,
            duration: data.duration_ms,
            releaseDate: data.album.release_date
        };
    } catch (error) {
        console.error("Error fetching track from Spotify", error);
        throw error;
    }
}

export async function getDailyTrack(){
    const token = await getSpotifyAccessToken();
    if(!token) throw new Error("Unable to get Spotify access token");

    const searchTerms = ['pop', 'hits', 'top', 'billboard', 'viral'];
    const today = new Date().toISOString().split('T')[0]!;
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const searchTerm = searchTerms[seed % searchTerms.length];
    
    const url = `https://api.spotify.com/v1/search?q=${searchTerm}&type=track&market=US&limit=50`;

    try{
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        
        if(!response.ok) {
            const errorBody = await response.text();
            console.error(`Spotify API error ${response.status}:`, errorBody);
            throw new Error(`Spotify API error ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.tracks?.items || data.tracks.items.length === 0) {
            throw new Error("No tracks returned from search");
        }
        
        let popularTracks = data.tracks.items.filter((track: any) => track?.id && track?.popularity >= 80);
        
        if (popularTracks.length === 0) {
            console.warn("No 80+ popularity tracks, trying 60+");
            popularTracks = data.tracks.items.filter((track: any) => track?.id && track?.popularity >= 70);
        }
        
        if (popularTracks.length === 0) {
            console.warn("No 60+ popularity tracks, using any valid track");
            popularTracks = data.tracks.items.filter((track: any) => track?.id);
        }

        if (popularTracks.length === 0){
            throw new Error("No valid tracks found");
        }

        const index = seed % popularTracks.length;
        const dailyTrack = popularTracks[index];

        return getTrack(dailyTrack.id)

    }catch(err){
        console.error("Error fetching playlist: ", err);
        throw err;
    }
}

export async function searchTracks(query: string, limit: number = 5) {
    const token = await getSpotifyAccessToken();
    if (!token) {
        throw new Error("Unable to get Spotify access token");
    }
  
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&market=US&limit=${limit}`;
  
    try {
        const response = await fetch(url, {
            headers: { 
                'Authorization': `Bearer ${token}` 
            },
        });
  
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Spotify search API error:", errorText);
            throw new Error(`Spotify API error ${response.status}`);
        }
  
        const data = await response.json();
  
        const tracks = data.tracks.items.map((track: any) => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map((artist: any) => artist.name),
            album: {
                name: track.album.name,
                image: track.album.images[2]?.url || track.album.images[0]?.url || null, // smallest image for autocomplete
            },
            previewUrl: track.preview_url, 
        }));

        return tracks;
    } catch (error) {
        console.error("Error searching tracks from Spotify", error);
        throw error;
    }
}

const MAX_RECENT_TRACKS = 20;
const recentTrackIds = new Set<string>();

function addRecentTrack(trackId: string) {
    if (recentTrackIds.has(trackId)) recentTrackIds.delete(trackId);    
    recentTrackIds.add(trackId);

    while (recentTrackIds.size > MAX_RECENT_TRACKS) {
        const oldest = recentTrackIds.values().next().value;
        recentTrackIds.delete(oldest || "");
    }
}

export async function getRandomTrack(exclude: string[] = []) { 
  const token = await getSpotifyAccessToken();
  if (!token) throw new Error("Unable to get Spotify access token");

  const searchTerms = ['pop', 'rock', 'hip hop', 'dance', 'electronic', 'indie', 'hits', 'chart'];
  const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)]!;
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(randomTerm)}&type=track&market=US&limit=50`;

  try {
      const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Spotify API error ${response.status}`);
    const data = await response.json();

    const excludedIds = new Set([...recentTrackIds, ...exclude]);

    const validTracks = data.tracks.items
      .filter((track: any) => track?.id && !excludedIds.has(track.id) && track.popularity >= 70);

    if (validTracks.length === 0) {
      console.warn("All tracks recently played/excluded, clearing cache...");
      recentTrackIds.clear();
      return getRandomTrack_Fallback();
    }

    const randomTrack = validTracks[Math.floor(Math.random() * validTracks.length)];

    addRecentTrack(randomTrack.id);

    return getTrack(randomTrack.id);
  } catch (err) {
    console.warn("Failed to get random track from playlist, falling back:", err);
    return getRandomTrack_Fallback();
  }
}

async function getRandomTrack_Fallback() {
    console.warn("Fallback random track called...");
    const token = await getSpotifyAccessToken();
    if (!token) throw new Error("Unable to get Spotify access token");
  
    const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    const url = `https://api.spotify.com/v1/search?q=${randomChar}&type=track&limit=1&market=US`;
  
    try {
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }});
      if (!response.ok) throw new Error(`Spotify API error ${response.status}`);
      const data = await response.json();
  
      const track = data.tracks.items[0];
      if (!track) throw new Error("No track found in fallback");
  
      return getTrack(track.id);
    } catch (err) {
      console.error("Fallback track fetch failed:", err);
      throw err;
    }
  }