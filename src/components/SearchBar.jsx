import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';

export default function SearchBar({ onSearch, onGeolocate, searchCity }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    if (!val.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchCity(val);
        setResults(res);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelect = (r) => {
    setQuery(`${r.name}, ${r.country}`);
    setOpen(false);
    setResults([]);
    onSearch(r.latitude, r.longitude, r.name, r.country);
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 focus-within:border-atmo-blue/60 transition-all duration-300">
        {searching ? (
          <Loader2 className="w-5 h-5 text-atmo-blue animate-spin shrink-0" />
        ) : (
          <Search className="w-5 h-5 text-white/50 shrink-0" />
        )}
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search city or region..."
          className="flex-1 bg-transparent text-white placeholder-white/40 outline-none font-body text-sm"
        />
        {query && (
          <button onClick={clear} className="text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onGeolocate}
          title="Use my location"
          className="text-white/50 hover:text-atmo-blue transition-colors border-l border-white/20 pl-3 ml-1"
        >
          <MapPin className="w-5 h-5" />
        </button>
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-2 w-full bg-sky-900/95 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
          {results.map((r, i) => (
            <button
              key={`${r.latitude}-${r.longitude}-${i}`}
              onClick={() => handleSelect(r)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-none"
            >
              <MapPin className="w-4 h-4 text-atmo-blue shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">{r.name}</p>
                <p className="text-white/40 text-xs">
                  {[r.admin1, r.country].filter(Boolean).join(', ')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
