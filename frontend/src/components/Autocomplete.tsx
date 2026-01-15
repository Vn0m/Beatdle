import { useState, useEffect } from "react";
import { searchTracks, type TrackSuggestion } from "../api/spotify";

interface Props {
  onSelect: (track: TrackSuggestion) => void;
  disabled?: boolean;
}

export default function Autocomplete({ onSelect, disabled = false }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<TrackSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const results = await searchTracks(query);
        setSuggestions(results);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (track: TrackSuggestion) => {
    onSelect(track);
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        className="w-full px-4 py-3.5 rounded border-2 border-gray-300 bg-white text-dark font-sans text-base focus:border-gray-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400"
        placeholder="Type to search for a song..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        disabled={disabled}
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border-2 border-gray-300 w-full mt-2 rounded shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((track) => (
            <li
              key={track.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0 transition-colors"
              onClick={() => handleSelect(track)}
            >
              {track.album.image && (
                <img
                  src={track.album.image}
                  alt={track.name}
                  className="w-12 h-12 rounded shadow-sm"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-dark font-sans truncate">{track.name}</p>
                <p className="text-sm text-gray-500 font-sans truncate">
                  {track.artists.join(", ")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
