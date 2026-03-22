import { useState, useEffect } from 'react';
import { SearchForm } from './components/SearchForm';
import { SnapshotCard } from './components/SnapshotCard';
import { CityCard } from './components/CityCard';
import { LegalModal } from './components/LegalModal';
import { getTravelSnapshot, TravelSnapshot } from './services/gemini';
import { getLiveAdvisories, TravelAdvisory } from './services/advisory';
import { MapPin, Sparkles, Activity, Globe, Pin, Megaphone, Loader2, Compass, Share2, Check } from 'lucide-react';
import { MONTHS, DESTINATIONS } from './constants';

const FEATURED_CITIES = [
  "Tokyo, Japan",
  "Paris, France",
  "London, UK",
  "Bali, Indonesia",
  "New York City, USA",
  "Sydney, Australia"
];

// Mock data for initial featured cards to avoid massive API calls on load
// In a real app, these would be cached or pre-generated
const INITIAL_FEATURED_DATA = [
  { city: "Tokyo, Japan", score: 9, weatherIcon: 'sun' as const, temperature: "15°C" },
  { city: "Paris, France", score: 7, weatherIcon: 'cloud' as const, temperature: "12°C" },
  { city: "London, UK", score: 5, weatherIcon: 'rain' as const, temperature: "10°C" },
  { city: "Bali, Indonesia", score: 8, weatherIcon: 'sun' as const, temperature: "28°C" },
  { city: "New York City, USA", score: 6, weatherIcon: 'cloud' as const, temperature: "8°C" },
  { city: "Sydney, Australia", score: 9, weatherIcon: 'sun' as const, temperature: "24°C" },
];

