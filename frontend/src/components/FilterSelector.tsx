import { useState } from 'react';
import type { GameFilters } from '../types';

interface FilterSelectorProps {
  onFiltersChange: (filters: GameFilters) => void;
  initialFilters?: GameFilters;
}

const GENRES = [
  'pop', 'rock', 'hip-hop', 'country', 'jazz', 'classical', 
  'electronic', 'r&b', 'reggae', 'indie', 'metal', 'folk'
];

const DECADES = [
  { label: '1960s', start: 1960, end: 1969 },
  { label: '1970s', start: 1970, end: 1979 },
  { label: '1980s', start: 1980, end: 1989 },
  { label: '1990s', start: 1990, end: 1999 },
  { label: '2000s', start: 2000, end: 2009 },
  { label: '2010s', start: 2010, end: 2019 },
  { label: '2020s', start: 2020, end: 2029 },
];

export default function FilterSelector({ onFiltersChange, initialFilters }: FilterSelectorProps) {
  const [genre, setGenre] = useState(initialFilters?.genre || '');
  const [artist, setArtist] = useState(initialFilters?.artist || '');
  const [selectedDecade, setSelectedDecade] = useState<string>('');

  const handleGenreChange = (value: string) => {
    setGenre(value);
    updateFilters({ genre: value || undefined });
  };

  const handleArtistChange = (value: string) => {
    setArtist(value);
    updateFilters({ artist: value || undefined });
  };

  const handleDecadeChange = (value: string) => {
    setSelectedDecade(value);
    if (value) {
      const decade = DECADES.find(d => d.label === value);
      if (decade) {
        updateFilters({ decadeStart: decade.start, decadeEnd: decade.end });
      }
    } else {
      updateFilters({ decadeStart: undefined, decadeEnd: undefined });
    }
  };

  const updateFilters = (updates: Partial<GameFilters>) => {
    const newFilters: GameFilters = {
      genre: updates.genre !== undefined ? updates.genre : (genre || undefined),
      artist: updates.artist !== undefined ? updates.artist : (artist || undefined),
      decadeStart: updates.decadeStart !== undefined ? updates.decadeStart : initialFilters?.decadeStart,
      decadeEnd: updates.decadeEnd !== undefined ? updates.decadeEnd : initialFilters?.decadeEnd,
    };
    
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key as keyof GameFilters] === undefined) {
        delete newFilters[key as keyof GameFilters];
      }
    });
    
    onFiltersChange(newFilters);
  };

  const handleClear = () => {
    setGenre('');
    setArtist('');
    setSelectedDecade('');
    onFiltersChange({});
  };

  const hasFilters = genre || artist || selectedDecade;

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
          <select
            value={genre}
            onChange={(e) => handleGenreChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded bg-white focus:outline-none focus:border-gray-400 transition-colors text-dark"
          >
            <option value="">Any Genre</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Decade</label>
          <select
            value={selectedDecade}
            onChange={(e) => handleDecadeChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded bg-white focus:outline-none focus:border-gray-400 transition-colors text-dark"
          >
            <option value="">Any Decade</option>
            {DECADES.map((d) => (
              <option key={d.label} value={d.label}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Artist</label>
        <input
          type="text"
          value={artist}
          onChange={(e) => handleArtistChange(e.target.value)}
          placeholder="Search by artist name..."
          className="w-full px-4 py-2 border-2 border-gray-300 rounded bg-white focus:outline-none focus:border-gray-400 transition-colors text-dark"
        />
      </div>

      {hasFilters && (
        <button
          onClick={handleClear}
          className="w-full py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
