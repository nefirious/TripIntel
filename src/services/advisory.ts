import { GoogleGenAI, Type } from "@google/genai";

export interface TravelAdvisory {
  location: string;
  level: 'High Caution' | 'Caution' | 'Warning' | 'Alert';
  message: string;
  sourceUrl?: string;
}

export async function getLiveAdvisories(): Promise<TravelAdvisory[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const prompt = `Search for the most recent and significant global travel advisories, warnings, or major travel-disrupting news (e.g., strikes, natural disasters, political unrest) from the last 48 hours.
    
    Include an advisory for Tehran, Iran and Dubai, UAE as they are priority locations for this board. For Dubai, the level must be "Caution" (Level 2) due to regional instability.
    
    Provide exactly 4-6 diverse advisories for different global locations.
    
    For each advisory, provide:
    - location: The city or country.
    - level: Strictly one of "High Caution", "Caution", "Warning", "Alert".
    - message: A short, blunt summary of the situation (max 15 words).
    
    Use Google Search to ensure the information is current as of today, March 22, 2026.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              location: { type: Type.STRING },
              level: { type: Type.STRING },
              message: { type: Type.STRING },
            },
            required: ["location", "level", "message"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from model");
    return JSON.parse(text);
  } catch (err: any) {
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
