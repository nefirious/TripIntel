import React, { useState, useEffect, useRef } from 'react';
import { DESTINATIONS, MONTHS, ACTIVITIES } from '../constants';
import { Search, Shuffle, X } from 'lucide-react';

interface SearchFormProps {
  onSearch: (destination: string, month: string, activity: string) => void;
  isLoading: boolean;
  compact?: boolean;
  mode?: 'travel' | 'business';
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
    <form onSubmit={handleSubmit} className={`brutal-card ${compact ? 'p-4 bg-white' : 'p-4 sm:p-6 bg-[#ff66c4]'} max-w-4xl mx-auto w-full relative`}>
      <div className={`flex ${compact ? 'flex-col' : 'flex-col md:flex-row'} gap-4`}>
        
        <div className="flex-1 flex flex-col gap-1 relative">
          <label className={`font-black uppercase text-[10px] sm:text-sm ${compact ? 'text-gray-500' : 'text-white'} tracking-wider`}>
            {mode === 'travel' ? 'Where to?' : 'Business Hub?'}
          </label>
          <div className="relative">
            <input 
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={mode === 'travel' ? "Start typing a city..." : "Enter city for business intel..."}
              className="w-full p-3 sm:p-4 brutal-border rounded-xl font-bold bg-white focus:outline-none focus:ring-4 focus:ring-white/50 text-base sm:text-lg"
            />
            {destination && (
              <button 
                type="button"
                onClick={() => setDestination('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-2"
              >
                <X className="w-4 h-4 sm:w-5 h-5" />
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
                  className="w-full text-left p-3 sm:p-4 font-bold hover:bg-[#ffde59] border-b-2 border-[#1e1e24] last:border-b-0 transition-colors text-sm sm:text-base"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {mode === 'travel' && (
          <div className="flex-1 flex flex-col gap-1">
            <label className={`font-black uppercase text-[10px] sm:text-sm ${compact ? 'text-gray-500' : 'text-white'} tracking-wider`}>When?</label>
            <select 
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full p-3 sm:p-4 brutal-border rounded-xl font-bold bg-white focus:outline-none focus:ring-4 focus:ring-white/50 appearance-none cursor-pointer text-base sm:text-lg"
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}

        {mode === 'travel' && !compact && (
          <div className="flex-1 flex flex-col gap-1">
            <label className="font-black uppercase text-[10px] sm:text-sm text-white tracking-wider">Vibe?</label>
            <select 
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full p-3 sm:p-4 brutal-border rounded-xl font-bold bg-white focus:outline-none focus:ring-4 focus:ring-white/50 appearance-none cursor-pointer text-base sm:text-lg"
            >
              {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}

      </div>

      <div className={`mt-4 sm:mt-6 flex ${compact ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 justify-between items-center`}>
        {!compact && (
          <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/60 text-center sm:text-left">
            Data powered by <a href="https://safetyindex.net" target="_blank" rel="noreferrer" className="underline hover:text-white transition-colors">safetyindex.net</a>
          </div>
        )}
        <div className={`flex ${compact ? 'flex-col' : 'flex-col sm:flex-row'} gap-3 sm:gap-4 justify-end w-full sm:w-auto`}>
          {!compact && (
            <button
              type="button"
              onClick={handleSurpriseMe}
              disabled={isLoading}
              className="brutal-btn bg-[#5ce1e6] text-[#1e1e24] px-6 py-3 flex items-center justify-center gap-2 hover:bg-[#4bc5ca] w-full sm:w-auto"
            >
              <Shuffle className="w-5 h-5" />
              <span className="uppercase tracking-widest font-black text-xs sm:text-sm">Surprise Me</span>
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !destination}
            className={`brutal-btn ${compact ? 'bg-[#ff66c4] text-white' : 'bg-[#ffde59] text-[#1e1e24]'} px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center gap-2 hover:opacity-90 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto`}
          >
            {isLoading ? (
              <span className="animate-pulse uppercase tracking-widest font-black text-xs sm:text-sm">Analyzing...</span>
            ) : (
              <>
                <Search className="w-5 h-5 sm:w-6 h-6" />
                <span className="uppercase tracking-widest font-black text-xs sm:text-sm">
                  {compact ? 'Add to Compare' : mode === 'travel' ? 'Check Timing' : 'Get Business Intel'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
