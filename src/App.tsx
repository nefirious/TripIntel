import { useState, useEffect, useRef } from 'react';
import { SearchForm } from './components/SearchForm';
import { SnapshotCard } from './components/SnapshotCard';
import { CityCard } from './components/CityCard';
import { LegalModal } from './components/LegalModal';
import { SchoolQualityCard } from './components/SchoolQualityCard';
import { BusinessQualityCard } from './components/BusinessQualityCard';
import { getTravelSnapshot, TravelSnapshot, RedditDigest } from './services/gemini';
import { getAirportStatus, AirportStatus } from './services/airport';
import { getLiveAdvisories, TravelAdvisory } from './services/advisory';
import { getSchoolQualitySnapshot, SchoolQualitySnapshot } from './services/schools';
import { getBusinessSnapshot, BusinessSnapshot } from './services/business';
import { getRedditDigest } from './services/reddit';
import { RedditDigestCard } from './components/RedditDigestCard';
import { MapPin, Sparkles, Activity, Globe, Pin, Megaphone, Loader2, Compass, Share2, Check, Plane, GraduationCap, TrendingUp, Briefcase } from 'lucide-react';
import { MONTHS, DESTINATIONS } from './constants';

const FEATURED_CITIES = [
  "Kyoto, Japan",
  "Rome, Italy",
  "Amsterdam, Netherlands",
  "Washington DC, USA",
  "Seville, Spain",
  "Cancun, Mexico"
];