export default function App() {
  const [snapshot, setSnapshot] = useState<TravelSnapshot | null>(null);
  const [comparisonSnapshot, setComparisonSnapshot] = useState<TravelSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSearch, setCurrentSearch] = useState({ destination: '', month: '' });
  const [comparisonSearch, setComparisonSearch] = useState({ destination: '', month: '' });
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'privacy' | 'terms' | 'liability' }>({
    isOpen: false,
    type: 'privacy'
  });
  const [activeQueries, setActiveQueries] = useState(1240);
  const [advisories, setAdvisories] = useState<TravelAdvisory[]>([]);
  const [isAdvisoriesLoading, setIsAdvisoriesLoading] = useState(true);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    async function fetchAdvisories() {
      setIsAdvisoriesLoading(true);
      try {
        const data = await getLiveAdvisories();
        setAdvisories(data);
      } catch (err) {
        console.error("Failed to fetch advisories", err);
      } finally {
        setIsAdvisoriesLoading(false);
      }
    }
    
    fetchAdvisories();
    const interval = setInterval(fetchAdvisories, 1000 * 60 * 30); // Every 30 mins
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQueries(prev => {
        const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
        return Math.max(1100, Math.min(1500, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const currentMonth = MONTHS[new Date().getMonth()];

  const handleShare = async () => {
    const shareData = {
      title: 'TripIntel | Unfiltered Travel Intelligence',
      text: 'Check out the real truth about travel destinations on TripIntel.',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleSearch = async (destination: string, month: string, activity: string = 'General', isSecondCity: boolean = false) => {
    if (isSecondCity) {
      setIsComparing(true);
    } else {
      setIsComparing(false);
      setComparisonSnapshot(null);
    }

    setIsLoading(true);
    setError(null);
    
    if (!isSecondCity) {
      setSnapshot(null);
      setCurrentSearch({ destination, month });
    } else {
      setComparisonSearch({ destination, month });
    }

    // Scroll to results
    window.scrollTo({ top: 400, behavior: 'smooth' });

    try {
      const data = await getTravelSnapshot(destination, month, activity);
      if (isSecondCity) {
        setComparisonSnapshot(data);
      } else {
        setSnapshot(data);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "";
      if (msg.includes("overwhelmed") || msg.includes("503") || msg.includes("429")) {
        setError("The travel advisor is currently very busy. Please wait a few seconds and try again.");
      } else {
        setError("Oops! We couldn't fetch the travel data right now. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-4 border-[#1e1e24] py-2 px-6 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setSnapshot(null)}>
            <div className="relative w-16 h-16 flex items-center justify-center">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-[#1e1e24] bg-white shadow-[4px_4px_0px_0px_#1e1e24] group-hover:rotate-12 transition-transform duration-500"></div>
              {/* Compass Face */}
              <svg viewBox="0 0 100 100" className="w-10 h-10 relative z-10 group-hover:scale-110 transition-transform duration-500">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e1e24" strokeWidth="1" strokeDasharray="2 4" />
                {/* Cardinal Points */}
                <text x="50" y="15" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1e1e24">N</text>
                <text x="50" y="92" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1e1e24">S</text>
                <text x="85" y="54" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1e1e24">E</text>
                <text x="15" y="54" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1e1e24">W</text>
                {/* Needle */}
                <path d="M50 15 L58 50 L50 85 L42 50 Z" fill="#1e1e24" />
                <path d="M50 15 L50 50 L42 50 Z" fill="#ffde59" />
                <path d="M50 85 L50 50 L58 50 Z" fill="#ff5757" />
                <circle cx="50" cy="50" r="4" fill="#1e1e24" stroke="white" strokeWidth="1" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-black tracking-tighter uppercase text-[#1e1e24] leading-none">TripIntel</h1>
              <div className="flex items-center gap-2">
                <span className="h-[2px] w-4 bg-[#ff5757]"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff5757]">Unfiltered Intelligence</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 text-[10px] font-black uppercase tracking-widest animate-pulse">
              <Activity className="w-3 h-3" /> Live Data Active
            </div>
            <div className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-full brutal-border">
              Powered by <a href="https://safetyindex.net" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">safetyindex.net</a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full flex flex-col gap-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block bg-[#ffde59] px-4 py-1 rounded-full brutal-border mb-4 font-black uppercase tracking-widest text-xs">
            Exploring {DESTINATIONS.length} Global Destinations
          </div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">
            Know <span className="text-[#ff5757]">Before</span> <br/> You Go
          </h2>
          <p className="text-xl font-bold text-gray-600 mb-8">
            Don't just check the temperature. Discover the real truth about crowds, pricing, and local realities.
          </p>
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Results Section */}
        {(isLoading || snapshot || error) && (
          <div className="w-full space-y-8 min-h-[400px]">
            <div className="flex items-center gap-3 justify-center">
              <div className="h-1 flex-1 bg-[#1e1e24]"></div>
              <h3 className="font-black uppercase tracking-widest text-xl">
                {isComparing ? 'Comparison View' : 'Your Travel Intel'}
              </h3>
              <div className="h-1 flex-1 bg-[#1e1e24]"></div>
            </div>

            {isLoading && !snapshot && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 border-8 border-[#ffde59] border-t-[#1e1e24] rounded-full animate-spin"></div>
                <p className="font-black uppercase tracking-widest animate-pulse">Consulting the travel gods...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-100 text-red-800 p-6 rounded-xl brutal-border font-bold text-center max-w-2xl mx-auto">
                {error}
              </div>
            )}

            <div className={`grid grid-cols-1 ${isComparing ? 'lg:grid-cols-2' : ''} gap-8`}>
              {snapshot && (
                <div className="space-y-4">
                  <SnapshotCard 
                    snapshot={snapshot} 
                    destination={currentSearch.destination} 
                    month={currentSearch.month}
                    isCompact={isComparing}
                  />
                  {!isComparing && !isLoading && (
                    <div className="flex justify-center">
                      <button 
                        onClick={() => setIsComparing(true)}
                        className="brutal-btn bg-[#5ce1e6] px-6 py-2 text-sm uppercase tracking-widest"
                      >
                        Compare with another city
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isComparing && (
                <div className="space-y-4">
                  {!comparisonSnapshot && isLoading ? (
                    <div className="brutal-card h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-gray-50">
                      <div className="w-12 h-12 border-4 border-[#ffde59] border-t-[#1e1e24] rounded-full animate-spin mb-4"></div>
                      <p className="font-bold uppercase text-sm tracking-widest">Loading second city...</p>
                    </div>
                  ) : comparisonSnapshot ? (
                    <SnapshotCard 
                      snapshot={comparisonSnapshot} 
                      destination={comparisonSearch.destination} 
                      month={comparisonSearch.month}
                      isCompact={true}
                    />
                  ) : (
                    <div className="brutal-card h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-[#ffde59]/10 border-dashed">
                      <p className="font-black uppercase text-center mb-6">Select a second city to compare</p>
                      <SearchForm 
                        onSearch={(d, m, a) => handleSearch(d, m, a, true)} 
                        isLoading={isLoading}
                        compact={true}
                      />
                      <button 
                        onClick={() => setIsComparing(false)}
                        className="mt-4 text-xs font-bold uppercase underline"
                      >
                        Cancel Comparison
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Featured Grid */}
        {!snapshot && !isLoading && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-[#ffde59]" /> Featured in {currentMonth}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {INITIAL_FEATURED_DATA.map((data) => (
                <CityCard 
                  key={data.city}
                  city={data.city}
                  score={data.score}
                  weatherIcon={data.weatherIcon}
                  temperature={data.temperature}
                  onClick={() => handleSearch(data.city, currentMonth)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Travel Advisory Board */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-[#ff5757]" />
              <h3 className="text-3xl font-black uppercase tracking-tight">Global Advisory Board</h3>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={async () => {
                  setIsAdvisoriesLoading(true);
                  const data = await getLiveAdvisories();
                  setAdvisories(data);
                  setIsAdvisoriesLoading(false);
                }}
                disabled={isAdvisoriesLoading}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#1e1e24] transition-colors disabled:opacity-50"
              >
                <Activity className={`w-3 h-3 ${isAdvisoriesLoading ? 'animate-spin' : ''}`} />
                {isAdvisoriesLoading ? 'Updating...' : 'Refresh Feed'}
              </button>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Live News Feed
              </div>
            </div>
          </div>
          
          <div className="bg-[#d2b48c] p-8 rounded-xl brutal-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden min-h-[350px] flex flex-wrap gap-6 justify-center items-center">
            {/* Cork texture effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
            
            {isAdvisoriesLoading && advisories.length === 0 ? (
              <div className="flex flex-col items-center gap-3 relative z-10">
                <Loader2 className="w-10 h-10 animate-spin text-[#1e1e24]" />
                <p className="font-black uppercase text-sm tracking-widest">Scanning Global News...</p>
              </div>
            ) : (
              advisories.map((advisory, idx) => {
                const rotation = (idx % 2 === 0 ? -1 : 1) * (Math.random() * 3 + 1);
                const pinColor = 
                  advisory.level === 'High Caution' ? 'text-red-600 fill-red-600' :
                  advisory.level === 'Warning' ? 'text-orange-600 fill-orange-600' :
                  advisory.level === 'Caution' ? 'text-yellow-600 fill-yellow-600' :
                  'text-blue-600 fill-blue-600';
                
                const badgeColor = 
                  advisory.level === 'High Caution' ? 'bg-red-100 text-red-800' :
                  advisory.level === 'Warning' ? 'bg-orange-100 text-orange-800' :
                  advisory.level === 'Caution' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800';

                return (
                  <div 
                    key={idx} 
                    className="brutal-card bg-white p-4 max-w-[220px] relative transition-transform hover:scale-105 hover:z-10"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <Pin className={`absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 ${pinColor}`} />
                    <div className={`${badgeColor} text-[10px] font-black uppercase px-2 py-0.5 mb-2 inline-block`}>
                      {advisory.level}
                    </div>
                    <p className="font-bold text-sm leading-tight">{advisory.location}</p>
                    <p className="text-[10px] mt-1 opacity-70 font-medium">{advisory.message}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Real-time Data Notice */}
        <div className="mt-16 p-8 bg-[#1e1e24] text-white rounded-3xl brutal-border brutal-shadow flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <Globe className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <div className="bg-[#ffde59] text-[#1e1e24] px-4 py-1 rounded-full font-black uppercase tracking-widest text-xs">
              Real-Time Intelligence
            </div>
            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none">
              Connected to the <br/> <span className="text-[#5ce1e6]">Live Global Pulse</span>
            </h3>
            <p className="text-sm font-bold opacity-70 max-w-md">
              TripIntel is connected to real-time data streams. Every snapshot is generated using the latest available information on weather, pricing, and local events to give you the most accurate advice possible.
            </p>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1e1e24] bg-gray-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <span className="font-black text-xs uppercase tracking-widest text-[#ffde59]">{activeQueries.toLocaleString()}+ Active Queries</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              System Status: Operational
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="mt-8">
          <div className="brutal-card bg-[#5ce1e6] p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute -left-4 -bottom-4 opacity-10 rotate-12">
              <Share2 className="w-32 h-32" />
            </div>
            <div className="relative z-10 text-center md:text-left">
              <h4 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">Spread the Intelligence</h4>
              <p className="font-bold text-gray-800">Help others discover the unfiltered truth about their next destination.</p>
            </div>
            <button 
              onClick={handleShare}
              className="relative z-10 flex items-center gap-3 bg-[#ffde59] text-[#1e1e24] px-8 py-4 rounded-xl brutal-border shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group min-w-[240px] justify-center"
            >
              {showCopied ? (
                <>
                  <Check className="w-6 h-6" />
                  <span className="text-lg font-black uppercase tracking-widest">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  <span className="text-lg font-black uppercase tracking-widest">Share TripIntel</span>
                </>
              )}
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#1e1e24] text-white py-12 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ffde59] rounded-lg brutal-border flex items-center justify-center shadow-[2px_2px_0px_0px_#1e1e24]">
                <Compass className="w-6 h-6 text-[#1e1e24]" />
              </div>
              <div className="font-black text-3xl tracking-tighter">TRIPINTEL</div>
            </div>
            <p className="text-xs font-bold opacity-50 uppercase tracking-widest">© 2026 TripIntel | Unfiltered Travel Intelligence</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold uppercase tracking-wider">
            <button 
              onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })}
              className="hover:text-[#ffde59] transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setLegalModal({ isOpen: true, type: 'liability' })}
              className="hover:text-[#ffde59] transition-colors"
            >
              Legal Liability
            </button>
            <button 
              onClick={() => setLegalModal({ isOpen: true, type: 'terms' })}
              className="hover:text-[#ffde59] transition-colors"
            >
              Terms
            </button>
            <a href="https://safetyindex.net" target="_blank" rel="noreferrer" className="hover:text-[#ffde59] transition-colors">Safety Index</a>
          </div>
        </div>
      </footer>

      <LegalModal 
        isOpen={legalModal.isOpen} 
        onClose={() => setLegalModal(prev => ({ ...prev, isOpen: false }))} 
        type={legalModal.type} 
      />
    </div>
  );
}
