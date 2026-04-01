import React, { useState, useEffect, useRef } from 'react';
import { DESTINATIONS, MONTHS, ACTIVITIES } from '../constants';
import { Search, Shuffle, X } from 'lucide-react';

interface SearchFormProps {
  onSearch: (destination: string, month: string, activity: string) => void;
  isLoading: boolean;
  compact?: boolean;
  mode?: 'travel' | 'schools' | 'business';
}

export function SearchForm({ onSearch, isLoading, compact = false, mode = 'travel' }: SearchFormProps) {
  const [destination, setDestination] = useState('');
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [activity, setActivity] = useState(ACTIVITIES[0]);
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (destination.length > 1) {
      const filtered = DESTINATIONS.filter(d => 
        d.toLowerCase().includes(destination.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [destination]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination) {
      // If there's a suggestion that matches exactly or is the only one, use it
      const exactMatch = DESTINATIONS.find(d => d.toLowerCase() === destination.toLowerCase().trim());
      const finalDest = exactMatch || (suggestions.length === 1 ? suggestions[0] : destination.trim());
      
      onSearch(finalDest, month, activity);
      setDestination(finalDest);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSurpriseMe = () => {
    const randomDest = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
    const randomMonth = MONTHS[Math.floor(Math.random() * MONTHS.length)];
    setDestination(randomDest);
    setMonth(randomMonth);
    onSearch(randomDest, randomMonth, activity);
    setShowSuggestions(false);
  };

  const selectSuggestion = (s: string) => {
    setDestination(s);
    setSuggestions([]); // Clear suggestions to prevent effect from showing them again
    setShowSuggestions(false);
    onSearch(s, month, activity);
  };

  return (
    <form onSubmit={handleSubmit} className={`brutal-card ${compact ? 'p-4 bg-white' : 'p-6 bg-[#ff66c4]'} max-w-4xl mx-auto w-full relative`}>
      <div className={`flex ${compact ? 'flex-col' : 'flex-col md:flex-row'} gap-4`}>
        
        <div className="flex-1 flex flex-col gap-1 relative">
          <label className={`font-black uppercase text-sm ${compact ? 'text-gray-500' : 'text-white'} tracking-wider`}>
            {mode === 'travel' ? 'Where to?' : mode === 'schools' ? 'Which City?' : 'Business Hub?'}
          </label>
          <div className="relative">
            <input 
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={mode === 'travel' ? "Start typing a city..." : mode === 'schools' ? "Enter city for school data..." : "Enter city for business intel..."}
              className="w-full p-3 brutal-border rounded-xl font-bold bg-white focus:outline-none focus:ring-4 focus:ring-white/50"
            />
            {destination && (
              <button 
                type="button"
                onClick={() => setDestination('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white brutal-border rounded-xl z-50 shadow-xl overflow-hidden"
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-left p-3 font-bold hover:bg-[#ffde59] border-b-2 border-[#1e1e24] last:border-b-0 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {mode === 'travel' && (
          <div className="flex-1 flex flex-col gap-1">
            <label className={`font-black uppercase text-sm ${compact ? 'text-gray-500' : 'text-white'} tracking-wider`}>When?</label>
            <select 
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full p-3 brutal-border rounded-xl font-bold bg-white focus:outline-none focus:ring-4 focus:ring-white/50 appearance-none cursor-pointer"
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}

        {mode === 'travel' && !compact && (
          <div className="flex-1 flex flex-col gap-1">
            <label className="font-black uppercase text-sm text-white tracking-wider">Vibe?</label>
            <select 
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full p-3 brutal-border rounded-xl font-bold bg-white focus:outline-none focus:ring-4 focus:ring-white/50 appearance-none cursor-pointer"
            >
              {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}

      </div>

      <div className={`mt-6 flex ${compact ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 justify-between items-center`}>
        {!compact && (
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60">
            Data powered by <a href="https://safetyindex.net" target="_blank" rel="noreferrer" className="underline hover:text-white transition-colors">safetyindex.net</a>
          </div>
        )}
        <div className={`flex ${compact ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 justify-end w-full sm:w-auto`}>
          {!compact && (
            <button
              type="button"
              onClick={handleSurpriseMe}
              disabled={isLoading}
              className="brutal-btn bg-[#5ce1e6] text-[#1e1e24] px-6 py-3 flex items-center justify-center gap-2 hover:bg-[#4bc5ca]"
            >
              <Shuffle className="w-5 h-5" />
              Surprise Me
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !destination}
            className={`brutal-btn ${compact ? 'bg-[#ff66c4] text-white' : 'bg-[#ffde59] text-[#1e1e24]'} px-8 py-3 flex items-center justify-center gap-2 hover:opacity-90 text-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <span className="animate-pulse">Analyzing...</span>
            ) : (
              <>
                <Search className="w-5 h-5" />
                {compact ? 'Add to Compare' : mode === 'travel' ? 'Check Timing' : mode === 'schools' ? 'Evaluate Schools' : 'Get Business Intel'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
