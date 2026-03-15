import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface TravelAdvisory {
  location: string;
  level: 'High Caution' | 'Caution' | 'Warning' | 'Alert';
  message: string;
  sourceUrl?: string;
}

export async function getLiveAdvisories(): Promise<TravelAdvisory[]> {
  const prompt = `Search for the most recent and significant global travel advisories, warnings, or major travel-disrupting news (e.g., strikes, natural disasters, political unrest) from the last 48 hours.
  
  Include an advisory for Tehran, Iran and Dubai, UAE as they are priority locations for this board. For Dubai, the level must be "Caution" (Level 2) due to regional instability.
  
  Provide exactly 4-6 diverse advisories for different global locations.
  
  For each advisory, provide:
  - location: The city or country.
  - level: Strictly one of "High Caution", "Caution", "Warning", "Alert".
  - message: A short, blunt summary of the situation (max 15 words).
  
  Use Google Search to ensure the information is current as of today, March 15, 2026.`;

  let lastError: any;
  const maxRetries = 3;
  const models = ["gemini-3-flash-preview", "gemini-3.1-pro-preview"];
  
  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Advisory request timed out after 90 seconds.")), 90000)
        );

        const responsePromise = ai.models.generateContent({
          model: model,
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

        const response = await Promise.race([responsePromise, timeoutPromise]) as any;

        const text = response.text;
        if (!text) return getFallbackAdvisories();

        // Clean up potential markdown formatting
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson) as TravelAdvisory[];
      } catch (error: any) {
        lastError = error;
        const errorMessage = error.message || JSON.stringify(error);
        const isRetryable = 
          errorMessage.includes("503") || 
          errorMessage.includes("429") || 
          errorMessage.includes("high demand") ||
          errorMessage.includes("timed out") ||
          error.status === "UNAVAILABLE";

        if (isRetryable && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1500 + Math.random() * 1000;
          console.warn(`Advisory API busy with ${model} (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If it's not retryable or we've exhausted retries for this model, 
        // we'll break the inner loop and try the next model.
        console.warn(`Model ${model} failed, trying next model or fallback.`);
        break;
      }
    }
  }

  console.error("Error fetching live advisories after all retries and model fallbacks:", lastError);
  return getFallbackAdvisories();
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
