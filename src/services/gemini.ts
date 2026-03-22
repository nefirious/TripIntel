export interface TravelSnapshot {
  score: number;
  label: string;
  weatherIcon: 'sun' | 'rain' | 'snow' | 'cloud' | 'fog' | 'storm';
  weatherDesc: string;
  typicalWeatherState: 'SNOW' | 'RAINY' | 'FOGGY' | 'GREEN' | 'DRY_GRASS' | 'SUNNY' | 'SCORCHING' | 'MONSOON' | 'AUTUMN' | 'SPRING';
  temperature: string;
  callout: string;
  crowds: string;
  pricing: string;
  events: string[];
  cantDo: string[];
  localRealities: string[];
  healthSafety: string[];
  monthScores: number[];
  packingList: {
    essentials: string[];
    clothing: string[];
    extras: string[];
  };
  seasonalHighlights: {
    food: string[];
    drink: string[];
  };
  secrets: {
    scams: string[];
    culturalMistakes: string[];
    legalButProblematic: string[];
    emergencyNumbers: { service: string; number: string }[];
    majorBanks: string[];
    currency: {
      name: string;
      code: string;
      symbol: string;
      usdExchangeRate: number;
    };
    acceptedCurrencies: string[];
    bestHospital: {
      name: string;
      reason: string;
    };
    power: {
      voltage: string;
      socketType: string;
    };
    internetProviders: string[];
    vpnsThatWork: string[];
    travelAdvisory: {
      level: string;
      reason: string;
    };
    vaccinations: {
      required: string[];
      recommended: string[];
    };
    localLife: {
      vibe: string;
      density: 'Sparsely Populated' | 'Moderately Populated' | 'Densely Populated' | 'Overcrowded';
      jobMarket: string;
      commute: string;
    };
    nature: {
      vegetation: string;
      landscape: string;
      uniqueAnimals: string[];
    };
  };
}

export async function getTravelSnapshot(
  destination: string,
  month: string,
  activity: string = 'General'
): Promise<TravelSnapshot> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch('/api/snapshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ destination, month, activity }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error("The request timed out. Please try again.");
    }
    console.error("Failed to fetch travel snapshot:", err);
    throw err;
  }
}
