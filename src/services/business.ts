import { GoogleGenAI, Type } from "@google/genai";
import { withRetry } from "../lib/api";
import { cache } from "../lib/cache";

export interface BusinessSnapshot {
  city: string;
  overallFriendlinessScore: number;
  companyTypes: string[];
  registrationProcess: 'Very Easy' | 'Easy' | 'Medium' | 'Difficult' | 'Very Difficult';
  thrivingBusinesses: string[]; // High Demand, Low Competition
  viableBusinesses: string[]; // Good Demand, Moderate Competition
  difficultBusinesses: string[]; // Saturated or Restricted
  investmentAmount: string;
  foreignOwnership: string;
  commercialRent: string;
  businessRealities: string;
  restrictions: {
    canDo: string[];
    cantDo: string[];
  };
  bankingAndCurrency: string;
  summary: string;
}

export async function getBusinessSnapshot(city: string): Promise<BusinessSnapshot> {
  const cacheKey = `business_${city}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const cached = cache.get<BusinessSnapshot>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Provide a detailed business intelligence report for ${city}. 
  Include:
  - Overall Business Friendliness Score (1-10)
  - Common Company Types Available for foreigners
  - Registration Process difficulty (Very Easy, Easy, Medium, Difficult, Very Difficult)
  - Thriving Businesses (High Demand, Low Competition)
  - Viable Businesses (Good Demand, Moderate Competition)
  - Difficult Businesses (Saturated or Restricted)
  - Typical Business Investment amount needed
  - Foreign ownership rules (is 100% allowed?)
  - Commercial rent costs
  - Business realities (the "unfiltered" truth)
  - Restrictions for foreigners (Can Do / Can't Do)
  - Business banking and merchant account availability
  
  Be blunt and objective.`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            city: { type: Type.STRING },
            overallFriendlinessScore: { type: Type.NUMBER },
            companyTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
            registrationProcess: { 
              type: Type.STRING, 
              enum: ['Very Easy', 'Easy', 'Medium', 'Difficult', 'Very Difficult'] 
            },
            thrivingBusinesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            viableBusinesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            difficultBusinesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            investmentAmount: { type: Type.STRING },
            foreignOwnership: { type: Type.STRING },
            commercialRent: { type: Type.STRING },
            businessRealities: { type: Type.STRING },
            restrictions: {
              type: Type.OBJECT,
              properties: {
                canDo: { type: Type.ARRAY, items: { type: Type.STRING } },
                cantDo: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["canDo", "cantDo"]
            },
            bankingAndCurrency: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: [
            "city", "overallFriendlinessScore", "companyTypes", "registrationProcess",
            "thrivingBusinesses", "viableBusinesses", "difficultBusinesses",
            "investmentAmount", "foreignOwnership", "commercialRent",
            "businessRealities", "restrictions", "bankingAndCurrency", "summary"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI model.");
    const data = JSON.parse(text);
    cache.set(cacheKey, data, 1000 * 60 * 60 * 24 * 7); // Business data doesn't change fast. 7 days.
    return data;
  });
}