// Mock data for initial featured cards to avoid massive API calls on load
// In a real app, these would be cached or pre-generated
const INITIAL_FEATURED_DATA = [
  { city: "Kyoto, Japan", score: 9.8, weatherIcon: 'sun' as const, temperature: "18°C" },
  { city: "Rome, Italy", score: 9.5, weatherIcon: 'sun' as const, temperature: "19°C" },
  { city: "Amsterdam, Netherlands", score: 9.7, weatherIcon: 'sun' as const, temperature: "14°C" },
  { city: "Washington DC, USA", score: 9.4, weatherIcon: 'sun' as const, temperature: "17°C" },
  { city: "Seville, Spain", score: 9.8, weatherIcon: 'sun' as const, temperature: "24°C" },
  { city: "Cancun, Mexico", score: 9.2, weatherIcon: 'sun' as const, temperature: "29°C" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'travel' | 'schools' | 'business'>('travel');
  const [snapshot, setSnapshot] = useState<TravelSnapshot | null>(null);
  const [airportStatus, setAirportStatus] = useState<AirportStatus | null>(null);
  const [schoolSnapshot, setSchoolSnapshot] = useState<SchoolQualitySnapshot | null>(null);
  const [businessSnapshot, setBusinessSnapshot] = useState<BusinessSnapshot | null>(null);
  const [redditDigest, setRedditDigest] = useState<RedditDigest | null>(null);
  const [comparisonSnapshot, setComparisonSnapshot] = useState<TravelSnapshot | null>(null);
  const [comparisonAirportStatus, setComparisonAirportStatus] = useState<AirportStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedditLoading, setIsRedditLoading] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSearch, setCurrentSearch] = useState({ destination: '', month: '' });
  const [comparisonSearch, setComparisonSearch] = useState({ destination: '', month: '' });
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'privacy' | 'terms' | 'liability' | 'about' }>({
    isOpen: false,
    type: 'privacy'
  });
  const [activeQueries, setActiveQueries] = useState(1240);
  const [advisories, setAdvisories] = useState<TravelAdvisory[]>([]);
  const [isAdvisoriesLoading, setIsAdvisoriesLoading] = useState(true);
  const [showCopied, setShowCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

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
    // Re-parse XFBML when component mounts or tab changes to ensure Facebook plugin renders
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, [activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQueries(prev => {
        const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
        return Math.max(1100, Math.min(1500, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const metaData = {
      travel: {
        title: "TripIntel | Unfiltered Travel Intelligence & Real-Time Destination Reports",
        description: "Get the real truth about global travel destinations. TripIntel provides unfiltered intelligence on crowds, pricing, and local realities before you book."
      },
      schools: {
        title: "TripIntel Schools | Global Education Quality & School Comparison Database",
        description: "Compare school quality across global education hubs. Analyze curriculums, teacher ratings, and infrastructure with TripIntel's blunt school reports."
      },
      business: {
        title: "TripIntel Business | Global Market Entry & Business Intelligence for Founders",
        description: "Navigate global business markets with real intel. TripIntel provides blunt data on registration hurdles, ownership rules, and commercial market realities."
      }
    };

    const currentMeta = metaData[activeTab];
    document.title = currentMeta.title;
    
    const updateMeta = (name: string, content: string, attr: string = 'name') => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('description', currentMeta.description);
    updateMeta('og:title', currentMeta.title, 'property');
    updateMeta('og:description', currentMeta.description, 'property');
    updateMeta('twitter:title', currentMeta.title);
    updateMeta('twitter:description', currentMeta.description);
  }, [activeTab]);
  
  const currentMonth = "April";

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
      setAirportStatus(null);
      setSchoolSnapshot(null);
      setBusinessSnapshot(null);
      setRedditDigest(null);
      setIsRedditLoading(true);
      setCurrentSearch({ destination, month });
    } else {
      setComparisonSearch({ destination, month });
    }

    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      if (activeTab === 'travel') {
        const [snapshotData, airportData, redditData] = await Promise.all([
          getTravelSnapshot(destination, month, activity),
          getAirportStatus(destination),
          !isSecondCity ? getRedditDigest(destination) : Promise.resolve(null)
        ]);

        if (isSecondCity) {
          setComparisonSnapshot(snapshotData);
          setComparisonAirportStatus(airportData);
        } else {
          setSnapshot(snapshotData);
          setAirportStatus(airportData);
          setRedditDigest(redditData);
        }
      } else if (activeTab === 'schools') {
        const schoolData = await getSchoolQualitySnapshot(destination);
        setSchoolSnapshot(schoolData);
      } else if (activeTab === 'business') {
        const businessData = await getBusinessSnapshot(destination);
        setBusinessSnapshot(businessData);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "";
      if (msg.includes("overwhelmed") || msg.includes("503") || msg.includes("429") || msg.includes("deadline")) {
        setError("The travel advisor is currently very busy (high morning traffic). We tried retrying automatically, but it's still slammed. Please wait a moment and try again.");
      } else {
        setError("Oops! We couldn't fetch the travel data right now. This usually happens when the live data sources are temporarily unreachable. Please try again in a few seconds.");
      }
    } finally {
      setIsLoading(false);
      setIsRedditLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Banner */}
      <div className="bg-[#1e1e24] text-[#ffde59] py-1.5 px-4 text-center border-b-2 border-[#1e1e24]">
        <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em]">
          TripIntel.net is a Global Mobility Hub, providing data-driven insights for anyone moving across borders.
        </p>
      </div>

      {/* Header */}
      <header className="bg-white border-b-4 border-[#1e1e24] py-3 px-4 sm:px-6 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 cursor-pointer group" onClick={() => setSnapshot(null)}>
            <div className="relative w-12 h-12 sm:w-16 h-16 flex items-center justify-center">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-[#1e1e24] bg-white shadow-[3px_3px_0px_0px_#1e1e24] sm:shadow-[4px_4px_0px_0px_#1e1e24] group-hover:rotate-12 transition-transform duration-500"></div>
              {/* Compass Face */}
              <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-10 h-10 relative z-10 group-hover:scale-110 transition-transform duration-500">
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
              <h1 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase text-[#1e1e24] leading-none">TripIntel</h1>
              <div className="flex items-center gap-2">
                <span className="h-[2px] w-3 sm:w-4 bg-[#ff5757]"></span>
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#ff5757]">Unfiltered Intelligence</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-2 sm:px-3 py-1 rounded-full border border-green-200 text-[8px] sm:text-[10px] font-black uppercase tracking-widest animate-pulse">
              <Activity className="w-3 h-3" /> Live Data Active
            </div>
            <div className="text-[10px] sm:text-sm font-bold bg-gray-100 px-2 sm:px-3 py-1 rounded-full brutal-border">
              Powered by <a href="https://safetyindex.net" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">safetyindex.net</a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-12 max-w-6xl mx-auto w-full flex flex-col gap-12 sm:gap-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block bg-[#ffde59] px-3 sm:px-4 py-1 rounded-full brutal-border mb-4 font-black uppercase tracking-widest text-[10px] sm:text-xs">
            {activeTab === 'travel' 
              ? `Exploring ${DESTINATIONS.length} Global Destinations` 
              : activeTab === 'schools' 
                ? 'Analyzing Global Education Hubs' 
                : 'Mapping Global Business Markets'}
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 sm:mb-6 leading-[0.9]">
            {activeTab === 'travel' ? (
              <>Know <span className="text-[#ff5757]">Before</span> <br/> You Go</>
            ) : activeTab === 'schools' ? (
              <>Education <span className="text-[#5ce1e6]">Without</span> <br/> The Fluff</>
            ) : (
              <>Launch <span className="text-[#ffde59]">With</span> <br/> Real Intel</>
            )}
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-bold text-gray-600 mb-6 sm:mb-8 px-4">
            {activeTab === 'travel' 
              ? "Unfiltered travel intelligence. Discover the real truth about crowds, pricing, and local realities before you book your next trip."
              : activeTab === 'schools'
                ? "The ultimate school quality database. Compare curriculums, teacher ratings, and infrastructure for global education hubs."
                : "Blunt business intelligence for global founders. Navigate registration hurdles, ownership rules, and commercial market realities."}
          </p>

          {/* Tab Switcher */}
          <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex p-1 bg-gray-100 brutal-border rounded-xl whitespace-nowrap">
              <button 
                onClick={() => {
                  setActiveTab('travel');
                  setSnapshot(null);
                  setSchoolSnapshot(null);
                }}
                className={`px-4 sm:px-6 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center gap-2 transition-all ${activeTab === 'travel' ? 'bg-[#ffde59] text-[#1e1e24] shadow-[2px_2px_0px_0px_#1e1e24]' : 'text-gray-500 hover:text-black'}`}
              >
                <Compass className="w-3 h-3 sm:w-4 h-4" />
                Travel
              </button>
              <button 
                onClick={() => {
                  setActiveTab('schools');
                  setSnapshot(null);
                  setSchoolSnapshot(null);
                  setBusinessSnapshot(null);
                }}
                className={`px-4 sm:px-6 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center gap-2 transition-all ${activeTab === 'schools' ? 'bg-[#ffde59] text-[#1e1e24] shadow-[2px_2px_0px_0px_#1e1e24]' : 'text-gray-500 hover:text-black'}`}
              >
                <GraduationCap className="w-3 h-3 sm:w-4 h-4" />
                Schools
              </button>
              <button 
                onClick={() => {
                  setActiveTab('business');
                  setSnapshot(null);
                  setSchoolSnapshot(null);
                  setBusinessSnapshot(null);
                }}
                className={`px-4 sm:px-6 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center gap-2 transition-all ${activeTab === 'business' ? 'bg-[#ffde59] text-[#1e1e24] shadow-[2px_2px_0px_0px_#1e1e24]' : 'text-gray-500 hover:text-black'}`}
              >
                <Briefcase className="w-3 h-3 sm:w-4 h-4" />
                Business
              </button>
            </div>
          </div>
          
          <SearchForm onSearch={handleSearch} isLoading={isLoading} mode={activeTab} />
        </div>

        {/* Results Section */}
        <div ref={resultsRef} className="scroll-mt-24">
          {(isLoading || snapshot || schoolSnapshot || businessSnapshot || error) && (
            <div className="w-full space-y-8 min-h-[400px]">
            <div className="flex items-center gap-3 justify-center">
              <div className="h-1 flex-1 bg-[#1e1e24]"></div>
              <h3 className="font-black uppercase tracking-widest text-xl">
                {activeTab === 'travel' ? (isComparing ? 'Comparison View' : 'Your Travel Intel') : activeTab === 'schools' ? 'School Quality Report' : 'Business Intelligence Report'}
              </h3>
              <div className="h-1 flex-1 bg-[#1e1e24]"></div>
            </div>

            {isLoading && !snapshot && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-16 h-16 border-8 border-[#ffde59] border-t-[#1e1e24] rounded-full animate-spin"></div>
                <div className="space-y-2">
                  <p className="font-black uppercase tracking-widest animate-pulse">
                    Consulting the travel gods...
                  </p>
                  <p className="text-xs font-bold opacity-60 uppercase tracking-tight">Real-time intelligence can take up to 2 minutes to fetch</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-100 text-red-800 p-8 rounded-xl brutal-border font-bold text-center max-w-2xl mx-auto flex flex-col items-center gap-4">
                <p>{error}</p>
                <button 
                  onClick={() => handleSearch(currentSearch.destination, currentSearch.month)}
                  className="brutal-btn bg-white px-6 py-2 text-sm uppercase tracking-widest"
                >
                  Try Again
                </button>
              </div>
            )}

            <div className={`grid grid-cols-1 ${isComparing && activeTab === 'travel' ? 'lg:grid-cols-2' : ''} gap-8`}>
              {snapshot && activeTab === 'travel' && (
                <div className="space-y-4">
                  <SnapshotCard 
                    snapshot={snapshot} 
                    airportStatus={airportStatus || undefined}
                    destination={currentSearch.destination} 
                    month={currentSearch.month}
                    isCompact={isComparing}
                  />
                  
                  {!isComparing && (redditDigest || isRedditLoading) && (
                    <div className="mt-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-[2px] flex-1 bg-[#1e1e24]"></div>
                        <h4 className="font-black uppercase tracking-widest text-sm">Local Community Digest</h4>
                        <div className="h-[2px] flex-1 bg-[#1e1e24]"></div>
                      </div>
                      <RedditDigestCard digest={redditDigest!} isLoading={isRedditLoading} />
                    </div>
                  )}

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

              {schoolSnapshot && activeTab === 'schools' && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <SchoolQualityCard snapshot={schoolSnapshot} />
                </div>
              )}

              {businessSnapshot && activeTab === 'business' && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <BusinessQualityCard snapshot={businessSnapshot} />
                </div>
              )}

              {isComparing && activeTab === 'travel' && (
                <div className="space-y-4">
                  {!comparisonSnapshot && isLoading ? (
                    <div className="brutal-card h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
                      <div className="w-12 h-12 border-4 border-[#ffde59] border-t-[#1e1e24] rounded-full animate-spin mb-4"></div>
                      <div className="space-y-2">
                        <p className="font-bold uppercase text-sm tracking-widest">Loading second city...</p>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-tight">Can take up to 2 minutes</p>
                      </div>
                    </div>
                  ) : comparisonSnapshot ? (
                    <SnapshotCard 
                      snapshot={comparisonSnapshot} 
                      airportStatus={comparisonAirportStatus || undefined}
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
      </div>

        {/* Featured Grid */}
        {!snapshot && !schoolSnapshot && !businessSnapshot && !isLoading && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                {activeTab === 'travel' ? (
                  <>
                    <Sparkles className="w-8 h-8 text-[#ff5757]" /> Featured in {currentMonth}
                  </>
                ) : activeTab === 'schools' ? (
                  <>
                    <GraduationCap className="w-8 h-8 text-[#5ce1e6]" /> Top Education Hubs
                  </>
                ) : (
                  <>
                    <Briefcase className="w-8 h-8 text-[#ffde59]" /> Emerging Business Hubs
                  </>
                )}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'travel' ? (
                INITIAL_FEATURED_DATA.map((data) => (
                  <CityCard 
                    key={data.city}
                    city={data.city}
                    score={data.score}
                    weatherIcon={data.weatherIcon}
                    temperature={data.temperature}
                    onClick={() => handleSearch(data.city, currentMonth)}
                  />
                ))
              ) : activeTab === 'schools' ? (
                [
                  { city: "London, UK", score: 9.2 },
                  { city: "Boston, USA", score: 9.5 },
                  { city: "Melbourne, Australia", score: 9.1 },
                  { city: "Singapore", score: 9.6 },
                  { city: "Zurich, Switzerland", score: 9.8 },
                  { city: "Tokyo, Japan", score: 9.4 }
                ].map((data) => (
                  <div 
                    key={data.city}
                    onClick={() => handleSearch(data.city, currentMonth)}
                    className="brutal-card bg-white p-6 group cursor-pointer hover:-translate-y-2 transition-transform"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-black uppercase tracking-tight">{data.city}</h3>
                      <div className="w-12 h-12 rounded-lg border-2 border-[#1e1e24] bg-[#5ce1e6] flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#1e1e24]">
                        {data.score}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#5ce1e6] group-hover:gap-4 transition-all">
                      View School Report <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                ))
              ) : (
                [
                  { city: "Hong Kong, China", score: 9.4 },
                  { city: "Singapore", score: 9.9 },
                  { city: "Tallinn, Estonia", score: 9.3 },
                  { city: "Austin, USA", score: 9.1 },
                  { city: "Riyadh, Saudi Arabia", score: 8.8 },
                  { city: "Lisbon, Portugal", score: 8.5 }
                ].map((data) => (
                  <div 
                    key={data.city}
                    onClick={() => handleSearch(data.city, currentMonth)}
                    className="brutal-card bg-white p-6 group cursor-pointer hover:-translate-y-2 transition-transform"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-black uppercase tracking-tight">{data.city}</h3>
                      <div className="w-12 h-12 rounded-lg border-2 border-[#1e1e24] bg-[#ffde59] flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#1e1e24]">
                        {data.score}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#b39410] group-hover:gap-4 transition-all">
                      View Business Intel <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Travel Advisory Board */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Megaphone className="w-6 h-6 sm:w-8 h-8 text-[#ff5757]" />
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Global Advisory Board</h3>
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
          
          <div className="bg-[#d2b48c] p-4 sm:p-8 rounded-xl brutal-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden min-h-[300px] sm:min-h-[350px] flex flex-wrap gap-4 sm:gap-6 justify-center items-center">
            {/* Cork texture effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
            
            {isAdvisoriesLoading && advisories.length === 0 ? (
              <div className="flex flex-col items-center gap-3 relative z-10">
                <Loader2 className="w-8 h-8 sm:w-10 h-10 animate-spin text-[#1e1e24]" />
                <p className="font-black uppercase text-xs sm:text-sm tracking-widest">Scanning Global News...</p>
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
                    className="brutal-card bg-white p-3 sm:p-4 max-w-[160px] sm:max-w-[220px] relative transition-transform hover:scale-105 hover:z-10"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <Pin className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 sm:w-6 h-6 ${pinColor}`} />
                    <div className={`${badgeColor} text-[8px] sm:text-[10px] font-black uppercase px-2 py-0.5 mb-2 inline-block`}>
                      {advisory.level}
                    </div>
                    <p className="font-bold text-xs sm:text-sm leading-tight">{advisory.location}</p>
                    <p className="text-[9px] sm:text-[10px] mt-1 opacity-70 font-medium">{advisory.message}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Real-time Data Notice */}
        <div className="mt-8 sm:mt-16 p-6 sm:p-8 bg-[#1e1e24] text-white rounded-2xl sm:rounded-3xl brutal-border shadow-[4px_4px_0px_0px_#1e1e24] sm:shadow-[8px_8px_0px_0px_#1e1e24] flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <Globe className="w-48 h-48 sm:w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <div className="bg-[#ffde59] text-[#1e1e24] px-3 sm:px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px] sm:text-xs">
              Real-Time Intelligence
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight leading-none">
              Connected to the <br/> <span className="text-[#5ce1e6]">Live Global Pulse</span>
            </h3>
            <p className="text-xs sm:text-sm font-bold opacity-70 max-w-md">
              TripIntel is connected to real-time data streams. Every snapshot is generated using the latest available information on weather, pricing, and local events to give you the most accurate advice possible.
            </p>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 sm:w-10 h-10 rounded-full border-2 border-[#1e1e24] bg-gray-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <span className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-[#ffde59]">Real-Time Intelligence Streams</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              System Status: Operational
            </div>
          </div>
        </div>

        {/* Our Services Section */}
        <div className="mt-16 space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-1 flex-1 bg-[#1e1e24]"></div>
            <h3 className="font-black uppercase tracking-widest text-xl">Our Intelligence Services</h3>
            <div className="h-1 flex-1 bg-[#1e1e24]"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="brutal-card bg-white p-6 space-y-4">
              <div className="w-12 h-12 bg-[#ff5757] rounded-lg brutal-border flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight">Unfiltered Travel</h4>
              <p className="text-sm font-bold opacity-70">Real-time snapshots of global destinations. We track weather, crowds, and local safety advisories to give you the blunt truth before you book.</p>
            </div>
            
            <div className="brutal-card bg-white p-6 space-y-4">
              <div className="w-12 h-12 bg-[#5ce1e6] rounded-lg brutal-border flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight">Global Education</h4>
              <p className="text-sm font-bold opacity-70">Our new real-time school quality checker monitors educational institutions worldwide. Get instant data on curriculums, infrastructure, and teacher ratings.</p>
            </div>
            
            <div className="brutal-card bg-white p-6 space-y-4">
              <div className="w-12 h-12 bg-[#ffde59] rounded-lg brutal-border flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                <TrendingUp className="w-6 h-6 text-[#1e1e24]" />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight">Business Tracker</h4>
              <p className="text-sm font-bold opacity-70">Real-time market intelligence for founders and investors. Track commercial registration hurdles, ownership rules, and market volatility as they happen for any city in the world.</p>
            </div>
          </div>
        </div>

        {/* Facebook Page Section */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 w-full">
            <div className="h-1 flex-1 bg-[#1e1e24]"></div>
            <h3 className="font-black uppercase tracking-widest text-xl">Join the Community</h3>
            <div className="h-1 flex-1 bg-[#1e1e24]"></div>
          </div>
          <div className="brutal-card bg-white p-2 sm:p-4 inline-block shadow-[8px_8px_0px_0px_#1e1e24]">
            <div 
              className="fb-page" 
              data-href="https://www.facebook.com/safetyindex" 
              data-tabs="timeline" 
              data-width="500" 
              data-height="500" 
              data-small-header="false" 
              data-adapt-container-width="true" 
              data-hide-cover="false" 
              data-show-facepile="true"
            >
              <blockquote cite="https://www.facebook.com/safetyindex" className="fb-xfbml-parse-ignore">
                <a href="https://www.facebook.com/safetyindex">Global Safety Index</a>
              </blockquote>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="mt-8">
          <div className="brutal-card bg-[#5ce1e6] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute -left-4 -bottom-4 opacity-10 rotate-12">
              <Share2 className="w-24 h-24 sm:w-32 h-32" />
            </div>
            <div className="relative z-10 text-center md:text-left">
              <h4 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter leading-none mb-2">Spread the Intelligence</h4>
              <p className="text-sm sm:text-base font-bold text-gray-800">Help others discover the unfiltered truth about their next destination.</p>
            </div>
            <button 
              onClick={handleShare}
              className="relative z-10 flex items-center gap-3 bg-[#ffde59] text-[#1e1e24] px-6 sm:px-8 py-3 sm:py-4 rounded-xl brutal-border shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group min-w-[200px] sm:min-w-[240px] justify-center"
            >
              {showCopied ? (
                <>
                  <Check className="w-5 h-5 sm:w-6 h-6" />
                  <span className="text-base sm:text-lg font-black uppercase tracking-widest">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5 sm:w-6 h-6 group-hover:rotate-12 transition-transform" />
                  <span className="text-base sm:text-lg font-black uppercase tracking-widest">Share TripIntel</span>
                </>
              )}
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#1e1e24] text-white py-8 sm:py-12 px-4 sm:px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 h-10 bg-[#ffde59] rounded-lg brutal-border flex items-center justify-center shadow-[2px_2px_0px_0px_#1e1e24]">
                <Compass className="w-5 h-5 sm:w-6 h-6 text-[#1e1e24]" />
              </div>
              <div className="font-black text-2xl sm:text-3xl tracking-tighter">TRIPINTEL</div>
            </div>
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest text-center md:text-left">© 2026 TripIntel | Unfiltered Travel Intelligence</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-[10px] sm:text-sm font-bold uppercase tracking-wider">
            <button 
              onClick={() => setLegalModal({ isOpen: true, type: 'about' })}
              className="hover:text-[#ffde59] transition-colors"
            >
              About Us
            </button>
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
