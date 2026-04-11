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

const SEARCH_GENRES = [
  'pop', 'rock', 'hip hop', 'r&b', 'soul', 'funk', 'disco', 'country',
  'indie', 'alternative', 'electronic', 'dance', 'metal', 'punk', 'reggae',
  'blues', 'jazz', 'classic rock', 'folk', 'latin', 'kpop', 'punk rock',
];

const SEARCH_DECADES = [
  { start: 1970, end: 1979 },
  { start: 1980, end: 1989 },
  { start: 1990, end: 1999 },
  { start: 2000, end: 2009 },
  { start: 2010, end: 2019 },
  { start: 2020, end: 2026 },
];

export async function getDailyTrack(userDate?: string){
    const token = await getSpotifyAccessToken();
    if(!token) throw new Error("Unable to get Spotify access token");

    const today = userDate || new Date().toISOString().split('T')[0]!;
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const genre = SEARCH_GENRES[seed % SEARCH_GENRES.length]!;
    const decade = SEARCH_DECADES[(seed >> 3) % SEARCH_DECADES.length]!;
    const offset = ((seed >> 6) % 20) * 5;

    const query = `${genre} year:${decade.start}-${decade.end}`;
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&market=US&limit=50&offset=${offset}`;

    try{
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
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
        
        let popularTracks = data.tracks.items.filter((track: any) => track?.id && track?.popularity >= 70 && isBaseVersion(track.name));
        
        if (popularTracks.length === 0) {
            popularTracks = data.tracks.items.filter((track: any) => track?.id && track?.popularity >= 55 && isBaseVersion(track.name));
        }
        
        if (popularTracks.length === 0) {
            popularTracks = data.tracks.items.filter((track: any) => track?.id && isBaseVersion(track.name));
        }

        if (popularTracks.length === 0){
            throw new Error("No valid tracks found");
        }

        const index = seed % popularTracks.length;
        const dailyTrack = popularTracks[index];

        addRecentTrack(dailyTrack.id);
        return getTrack(dailyTrack.id);

    }catch(err){
        console.error("Error fetching daily track: ", err);
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

const VERSION_SUFFIXES = [
  /\(remaster/i, /\(live/i, /\(radio edit/i, /\(single version/i,
  /\(album version/i, /\(lp version/i, /\(deluxe/i, /\(acoustic/i,
  /\(demo/i, /\(edit\)/i, /\(anniversary/i, /\(mono/i, /\(stereo/i,
  /\(bonus track/i, /\(\d{4}\s+mix\)/i,
  /\[remaster/i, /\[live/i, /\[\d{4}\s+mix\]/i,
  /- remaster/i, /- \d{4}\s+mix/i, /- \d{4}\s+remaster/i,
  /- live/i, /- radio edit/i, /- acoustic/i, /- mono/i, /- stereo/i,
  /- demo/i, /- bonus track/i, /- deluxe/i, /- edit$/i,
];

function isBaseVersion(trackName: string): boolean {
  return !VERSION_SUFFIXES.some(p => p.test(trackName));
}

const MAX_RECENT_TRACKS = 10;
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

  const genre = SEARCH_GENRES[Math.floor(Math.random() * SEARCH_GENRES.length)]!;
  const decade = SEARCH_DECADES[Math.floor(Math.random() * SEARCH_DECADES.length)]!;
  const offset = Math.floor(Math.random() * 20) * 5;

  const query = `${genre} year:${decade.start}-${decade.end}`;
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&market=US&limit=50&offset=${offset}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Spotify API error ${response.status}`);
    const data = await response.json();

    const excludedIds = new Set([...recentTrackIds, ...exclude]);

    let validTracks = data.tracks.items
      .filter((track: any) => track?.id && !excludedIds.has(track.id) && track.popularity >= 65 && isBaseVersion(track.name));

    if (validTracks.length === 0) {
      validTracks = data.tracks.items
        .filter((track: any) => track?.id && !excludedIds.has(track.id) && track.popularity >= 50 && isBaseVersion(track.name));
    }

    if (validTracks.length === 0) {
      validTracks = data.tracks.items
        .filter((track: any) => track?.id && !excludedIds.has(track.id) && isBaseVersion(track.name));
    }

    if (validTracks.length === 0) {
      recentTrackIds.clear();
      validTracks = data.tracks.items
        .filter((track: any) => track?.id && isBaseVersion(track.name));
    }

    if (validTracks.length === 0) {
      throw new Error("No valid tracks found");
    }

    const randomTrack = validTracks[Math.floor(Math.random() * validTracks.length)];
    addRecentTrack(randomTrack.id);

    return getTrack(randomTrack.id);
  } catch (err) {
    console.warn("Failed to get random track, retrying with new search:", err);
    return getRandomTrack_Retry(exclude);
  }
}

