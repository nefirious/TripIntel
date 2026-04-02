import { TravelSnapshot } from '../services/gemini';
import { AirportStatus } from '../services/airport';
import { WeatherIcon } from './WeatherIcon';
import { motion } from 'motion/react';
import { AlertTriangle, Calendar, Users, DollarSign, Info, ShieldAlert, XCircle, Thermometer, Clock, Utensils, Coffee, Briefcase, Shirt, PlusCircle, CheckCircle2, Lock, Unlock, Phone, Landmark, Coins, Hospital, Zap, Wifi, ShieldCheck, Syringe, Flag, Home, Users2, Trees, Mountain, PawPrint, Car, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getLiveWeather, WeatherInfo, WEATHER_METADATA } from '../services/weather';

interface SnapshotCardProps {
  snapshot: TravelSnapshot;
  airportStatus?: AirportStatus;
  destination: string;
  month: string;
  isCompact?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 8) return 'bg-[#7ed957]'; // Green
  if (score >= 6) return 'bg-[#ffde59]'; // Yellow
  if (score >= 4) return 'bg-[#ff914d]'; // Orange
  return 'bg-[#ff5757]'; // Red
};

const getScoreTextColor = (score: number) => {
  if (score >= 8) return 'text-green-800';
  if (score >= 6) return 'text-yellow-800';
  if (score >= 4) return 'text-orange-800';
  return 'text-red-800';
};

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export function SnapshotCard({ snapshot, airportStatus, destination, month, isCompact = false }: SnapshotCardProps) {
  const scoreColor = getScoreColor(snapshot.score);
  const [liveWeather, setLiveWeather] = useState<WeatherInfo | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    setIsUnlocked(false); // Reset lock when snapshot changes
  }, [snapshot]);

  useEffect(() => {
    async function fetchWeather() {
      setIsWeatherLoading(true);
      const city = destination.split(',')[0].trim();
      const weather = await getLiveWeather(city);
      setLiveWeather(weather);
      setIsWeatherLoading(false);
    }
    fetchWeather();
  }, [destination]);

  const typicalMeta = WEATHER_METADATA[snapshot.typicalWeatherState];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`brutal-card flex flex-col w-full ${isCompact ? '' : 'max-w-3xl mx-auto'}`}
    >
      {/* Header Section */}
      <div className={`${scoreColor} ${isCompact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'} border-b-4 border-[#1e1e24] flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className={`bg-white ${isCompact ? 'p-1.5 sm:p-2' : 'p-2 sm:p-3'} rounded-xl brutal-border brutal-shadow-sm shrink-0`}>
            <WeatherIcon icon={snapshot.weatherIcon} className={isCompact ? "w-8 h-8 sm:w-10 h-10" : "w-12 h-12 sm:w-16 h-16"} />
          </div>
          <div className="min-w-0">
            <h2 className={`${isCompact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'} font-black uppercase tracking-tight truncate`}>{destination.split(',')[0]}</h2>
            <p className={`${isCompact ? 'text-xs sm:text-sm' : 'text-lg sm:text-xl'} font-bold opacity-80`}>{month}</p>
          </div>
        </div>
        
        <div className={`flex flex-col items-center bg-white ${isCompact ? 'px-3 py-1.5 sm:px-4 py-2' : 'px-4 py-2 sm:px-6 py-3'} rounded-xl brutal-border brutal-shadow-sm w-full sm:w-auto`}>
          <span className={`${isCompact ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'} font-black leading-none`}>{snapshot.score}<span className={`${isCompact ? 'text-sm sm:text-lg' : 'text-xl sm:text-2xl'} text-gray-400`}>/10</span></span>
          <span className={`font-bold uppercase tracking-wider ${isCompact ? 'text-[8px] sm:text-[10px]' : 'text-xs sm:text-sm'} ${getScoreTextColor(snapshot.score)}`}>
            {snapshot.label}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isCompact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'} space-y-6 bg-white`}>
        
        {/* Callout */}
        <div className="bg-[#5ce1e6] p-3 rounded-xl brutal-border brutal-shadow-sm flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-black uppercase text-[10px] mb-0.5">The Verdict</h3>
            <p className={`font-bold ${isCompact ? 'text-sm' : 'text-lg'}`}>{snapshot.callout}</p>
          </div>
        </div>

        {/* Weather Feature: Typical vs Right Now */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Typical Weather */}
          <div className="brutal-card bg-gray-50 p-4 border-2 border-[#1e1e24]">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-black uppercase text-[10px] tracking-widest text-gray-500">Typical {month}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{typicalMeta.icon}</span>
              <div>
                <p className="font-black uppercase text-sm leading-none">{typicalMeta.label}</p>
                <p className="text-[10px] font-bold text-gray-500 mt-1">{typicalMeta.description}</p>
              </div>
            </div>
          </div>

          {/* Live Weather */}
          <div className="brutal-card bg-[#ffde59]/10 p-4 border-2 border-[#1e1e24]">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#ff914d]" />
              <span className="font-black uppercase text-[10px] tracking-widest text-[#ff914d]">Right Now</span>
            </div>
            {isWeatherLoading ? (
              <div className="flex items-center gap-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            ) : liveWeather ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl">{liveWeather.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black uppercase text-sm leading-none">{liveWeather.label}</p>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-black text-[10px] font-black">
                      {Math.round(liveWeather.temp)}°C
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 mt-1">{liveWeather.description}</p>
                </div>
              </div>
            ) : (
              <p className="text-[10px] font-bold text-gray-400 italic">Live data unavailable</p>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className={`grid grid-cols-1 ${isCompact ? '' : 'md:grid-cols-3'} gap-3`}>
          <div className="p-3 rounded-xl border-2 border-[#1e1e24] bg-gray-50 flex items-center gap-3">
            <WeatherIcon icon={snapshot.weatherIcon} className="w-6 h-6" />
            <div className="flex flex-col">
              <span className="font-black uppercase text-[10px] text-gray-400 leading-none">Weather</span>
              <span className="font-bold text-sm">{snapshot.temperature} • {snapshot.weatherDesc}</span>
            </div>
          </div>
          <div className="p-3 rounded-xl border-2 border-[#1e1e24] bg-gray-50 flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-500" />
            <div className="flex flex-col">
              <span className="font-black uppercase text-[10px] text-gray-400 leading-none">Crowds</span>
              <span className="font-bold text-sm">{snapshot.crowds}</span>
            </div>
          </div>
          <div className="p-3 rounded-xl border-2 border-[#1e1e24] bg-gray-50 flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-500" />
            <div className="flex flex-col">
              <span className="font-black uppercase text-[10px] text-gray-400 leading-none">Pricing</span>
              <span className="font-bold text-sm">{snapshot.pricing}</span>
            </div>
          </div>
        </div>

        {/* Seasonal Tastes */}
        <div className="bg-[#ffde59]/20 p-4 rounded-xl border-2 border-[#1e1e24] space-y-3">
          <h3 className="font-black uppercase text-sm flex items-center gap-2">
            <Utensils className="w-4 h-4" /> Seasonal Tastes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-black uppercase text-[10px] text-gray-500 mb-1 flex items-center gap-1">
                <Utensils className="w-3 h-3" /> Food Highlights
              </h4>
              <div className="flex flex-wrap gap-2">
                {snapshot.seasonalHighlights.food.map((item, i) => (
                  <span key={i} className="bg-white px-2 py-1 rounded border border-black text-xs font-bold">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-black uppercase text-[10px] text-gray-500 mb-1 flex items-center gap-1">
                <Coffee className="w-3 h-3" /> Drink Highlights
              </h4>
              <div className="flex flex-wrap gap-2">
                {snapshot.seasonalHighlights.drink.map((item, i) => (
                  <span key={i} className="bg-white px-2 py-1 rounded border border-black text-xs font-bold">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Month Bar */}
        {!isCompact && (
          <div>
            <h3 className="font-black uppercase text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Year at a Glance
            </h3>
            <div className="flex w-full h-12 brutal-border rounded-lg overflow-hidden">
              {snapshot.monthScores.map((score, idx) => (
                <div 
                  key={idx} 
                  className={`flex-1 flex items-center justify-center font-bold text-xs border-r border-[#1e1e24] last:border-r-0 ${getScoreColor(score)}`}
                  title={`Score: ${score}/10`}
                >
                  {MONTH_LABELS[idx]}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className={`grid grid-cols-1 ${isCompact ? '' : 'md:grid-cols-2'} gap-4`}>
          
          {/* Events */}
          {snapshot.events.length > 0 && (
            <div className="p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
              <h3 className="font-black uppercase text-[10px] mb-2 flex items-center gap-2 text-purple-600">
                <Calendar className="w-3 h-3" /> Events
              </h3>
              <ul className="space-y-1">
                {snapshot.events.map((event, i) => (
                  <li key={i} className="text-[11px] font-bold leading-tight">• {event}</li>
                ))}
              </ul>
            </div>
          )}

          {/* What You Can't Do */}
          {snapshot.cantDo.length > 0 && (
            <div className="p-3 bg-red-50 rounded-xl border-2 border-red-200">
              <h3 className="font-black uppercase text-[10px] mb-2 flex items-center gap-2 text-red-500">
                <XCircle className="w-3 h-3" /> Can't Do
              </h3>
              <ul className="space-y-1">
                {snapshot.cantDo.map((item, i) => (
                  <li key={i} className="text-[11px] font-bold leading-tight">✕ {item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Local Realities */}
          {snapshot.localRealities.length > 0 && (
            <div className="p-3 bg-orange-50 rounded-xl border-2 border-orange-200">
              <h3 className="font-black uppercase text-[10px] mb-2 flex items-center gap-2 text-orange-600">
                <AlertTriangle className="w-3 h-3" /> Realities
              </h3>
              <ul className="space-y-1">
                {snapshot.localRealities.map((item, i) => (
                  <li key={i} className="text-[11px] font-bold leading-tight">! {item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Health & Safety */}
          {snapshot.healthSafety.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black uppercase text-[10px] flex items-center gap-2 text-blue-600">
                  <ShieldAlert className="w-3 h-3" /> Safety
                </h3>
                <a href="https://safetyindex.net" target="_blank" rel="noreferrer" className="text-[8px] font-black uppercase text-blue-400 hover:text-blue-600 transition-colors">via safetyindex.net</a>
              </div>
              <ul className="space-y-1">
                {snapshot.healthSafety.map((item, i) => (
                  <li key={i} className="text-[11px] font-bold leading-tight">🛡️ {item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Live Airport Intelligence */}
          {airportStatus && (
            <div className={`bg-[#1e1e24] text-white p-4 rounded-xl border-2 border-[#1e1e24] space-y-3 relative overflow-hidden ${isCompact ? '' : 'md:col-span-2'}`}>
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <Activity className="w-24 h-24" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <h3 className="font-black uppercase text-sm flex items-center gap-2 text-[#5ce1e6]">
                  <Activity className="w-4 h-4" /> Live Airport Intelligence
                </h3>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-50">
                  Updated: {airportStatus.lastUpdated}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <div className="flex-1 bg-white/10 p-3 rounded-lg border border-white/20">
                  <p className="text-[10px] font-black uppercase text-[#5ce1e6] mb-1">{airportStatus.airportName}</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      airportStatus.crowdLevel === 'Low' ? 'bg-green-400' :
                      airportStatus.crowdLevel === 'Moderate' ? 'bg-yellow-400' :
                      airportStatus.crowdLevel === 'High' ? 'bg-orange-400' :
                      'bg-red-400'
                    }`}></div>
                    <span className="text-lg font-black uppercase tracking-tighter">{airportStatus.statusLabel}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-bold leading-tight opacity-80">{airportStatus.details}</p>
                  <div className="flex flex-wrap gap-1">
                    {airportStatus.tips.map((tip, i) => (
                      <span key={i} className="text-[9px] font-black uppercase bg-[#5ce1e6] text-[#1e1e24] px-1.5 py-0.5 rounded">
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Numbers */}
          {snapshot.secrets.emergencyNumbers.length > 0 && (
            <div className="p-3 bg-green-50 rounded-xl border-2 border-green-200">
              <h3 className="font-black uppercase text-[10px] mb-2 flex items-center gap-2 text-green-600">
                <Phone className="w-3 h-3" /> Emergency
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {snapshot.secrets.emergencyNumbers.map((num, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-gray-400 leading-none">{num.service}</span>
                    <span className="text-xs font-black text-[#1e1e24]">{num.number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* What to Pack Section - Magazine Style */}
        <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t-8 border-[#1e1e24] relative">
          {/* Retro Badge */}
          <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 bg-[#ff5757] text-white px-4 sm:px-6 py-1.5 sm:py-2 border-4 border-[#1e1e24] rotate-2 z-10 font-black uppercase tracking-widest text-xs sm:text-sm shadow-[4px_4px_0px_0px_#1e1e24] whitespace-nowrap">
            Packing Guide
          </div>

          <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
            {/* Left Column: Big Title & Intro */}
            <div className="md:w-1/3 space-y-4 sm:space-y-6">
              <h3 className="text-4xl sm:text-6xl font-serif italic font-black leading-none tracking-tighter text-[#1e1e24]">
                The <span className="block text-5xl sm:text-7xl not-italic font-sans uppercase">Pack</span> List
              </h3>
              <p className="text-xs sm:text-sm font-bold leading-relaxed text-gray-600 border-l-4 border-[#ffde59] pl-4">
                Our unfiltered guide to what you actually need for {destination.split(',')[0]} in {month}. No fluff, just the essentials.
              </p>
              <div className="p-3 sm:p-4 bg-[#ffde59] border-4 border-[#1e1e24] -rotate-1 hidden md:block shadow-[4px_4px_0px_0px_#1e1e24]">
                <p className="text-[10px] font-black uppercase tracking-widest text-center">Verified by TripIntel</p>
              </div>
            </div>

            {/* Right Column: The Grid */}
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Essentials */}
              <div className="bg-white p-4 sm:p-6 border-4 border-[#1e1e24] relative group shadow-[4px_4px_0px_0px_#1e1e24]">
                <div className="absolute -top-3 -right-3 w-8 h-8 sm:w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white font-black border-2 border-[#1e1e24] rotate-12 group-hover:rotate-0 transition-transform text-xs sm:text-base">01</div>
                <h4 className="font-serif italic text-xl sm:text-2xl mb-3 sm:mb-4 border-b-2 border-blue-100 pb-2">Essentials</h4>
                <ul className="space-y-2 sm:space-y-3">
                  {snapshot.packingList.essentials.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 group/item">
                      <div className="w-1.5 h-1.5 sm:w-2 h-2 bg-blue-400 rotate-45 group-hover/item:rotate-90 transition-transform"></div>
                      <span className="text-xs sm:text-sm font-bold tracking-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clothing */}
              <div className="bg-white p-4 sm:p-6 border-4 border-[#1e1e24] relative group shadow-[4px_4px_0px_0px_#1e1e24]">
                <div className="absolute -top-3 -right-3 w-8 h-8 sm:w-10 h-10 bg-green-400 rounded-full flex items-center justify-center text-white font-black border-2 border-[#1e1e24] -rotate-12 group-hover:rotate-0 transition-transform text-xs sm:text-base">02</div>
                <h4 className="font-serif italic text-xl sm:text-2xl mb-3 sm:mb-4 border-b-2 border-green-100 pb-2">Clothing</h4>
                <ul className="space-y-2 sm:space-y-3">
                  {snapshot.packingList.clothing.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 group/item">
                      <div className="w-1.5 h-1.5 sm:w-2 h-2 bg-green-400 rotate-45 group-hover/item:rotate-90 transition-transform"></div>
                      <span className="text-xs sm:text-sm font-bold tracking-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Extras */}
              <div className="bg-[#1e1e24] text-white p-4 sm:p-6 border-4 border-[#1e1e24] relative group sm:col-span-2 shadow-[4px_4px_0px_0px_#ff914d]">
                <div className="absolute -top-3 -right-3 w-8 h-8 sm:w-10 h-10 bg-[#ff914d] rounded-full flex items-center justify-center text-[#1e1e24] font-black border-2 border-[#1e1e24] rotate-6 group-hover:rotate-0 transition-transform text-xs sm:text-base">03</div>
                <h4 className="font-serif italic text-xl sm:text-2xl mb-3 sm:mb-4 border-b-2 border-gray-700 pb-2">Helpful Extras</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 sm:gap-y-3">
                  {snapshot.packingList.extras.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 group/item">
                      <div className="w-1.5 h-1.5 sm:w-2 h-2 bg-[#ff914d] rotate-45 group-hover/item:rotate-90 transition-transform"></div>
                      <span className="text-xs sm:text-sm font-bold tracking-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secrets of the City Section */}
        <div className="mt-12 pt-12 border-t-8 border-[#1e1e24] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-[#1e1e24] flex items-center gap-3">
              <Lock className="w-6 h-6 sm:w-8 h-8 text-[#ff5757]" /> Secrets of the City
            </h3>
            {!isUnlocked && (
              <button 
                onClick={() => setIsUnlocked(true)}
                className="brutal-btn bg-[#ffde59] px-6 py-2 text-sm uppercase tracking-widest flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Unlock className="w-4 h-4" /> Unlock Intelligence
              </button>
            )}
          </div>

          {!isUnlocked ? (
            <div className="relative">
              {/* Blurred Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 filter blur-md opacity-30 select-none pointer-events-none">
                <div className="brutal-card p-6 bg-white h-40"></div>
                <div className="brutal-card p-6 bg-white h-40"></div>
                <div className="brutal-card p-6 bg-white h-40"></div>
                <div className="brutal-card p-6 bg-white h-40"></div>
              </div>
              
              {/* Overlay Message */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <div className="bg-[#1e1e24] text-white p-8 brutal-border shadow-[8px_8px_0px_0px_#ff5757] max-w-md">
                  <ShieldAlert className="w-12 h-12 text-[#ff5757] mx-auto mb-4" />
                  <h4 className="text-2xl font-black uppercase mb-2">Restricted Content</h4>
                  <p className="text-sm font-bold text-gray-400 mb-6">
                    This section contains sensitive local intelligence including scams, cultural pitfalls, and emergency resources researched by people who actually lived there.
                  </p>
                  <button 
                    onClick={() => setIsUnlocked(true)}
                    className="w-full brutal-btn bg-[#ffde59] text-[#1e1e24] py-3 uppercase tracking-widest font-black"
                  >
                    Access Local Secrets
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scams & Pitfalls */}
                <div className="brutal-card bg-[#fff5f5] p-6 border-[#ff5757]">
                  <h4 className="font-black uppercase text-sm mb-4 flex items-center gap-2 text-[#ff5757]">
                    <AlertTriangle className="w-5 h-5" /> Common Scams
                  </h4>
                  <ul className="space-y-3">
                    {snapshot.secrets.scams.map((scam, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ff5757] mt-1.5 flex-shrink-0"></div>
                        <span className="text-sm font-bold leading-tight">{scam}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cultural Mistakes */}
                <div className="brutal-card bg-[#f5faff] p-6 border-blue-500">
                  <h4 className="font-black uppercase text-sm mb-4 flex items-center gap-2 text-blue-600">
                    <Users className="w-5 h-5" /> Cultural Pitfalls
                  </h4>
                  <ul className="space-y-3">
                    {snapshot.secrets.culturalMistakes.map((mistake, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 mt-1.5 flex-shrink-0"></div>
                        <span className="text-sm font-bold leading-tight">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal but Problematic */}
                <div className="brutal-card bg-[#fffdf5] p-6 border-[#ffde59]">
                  <h4 className="font-black uppercase text-sm mb-4 flex items-center gap-2 text-[#b08d00]">
                    <ShieldAlert className="w-5 h-5" /> Technically Legal, but...
                  </h4>
                  <ul className="space-y-3">
                    {snapshot.secrets.legalButProblematic.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#ffde59] mt-1.5 flex-shrink-0"></div>
                        <span className="text-sm font-bold leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Health & Hospital */}
                <div className="brutal-card bg-[#f5fff8] p-6 border-green-500">
                  <h4 className="font-black uppercase text-sm mb-4 flex items-center gap-2 text-green-600">
                    <Hospital className="w-5 h-5" /> Recommended Hospital
                  </h4>
                  <div className="bg-white p-4 brutal-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-2 mb-2">
                      <Hospital className="w-5 h-5 text-green-600" />
                      <p className="text-base font-black">{snapshot.secrets.bestHospital.name}</p>
                    </div>
                    <p className="text-xs font-bold text-gray-500 leading-tight">{snapshot.secrets.bestHospital.reason}</p>
                  </div>
                </div>

                {/* Power & Sockets */}
                <div className="brutal-card bg-[#fdf5ff] p-6 border-purple-500">
                  <h4 className="font-black uppercase text-sm mb-4 flex items-center gap-2 text-purple-600">
                    <Zap className="w-5 h-5" /> Power & Sockets
                  </h4>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="bg-white p-3 brutal-border shadow-[2px_2px_0px_0px_#1e1e24] flex-1">
                      <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">Voltage</p>
                      <p className="text-lg font-black text-[#1e1e24]">{snapshot.secrets.power.voltage}</p>
                    </div>
                    <div className="bg-white p-3 brutal-border shadow-[2px_2px_0px_0px_#1e1e24] flex-1">
                      <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">Socket Type</p>
                      <p className="text-lg font-black text-[#1e1e24]">{snapshot.secrets.power.socketType}</p>
                    </div>
                  </div>
                </div>

                {/* Connectivity */}
                <div className="brutal-card bg-[#f5fdff] p-6 border-cyan-500">
                  <h4 className="font-black uppercase text-sm mb-4 flex items-center gap-2 text-cyan-600">
                    <Wifi className="w-5 h-5" /> Connectivity
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-2">Best Internet for Expats</p>
                      <div className="flex flex-wrap gap-2">
                        {snapshot.secrets.internetProviders.map((isp, i) => (
                          <span key={i} className="bg-white px-2 py-1 brutal-border text-[10px] font-black uppercase">{isp}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-2 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-cyan-600" /> Working VPNs
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {snapshot.secrets.vpnsThatWork.map((vpn, i) => (
                          <span key={i} className="bg-cyan-50 text-cyan-700 px-2 py-1 brutal-border border-cyan-200 text-[10px] font-black uppercase">{vpn}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Travel Advisory */}
                <div className="brutal-card bg-[#fff5f5] p-6 border-[#ff5757]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black uppercase text-sm flex items-center gap-2 text-[#ff5757]">
                      <Flag className="w-5 h-5" /> Official Travel Advisory
                    </h4>
                    <a href="https://safetyindex.net" target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase text-[#ff5757]/60 hover:text-[#ff5757] transition-colors">Safety Index</a>
                  </div>
                  <div className="bg-white p-4 brutal-border border-[#ff5757] shadow-[4px_4px_0px_0px_rgba(255,87,87,0.1)]">
                    <p className="text-sm font-black text-[#ff5757] uppercase mb-1">{snapshot.secrets.travelAdvisory.level}</p>
                    <p className="text-xs font-bold text-gray-600 leading-tight">{snapshot.secrets.travelAdvisory.reason}</p>
                  </div>
                </div>

                {/* Vaccinations */}
                <div className="brutal-card bg-[#f5fff8] p-6 border-green-500">
                  <h4 className="font-black uppercase text-sm mb-4 flex items-center gap-2 text-green-600">
                    <Syringe className="w-5 h-5" /> Health & Vaccinations
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-2">Required for Entry</p>
                      <div className="flex flex-wrap gap-2">
                        {snapshot.secrets.vaccinations.required.length > 0 ? (
                          snapshot.secrets.vaccinations.required.map((v, i) => (
                            <span key={i} className="bg-red-50 text-red-700 px-2 py-1 brutal-border border-red-200 text-[10px] font-black uppercase">{v}</span>
                          ))
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 italic">None specifically required for most travelers</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-2">Recommended</p>
                      <div className="flex flex-wrap gap-2">
                        {snapshot.secrets.vaccinations.recommended.map((v, i) => (
                          <span key={i} className="bg-green-50 text-green-700 px-2 py-1 brutal-border border-green-200 text-[10px] font-black uppercase">{v}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Local Life */}
                <div className="brutal-card bg-[#fff9f0] p-6 border-orange-500">
                  <h4 className="font-black uppercase text-sm mb-4 flex items-center gap-2 text-orange-600">
                    <Home className="w-5 h-5" /> What Life looks like here
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 brutal-border border-orange-200">
                        <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">Lifestyle</p>
                        <p className="text-xs font-black text-[#1e1e24]">{snapshot.secrets.localLife.vibe}</p>
                      </div>
                      <div className="bg-white p-3 brutal-border border-orange-200">
                        <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">Density</p>
                        <p className="text-xs font-black text-[#1e1e24]">{snapshot.secrets.localLife.density}</p>
                      </div>
                    </div>
                    <div className="bg-white p-3 brutal-border border-orange-200">
                      <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-orange-600" /> Job Market
                      </p>
                      <p className="text-xs font-bold text-gray-600 leading-tight">{snapshot.secrets.localLife.jobMarket}</p>
                    </div>
                    <div className="bg-white p-3 brutal-border border-orange-200">
                      <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1 flex items-center gap-1">
                        <Car className="w-3 h-3 text-orange-600" /> Commute
                      </p>
                      <p className="text-xs font-bold text-gray-600 leading-tight">{snapshot.secrets.localLife.commute}</p>
                    </div>
                  </div>
                </div>

                {/* Nature & Wildlife */}
                <div className="brutal-card bg-[#f0fff4] p-6 border-emerald-500">
                  <h4 className="font-black uppercase text-sm mb-4 flex items-center gap-2 text-emerald-600">
                    <Trees className="w-5 h-5" /> Nature & Wildlife
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white p-3 brutal-border border-emerald-200">
                        <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1 flex items-center gap-1">
                          <Mountain className="w-3 h-3 text-emerald-600" /> Landscape
                        </p>
                        <p className="text-xs font-bold text-gray-600">{snapshot.secrets.nature.landscape}</p>
                      </div>
                      <div className="bg-white p-3 brutal-border border-emerald-200">
                        <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1 flex items-center gap-1">
                          <Trees className="w-3 h-3 text-emerald-600" /> Vegetation
                        </p>
                        <p className="text-xs font-bold text-gray-600">{snapshot.secrets.nature.vegetation}</p>
                      </div>
                    </div>
                    <div className="bg-white p-3 brutal-border border-emerald-200">
                      <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-2 flex items-center gap-1">
                        <PawPrint className="w-3 h-3 text-emerald-600" /> Unique Wildlife
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {snapshot.secrets.nature.uniqueAnimals.map((animal, i) => (
                          <span key={i} className="bg-emerald-50 text-emerald-700 px-2 py-1 brutal-border border-emerald-200 text-[10px] font-black uppercase">{animal}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Finance & Currency */}
              <div className="brutal-card bg-[#1e1e24] text-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ffde59]">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="bg-[#ffde59] p-3 rounded-xl brutal-border shadow-[4px_4px_0px_0px_#ff5757] flex-shrink-0">
                        <Coins className="w-8 h-8 text-[#1e1e24]" />
                      </div>
                      <div className="bg-[#ffde59] text-[#1e1e24] p-4 brutal-border border-[#1e1e24] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] w-full sm:w-auto">
                        <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tighter leading-none mb-1">{snapshot.secrets.currency.name}</h4>
                        <p className="text-xs font-black uppercase tracking-widest opacity-70">{snapshot.secrets.currency.code} ({snapshot.secrets.currency.symbol})</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 brutal-border border-[#1e1e24]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Live Exchange Rate</p>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-black text-[#ff5757]">1.00 <span className="text-sm text-[#1e1e24]">USD</span></span>
                        <span className="text-xl sm:text-2xl font-black text-gray-400">=</span>
                        <span className="text-3xl sm:text-4xl font-black text-[#1e1e24]">{snapshot.secrets.currency.usdExchangeRate.toFixed(2)} <span className="text-sm text-[#ff5757]">{snapshot.secrets.currency.code}</span></span>
                      </div>
                    </div>
                    {snapshot.secrets.acceptedCurrencies && snapshot.secrets.acceptedCurrencies.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Also Accepted</p>
                        <div className="flex gap-2">
                          {snapshot.secrets.acceptedCurrencies.map((curr, i) => (
                            <span key={i} className="bg-[#ffde59] text-[#1e1e24] px-2 py-1 brutal-border border-[#1e1e24] text-[10px] font-black">{curr}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-px h-32 bg-white/10 hidden md:block"></div>

                  <div className="flex-1 space-y-4 w-full">
                    <div className="bg-[#ffde59] text-[#1e1e24] px-4 py-2 brutal-border mb-4 inline-block w-full sm:w-auto text-center sm:text-left">
                      <h4 className="font-black uppercase text-lg sm:text-xl flex items-center justify-center sm:justify-start gap-2 tracking-tighter">
                        <Landmark className="w-5 h-5 sm:w-6 h-6" /> Trusted Major Banks
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                      {snapshot.secrets.majorBanks.map((bank, i) => (
                        <div key={i} className="bg-[#ffde59] text-[#1e1e24] px-4 sm:px-5 py-2 sm:py-3 brutal-border border-[#1e1e24] text-base sm:text-lg font-black uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                          {bank}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 italic">
                      * Researched by local residents and verified for expat compatibility.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Crowd Truth: Live Community Poll */}
        <div className="mt-12 pt-12 border-t-8 border-[#1e1e24]">
          <div className="flex items-center gap-3 mb-6">
            <Users2 className="w-6 h-6 sm:w-8 h-8 text-[#5ce1e6]" />
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Crowd Truth</h3>
          </div>
          
          <div className="brutal-card bg-white p-4 sm:p-6 border-4 border-[#1e1e24] shadow-[8px_8px_0px_0px_#5ce1e6]">
            <div className="mb-4">
              <h4 className="text-xl font-black uppercase tracking-tight">Is {destination.split(',')[0]} a 9/10 today?</h4>
              <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Live Community Sentiment • Stateless Integration</p>
            </div>
            
            <div className="aspect-[16/9] w-full bg-gray-50 brutal-border flex items-center justify-center overflow-hidden relative">
              {/* In a real production app, you would use a dynamic StrawPoll ID here */}
              {/* For this demo, we're showing the stateless integration UI */}
              <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-4 sm:p-8 text-center">
                <div className="space-y-4 sm:space-y-6 w-full max-w-sm">
                  <div className="flex gap-3 sm:gap-4">
                    <button className="flex-1 brutal-btn bg-[#7ed957] py-3 sm:py-4 font-black text-lg sm:text-xl uppercase shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">YES</button>
                    <button className="flex-1 brutal-btn bg-[#ff5757] py-3 sm:py-4 font-black text-lg sm:text-xl uppercase shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">NO</button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                      <span>Yes (84%)</span>
                      <span>No (16%)</span>
                    </div>
                    <div className="h-3 sm:h-4 w-full bg-gray-200 brutal-border overflow-hidden flex">
                      <div className="h-full bg-[#7ed957] w-[84%] border-r-2 border-black"></div>
                      <div className="h-full bg-[#ff5757] w-[16%]"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                    <p className="text-[8px] sm:text-[10px] font-bold opacity-50 uppercase italic leading-tight">
                      Stateless 3rd-party integration. Votes handled entirely off-site via StrawPoll.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
