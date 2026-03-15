import { motion } from 'motion/react';
import { WeatherIcon } from './WeatherIcon';
import { MapPin, ArrowRight } from 'lucide-react';

interface CityCardProps {
  key?: string | number;
  city: string;
  score: number;
  weatherIcon: 'sun' | 'rain' | 'snow' | 'cloud' | 'fog' | 'storm';
  temperature: string;
  onClick: () => void | Promise<void>;
}

const getScoreColor = (score: number) => {
  if (score >= 8) return 'bg-[#7ed957]';
  if (score >= 6) return 'bg-[#ffde59]';
  if (score >= 4) return 'bg-[#ff914d]';
  return 'bg-[#ff5757]';
};

export function CityCard({ city, score, weatherIcon, temperature, onClick }: CityCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="brutal-card w-full text-left group"
    >
      <div className={`${getScoreColor(score)} p-4 border-b-4 border-[#1e1e24] flex justify-between items-center`}>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span className="font-black uppercase text-xs tracking-widest">Featured</span>
        </div>
        <div className="bg-white px-2 py-0.5 rounded-full border-2 border-[#1e1e24] font-black text-xs">
          {score}/10
        </div>
      </div>
      
      <div className="p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-1">{city.split(',')[0]}</h3>
          <p className="text-sm font-bold text-gray-500">{temperature}</p>
        </div>
        <div className="bg-gray-50 p-2 rounded-xl border-2 border-[#1e1e24] group-hover:bg-[#ffde59] transition-colors">
          <WeatherIcon icon={weatherIcon} className="w-10 h-10" />
        </div>
      </div>

      <div className="px-5 pb-4 flex items-center justify-end">
        <div className="flex items-center gap-1 text-xs font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">
          View Details <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </motion.button>
  );
}