async function getRandomTrack_Retry(exclude: string[] = []) {
    const token = await getSpotifyAccessToken();
    if (!token) throw new Error("Unable to get Spotify access token");

    const genre = SEARCH_GENRES[Math.floor(Math.random() * SEARCH_GENRES.length)]!;
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(genre)}&type=track&limit=50&market=US`;

    try {
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }});
      if (!response.ok) throw new Error(`Spotify API error ${response.status}`);
      const data = await response.json();

      const validTracks = data.tracks.items
        .filter((track: any) => track?.id && track.popularity >= 50 && isBaseVersion(track.name));

      const track = validTracks.length > 0
        ? validTracks[Math.floor(Math.random() * validTracks.length)]
        : data.tracks.items[0];

      if (!track) throw new Error("No track found in retry");

      addRecentTrack(track.id);
      return getTrack(track.id);
    } catch (err) {
      console.error("Retry track fetch failed:", err);
      throw err;
    }
  }

async function getArtistTracks(artistName: string, token: string): Promise<any[]> {
  try {
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=5&market=US`;
    const searchResp = await fetch(searchUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!searchResp.ok) return [];
    const searchData = await searchResp.json();

    const artist = searchData.artists?.items?.find((a: any) =>
      a.name.toLowerCase() === artistName.toLowerCase()
    ) || searchData.artists?.items?.[0];
    if (!artist) return [];

    const topUrl = `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=US`;
    const topResp = await fetch(topUrl, { headers: { Authorization: `Bearer ${token}` } });
    const topTracks = topResp.ok ? (await topResp.json()).tracks || [] : [];

    const albumsUrl = `https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album,single&market=US&limit=50`;
    const albumsResp = await fetch(albumsUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!albumsResp.ok) return topTracks;
    const albumsData = await albumsResp.json();
    const albumIds = (albumsData.items || []).map((a: any) => a.id);
    if (albumIds.length === 0) return topTracks;

    const shuffled = albumIds.sort(() => Math.random() - 0.5).slice(0, 20);
    const batchUrl = `https://api.spotify.com/v1/albums?ids=${shuffled.join(',')}&market=US`;
    const batchResp = await fetch(batchUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!batchResp.ok) return topTracks;
    const batchData = await batchResp.json();

    const albumTracks = (batchData.albums || []).flatMap((album: any) =>
      (album.tracks?.items || []).map((t: any) => ({
        ...t,
        album: { name: album.name, images: album.images },
        popularity: t.popularity ?? 0,
      }))
    );

    const allById = new Map<string, any>();
    for (const t of [...topTracks, ...albumTracks]) {
      if (t?.id) allById.set(t.id, t);
    }
    return Array.from(allById.values());
  } catch {
    return [];
  }
}

