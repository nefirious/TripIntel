/**
 * Weather service using Open-Meteo (free, no API key required)
 */

export type WeatherState = 
  | 'SNOW' 
  | 'RAINY' 
  | 'FOGGY' 
  | 'GREEN' 
  | 'DRY_GRASS' 
  | 'SUNNY' 
  | 'SCORCHING' 
  | 'MONSOON' 
  | 'AUTUMN' 
  | 'SPRING';

export interface WeatherInfo {
  state: WeatherState;
  temp: number;
  description: string;
  icon: string;
  label: string;
}

export const WEATHER_METADATA: Record<WeatherState, { icon: string; label: string; description: string }> = {
  SNOW: { icon: '❄️', label: 'Snow', description: 'Freezing, snowfall, ski conditions' },
  RAINY: { icon: '🌧️', label: 'Rainy', description: 'Wet season, grey skies, carry umbrella' },
  FOGGY: { icon: '🌫️', label: 'Foggy/Hazy', description: 'Low visibility, smog season, overcast' },
  GREEN: { icon: '🌱', label: 'Green & Lush', description: 'Post-rain, fresh, vegetation alive' },
  DRY_GRASS: { icon: '🌾', label: 'Dry Grass', description: 'Hot & dry, parched, dusty' },
  SUNNY: { icon: '☀️', label: 'Sunny & Warm', description: 'Clear skies, comfortable heat' },
  SCORCHING: { icon: '🔥', label: 'Scorching', description: 'Dangerous heat, 38°C+, avoid outdoors midday' },
  MONSOON: { icon: '🌊', label: 'Monsoon', description: 'Heavy rain, flooding risk, humid' },
  AUTUMN: { icon: '🍂', label: 'Crisp Autumn', description: 'Cool, clear, colourful foliage' },
  SPRING: { icon: '🌸', label: 'Spring Bloom', description: 'Flowers, mild, cherry blossom type' },
};

/**
 * Maps Open-Meteo WMO Weather interpretation codes to our custom states
 * https://open-meteo.com/en/docs
 */
function mapWmoCodeToState(code: number, temp: number, latitude: number): WeatherState {
  // Scorching check
  if (temp >= 35) return 'SCORCHING';
  
  // Snow codes: 71, 73, 75, 77, 85, 86
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'SNOW';
  
  // Rain codes: 51, 53, 55, 61, 63, 65, 80, 81, 82
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    if (temp > 25) return 'MONSOON'; // Tropical heavy rain approximation
    return 'RAINY';
  }
  
  // Fog codes: 45, 48
  if ([45, 48].includes(code)) return 'FOGGY';
  
  // Default based on temp if clear/partly cloudy (0, 1, 2, 3)
  if (temp >= 20 && temp < 35) return 'SUNNY';

  // Seasonal logic for mild temperatures
  const month = new Date().getMonth(); // 0-11
  const isNorthernHemisphere = latitude >= 0;
  
  // Spring: North (Mar-May: 2-4), South (Sep-Nov: 8-10)
  const isSpring = isNorthernHemisphere 
    ? (month >= 2 && month <= 4) 
    : (month >= 8 && month <= 10);

  if (temp >= 5 && temp < 22) {
    return isSpring ? 'SPRING' : 'AUTUMN';
  }
  
  if (temp < 2) return 'SNOW';
  
  return 'SUNNY'; // Fallback
}

export async function getLiveWeather(city: string): Promise<WeatherInfo | null> {
  try {
    // 1. Geocoding
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) return null;
    
    const { latitude, longitude } = geoData.results[0];
    
    // 2. Weather
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`);
    const weatherData = await weatherRes.json();
    
    const temp = weatherData.current.temperature_2m;
    const code = weatherData.current.weather_code;
    const state = mapWmoCodeToState(code, temp, latitude);
    const meta = WEATHER_METADATA[state];
    
    return {
      state,
      temp,
      description: meta.description,
      icon: meta.icon,
      label: meta.label
    };
  } catch (error) {
    console.error('Error fetching live weather:', error);
    return null;
  }
}
