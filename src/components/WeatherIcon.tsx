import { Sun, CloudRain, Snowflake, Cloud, CloudFog, CloudLightning } from 'lucide-react';
import { motion } from 'motion/react';

interface WeatherIconProps {
  icon: 'sun' | 'rain' | 'snow' | 'cloud' | 'fog' | 'storm';
  className?: string;
}

export function WeatherIcon({ icon, className = "w-12 h-12" }: WeatherIconProps) {
  switch (icon) {
    case 'sun':
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className={`text-yellow-400 ${className}`}
        >
          <Sun className="w-full h-full fill-yellow-400" />
        </motion.div>
      );
    case 'rain':
      return (
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`text-blue-500 ${className}`}
        >
          <CloudRain className="w-full h-full fill-blue-200" />
        </motion.div>
      );
    case 'snow':
      return (
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`text-sky-300 ${className}`}
        >
          <Snowflake className="w-full h-full" />
        </motion.div>
      );
    case 'cloud':
      return (
        <motion.div
          animate={{ x: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`text-gray-400 ${className}`}
        >
          <Cloud className="w-full h-full fill-gray-200" />
        </motion.div>
      );
    case 'fog':
      return (
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`text-slate-400 ${className}`}
        >
          <CloudFog className="w-full h-full" />
        </motion.div>
      );
    case 'storm':
      return (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
          className={`text-purple-600 ${className}`}
        >
          <CloudLightning className="w-full h-full fill-purple-300" />
        </motion.div>
      );
    default:
      return <Sun className={`text-yellow-400 ${className}`} />;
  }
}