export async function getCustomTrack(settings?: { genre?: string; artist?: string; decadeStart?: number; decadeEnd?: number }, exclude: string[] = []) {
  const token = await getSpotifyAccessToken();
  if (!token) throw new Error("Unable to get Spotify access token");

  let queryParts: string[] = [];
  
  if (settings?.artist) {
    queryParts.push(settings.artist);
  }
  
  if (settings?.decadeStart && settings?.decadeEnd) {
    queryParts.push(`year:${settings.decadeStart}-${settings.decadeEnd}`);
  } else if (settings?.decadeStart) {
    queryParts.push(`year:${settings.decadeStart}-${settings.decadeStart + 9}`);
  }

  if (settings?.genre && !settings?.artist) {
    queryParts.push(`genre:"${settings.genre.toLowerCase()}"`);
  }

  if (queryParts.length === 0) {
    const fallbackTerms = ['pop', 'rock', 'hits', 'chart'];
    queryParts.push(fallbackTerms[Math.floor(Math.random() * fallbackTerms.length)]!);
  }

  const query = queryParts.join(' ');
  const offset = Math.floor(Math.random() * 10) * 5;
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&market=US&limit=50&offset=${offset}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      console.error(`Spotify API error ${response.status}:`, await response.text());
      throw new Error(`Spotify API error ${response.status}`);
    }
    const data = await response.json();

    const excludedIds = new Set([...recentTrackIds, ...exclude]);

    const filterTrack = (track: any, artistInput: string) => {
      const input = artistInput.toLowerCase();
      return track.artists.some((a: any) => a.name.toLowerCase() === input);
    };

    let validTracks: any[] = [];

    if (settings?.artist) {
      const artistTracks = await getArtistTracks(settings.artist, token);

      const popularTracks: any[] = [];
      const deepCuts: any[] = [];     
      const seenIds = new Set<string>();

      for (const t of [...artistTracks, ...data.tracks.items]) {
        if (!t?.id || seenIds.has(t.id)) continue;
        seenIds.add(t.id);
        if (!isBaseVersion(t.name) || !filterTrack(t, settings.artist!)) continue;
        if (t.popularity !== undefined && t.popularity > 0) {
          popularTracks.push(t);
        } else {
          deepCuts.push(t);
        }
      }

      popularTracks.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));

      const freshPopular = popularTracks.filter((t: any) => !excludedIds.has(t.id));
      const freshDeep = deepCuts.filter((t: any) => !excludedIds.has(t.id));

      const useDeepCut = freshDeep.length > 0 && Math.random() < 0.3;

      if (useDeepCut) {
        validTracks = freshDeep;
      } else if (freshPopular.length > 0) {
        validTracks = freshPopular;
      } else if (freshDeep.length > 0) {
        validTracks = freshDeep;
      } else if (popularTracks.length > 0) {
        validTracks = popularTracks;
      } else {
        validTracks = deepCuts;
      }
    } else {
      validTracks = data.tracks.items
        .filter((track: any) => {
          if (!track?.id || excludedIds.has(track.id)) return false;
          return track.popularity >= 65 && isBaseVersion(track.name);
        });

      if (validTracks.length === 0) {
        validTracks = data.tracks.items
          .filter((track: any) => track?.id && !excludedIds.has(track.id) && track.popularity >= 40 && isBaseVersion(track.name));
      }

      if (validTracks.length === 0) {
        validTracks = data.tracks.items
          .filter((track: any) => track?.id && !excludedIds.has(track.id) && isBaseVersion(track.name));
      }
    }

    if (validTracks.length === 0) {
      return getRandomTrack(exclude);
    }

    const randomTrack = validTracks[Math.floor(Math.random() * validTracks.length)];
    addRecentTrack(randomTrack.id);
    
    const track = await getTrack(randomTrack.id);
    console.log(`🎵 Custom track: "${track.name}" by ${track.artists.join(', ')} (${track.releaseDate.slice(0, 4)})`);
    return track;
  } catch (err) {
    console.warn("Failed to get custom track, falling back to random:", err);
    return getRandomTrack(exclude);
    }
  }