export interface TravelAdvisory {
  location: string;
  level: 'High Caution' | 'Caution' | 'Warning' | 'Alert';
  message: string;
  sourceUrl?: string;
}

function extractJson(text: string): any {
  let cleanJson = text;
  // Try to find an array block
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    cleanJson = jsonMatch[0];
  } else {
    cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
  }
  return JSON.parse(cleanJson);
}

export async function getLiveAdvisories(): Promise<TravelAdvisory[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch('/api/advisories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error("Failed to fetch advisories:", err);
    return getFallbackAdvisories();
  }
}

function getFallbackAdvisories(): TravelAdvisory[] {
  return [
    {
      location: "Tehran, Iran",
      level: "High Caution",
      message: "Regional instability. Avoid non-essential travel."
    },
    {
      location: "Dubai, UAE",
      level: "Caution",
      message: "Increased caution due to regional security concerns."
    },
    {
      location: "Cancun, Mexico",
      level: "Caution",
      message: "Recent weather alerts. Check local forecasts."
    },
    {
      location: "Tokyo, Japan",
      level: "Warning",
      message: "Peak cherry blossom crowds. Expect long wait times."
    }
  ];
}
