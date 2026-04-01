import { GoogleGenAI, Type } from "@google/genai";
import { withRetry } from "../lib/api";

export interface AirportStatus {
  airportName: string;
  crowdLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  statusLabel: string;
  lastUpdated: string;
  details: string;
  tips: string[];
}

export async function getAirportStatus(destination: string): Promise<AirportStatus> {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Provide the current, real-time airport status and crowd levels for the main international airport serving ${destination}.
    
    Use Google Search to find the most recent reports, social media updates, or official airport status pages from the last 24 hours.
    
    Categorize the crowd level as:
    - "Low": Very few people, no queues.
    - "Moderate": Decent crowd, manageable queues.
    - "High": Busy, long queues at security/check-in.
    - "Very High": Extremely crowded, potential delays, "too crowded".
    
    Return the data in JSON format.`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            airportName: { type: Type.STRING },
            crowdLevel: { 
              type: Type.STRING,
              enum: ['Low', 'Moderate', 'High', 'Very High']
            },
            statusLabel: { type: Type.STRING },
            lastUpdated: { type: Type.STRING },
            details: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["airportName", "crowdLevel", "statusLabel", "lastUpdated", "details", "tips"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI model.");
    return JSON.parse(text);
  });
}
