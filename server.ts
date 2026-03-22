import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  // Gemini logic moved to server-side to hide API key
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  app.post("/api/snapshot", async (req, res) => {
    console.log("Received snapshot request:", req.body);
    const { destination, month, activity } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing in server environment");
      return res.status(500).json({ error: "Server configuration error: Missing API Key" });
    }

    const prompt = `Provide a highly detailed, honest, and blunt travel snapshot for ${destination} in the month of ${month}, with a focus on the activity: ${activity}.
    
    You are a travel advisor who tells the truth. If it's a terrible time to go (e.g., monsoons, extreme heat, massive crowds, closed attractions), score it low and explain why.
    If it's the perfect time, explain why.
    
    CRITICAL CONSTRAINT: Do NOT use em-dashes (—) in any part of your response. Use colons (:), periods (.), or commas (,) instead.
    
    SPECIFIC ADVISORY OVERRIDE: If the destination is Dubai, the travelAdvisory level MUST be "Level 2: Exercise Increased Caution" due to regional instability and current security concerns.
    
    Guidelines:
    - score: 1 to 10.
    - label: "Perfect Time", "Great", "Good", "Fair", "Go With Caution", or "Think Twice".
    - weatherIcon: strictly one of "sun", "rain", "snow", "cloud", "fog", "storm".
    - typicalWeatherState: Strictly one of the following based on typical climate for this month:
      * SNOW: avg temp below 2°C or regular snowfall
      * RAINY: more than 150mm rainfall that month, frequent grey days
      * FOGGY: smog season, low visibility, overcast dominant
      * GREEN: post-monsoon or spring, lush vegetation, mild temps
      * DRY_GRASS: hot and dry, under 20mm rain, brown landscape
      * SUNNY: clear skies, 20–30°C, low humidity, pleasant
      * SCORCHING: above 35°C average, dangerous midday heat
      * MONSOON: tropical heavy rain, flooding possible, 200mm+ rainfall
      * AUTUMN: cooling temps 10–20°C, low rain, falling leaves
      * SPRING: warming 15–22°C, blooming, low rain
    - packingList: A personalized packing list for this destination and month:
      * essentials: 2-3 must-have items (e.g., "Universal adapter", "Physical map").
      * clothing: 3-5 specific clothing items based on weather (e.g., "Light linen shirts", "Thermal base layers").
      * extras: 2-3 helpful extras (e.g., "Compact umbrella", "Portable fan").
    - callout: A short, punchy highlight or warning (e.g., "Monsoon season: expect 18+ rainy days").
    - crowds: "Low", "Medium", "High", or "Peak".
    - pricing: "Off-season", "Shoulder season", or "Peak season".
    - events: 1-3 major events or festivals happening this month.
    - cantDo: 1-3 things you CANNOT do this month (e.g., "Snorkeling is ruined by swells", "Outdoor markets are closed").
    - localRealities: 1-3 honest, blunt notes (e.g., "Streets flood badly in the old quarter", "The main viewpoint is under scaffolding").
    - healthSafety: 1-3 health/safety flags (e.g., "High UV index", "Jellyfish season", "Air quality is poor").
    - monthScores: An array of exactly 12 numbers (1-10) representing the general travel score for each month of the year (Jan to Dec) for this destination.
    - seasonalHighlights: An object containing:
      * food: 1-3 seasonal food items or dishes that are at their best or specifically celebrated this month (e.g., "Alphonso Mangoes", "White Truffles").
      * drink: 1-2 seasonal drinks or beverages (e.g., "Fresh Sugarcane Juice", "Mulled Wine").
    - secrets: A highly confidential section "researched by people who actually lived there":
      * scams: 2-3 common scams targeting newcomers or tourists in this specific city.
      * culturalMistakes: 2-3 cultural mistakes that will get you overcharged or disrespected.
      * legalButProblematic: 1-2 things that are technically legal but will cause serious problems with locals or authorities.
      * emergencyNumbers: An array of objects with "service" (e.g., Police, Ambulance) and "number".
      * majorBanks: 2-3 major banks with branches in this city.
      * currency: name, code (e.g., EUR), symbol, and current approximate usdExchangeRate (how much 1 USD is worth in local currency). 
        CRITICAL: Use Google Search to find the ACTUAL LIVE market exchange rate as of right now. DO NOT project or guess future rates for the year 2026. Use the real-world values found in your search results (e.g., if search says 1 USD = 83 INR, use 83, NOT 92).
      * acceptedCurrencies: 1-3 other currencies commonly accepted in the city (e.g., "USD", "EUR").
      * bestHospital: name and reason why it's best for expats/tourists.
      * power: voltage (e.g., "230V") and socketType (e.g., "Type C & F").
      * internetProviders: 2-3 best internet service providers for expats.
      * vpnsThatWork: 1-2 VPNs that actually work in that country.
      * travelAdvisory: An object with "level" (e.g., "Level 1: Exercise Normal Precautions", "Level 2: Exercise Increased Caution") and "reason" (a brief explanation of the current advisory).
      * vaccinations: An object with "required" (array of mandatory vaccines for entry) and "recommended" (array of suggested vaccines).
      * localLife: An object describing daily life:
          - vibe: A short description of the lifestyle (e.g., "Fast-paced urban", "Relaxed rural", "Traditional village").
          - density: Strictly one of "Sparsely Populated", "Moderately Populated", "Densely Populated", "Overcrowded".
          - jobMarket: A blunt assessment of job availability (e.g., "Strong tech hub", "Tourism dependent", "Limited opportunities").
          - commute: How people get around (e.g., "Reliable metro", "Heavy traffic", "Walkable").
      * nature: An object describing the environment:
          - vegetation: What the plants look like (e.g., "Tropical palms", "Pine forests", "Arid scrub").
          - landscape: The physical terrain (e.g., "Rolling hills", "Flat coastal", "Mountainous").
          - uniqueAnimals: 1-3 unique or common animals found in the area.
          
    Use Google Search to verify the most recent currency exchange rates and any active travel advisories for the destination.`;

    let lastError: any;
    const maxRetries = 3;
    const models = ["gemini-3-flash-preview", "gemini-3.1-pro-preview"];
    
    let success = false;
    let result: any = null;

    for (const model of models) {
      if (success) break;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Attempting snapshot with ${model} (attempt ${attempt + 1})`);
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("AI request timed out after 55 seconds.")), 55000)
          );

          const responsePromise = ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
              tools: [{ googleSearch: {} }],
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.NUMBER },
                  label: { type: Type.STRING },
                  weatherIcon: { type: Type.STRING },
                  weatherDesc: { type: Type.STRING },
                  typicalWeatherState: { type: Type.STRING },
                  temperature: { type: Type.STRING },
                  callout: { type: Type.STRING },
                  crowds: { type: Type.STRING },
                  pricing: { type: Type.STRING },
                  events: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cantDo: { type: Type.ARRAY, items: { type: Type.STRING } },
                  localRealities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  healthSafety: { type: Type.ARRAY, items: { type: Type.STRING } },
                  monthScores: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                  packingList: {
                    type: Type.OBJECT,
                    properties: {
                      essentials: { type: Type.ARRAY, items: { type: Type.STRING } },
                      clothing: { type: Type.ARRAY, items: { type: Type.STRING } },
                      extras: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["essentials", "clothing", "extras"]
                  },
                  seasonalHighlights: {
                    type: Type.OBJECT,
                    properties: {
                      food: { type: Type.ARRAY, items: { type: Type.STRING } },
                      drink: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["food", "drink"]
                  },
                  secrets: {
                    type: Type.OBJECT,
                    properties: {
                      scams: { type: Type.ARRAY, items: { type: Type.STRING } },
                      culturalMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
                      legalButProblematic: { type: Type.ARRAY, items: { type: Type.STRING } },
                      emergencyNumbers: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            service: { type: Type.STRING },
                            number: { type: Type.STRING },
                          },
                          required: ["service", "number"]
                        }
                      },
                      majorBanks: { type: Type.ARRAY, items: { type: Type.STRING } },
                      currency: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          code: { type: Type.STRING },
                          symbol: { type: Type.STRING },
                          usdExchangeRate: { type: Type.NUMBER },
                        },
                        required: ["name", "code", "symbol", "usdExchangeRate"]
                      },
                      acceptedCurrencies: { type: Type.ARRAY, items: { type: Type.STRING } },
                      bestHospital: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          reason: { type: Type.STRING },
                        },
                        required: ["name", "reason"]
                      },
                      power: {
                        type: Type.OBJECT,
                        properties: {
                          voltage: { type: Type.STRING },
                          socketType: { type: Type.STRING },
                        },
                        required: ["voltage", "socketType"]
                      },
                      internetProviders: { type: Type.ARRAY, items: { type: Type.STRING } },
                      vpnsThatWork: { type: Type.ARRAY, items: { type: Type.STRING } },
                      travelAdvisory: {
                        type: Type.OBJECT,
                        properties: {
                          level: { type: Type.STRING },
                          reason: { type: Type.STRING },
                        },
                        required: ["level", "reason"]
                      },
                      vaccinations: {
                        type: Type.OBJECT,
                        properties: {
                          required: { type: Type.ARRAY, items: { type: Type.STRING } },
                          recommended: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ["required", "recommended"]
                      },
                      localLife: {
                        type: Type.OBJECT,
                        properties: {
                          vibe: { type: Type.STRING },
                          density: { type: Type.STRING },
                          jobMarket: { type: Type.STRING },
                          commute: { type: Type.STRING },
                        },
                        required: ["vibe", "density", "jobMarket", "commute"]
                      },
                      nature: {
                        type: Type.OBJECT,
                        properties: {
                          vegetation: { type: Type.STRING },
                          landscape: { type: Type.STRING },
                          uniqueAnimals: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ["vegetation", "landscape", "uniqueAnimals"]
                      }
                    },
                    required: ["scams", "culturalMistakes", "legalButProblematic", "emergencyNumbers", "majorBanks", "currency", "acceptedCurrencies", "bestHospital", "power", "internetProviders", "vpnsThatWork", "travelAdvisory", "vaccinations", "localLife", "nature"]
                  }
                },
                required: [
                  "score", "label", "weatherIcon", "weatherDesc", "typicalWeatherState", "temperature",
                  "callout", "crowds", "pricing", "events", "cantDo",
                  "localRealities", "healthSafety", "monthScores", "packingList", "seasonalHighlights", "secrets"
                ]
              }
            }
          });

          const response = await Promise.race([responsePromise, timeoutPromise]) as any;
          const text = response.text;
          if (!text) throw new Error("Empty response from AI model.");
          result = JSON.parse(text);
          success = true;
          console.log("Successfully generated snapshot");
          break;
        } catch (err: any) {
          lastError = err;
          const errorMessage = err.message || JSON.stringify(err);
          console.error(`Error with ${model} (attempt ${attempt + 1}):`, errorMessage);
          
          if (errorMessage.includes("500") && attempt === 0) {
            console.warn("Retrying without tools due to 500 error");
            try {
              const noToolResponse = await ai.models.generateContent({
                model: model,
                contents: prompt + "\n\nIMPORTANT: Do not use external search tools for this specific retry. Use your internal knowledge.",
                config: { responseMimeType: "application/json" }
              });
              if (noToolResponse.text) {
                result = JSON.parse(noToolResponse.text);
                success = true;
                break;
              }
            } catch (inner) {
              console.error("No-tool fallback failed:", inner);
            }
          }

          const isRetryable = errorMessage.includes("503") || errorMessage.includes("429") || errorMessage.includes("high demand") || errorMessage.includes("timeout");
          if (isRetryable && attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 2000;
            console.log(`Retrying in ${delay}ms...`);
            await sleep(delay);
            continue;
          }
          break;
        }
      }
    }

    if (success) {
      res.json(result);
    } else {
      console.error("All attempts failed for snapshot generation");
      res.status(500).json({ error: lastError?.message || "Failed to generate snapshot" });
    }
  });

  app.post("/api/advisories", async (req, res) => {
    console.log("Received advisories request");
    
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing in server environment");
      return res.status(500).json({ error: "Server configuration error: Missing API Key" });
    }

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
    
    let success = false;
    let result: any = null;

    for (const model of models) {
      if (success) break;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Attempting advisories with ${model} (attempt ${attempt + 1})`);
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Advisory request timed out after 85 seconds.")), 85000)
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
          if (!text) throw new Error("Empty response from model");
          result = JSON.parse(text);
          success = true;
          console.log("Successfully generated advisories");
          break;
        } catch (error: any) {
          lastError = error;
          const errorMessage = error.message || JSON.stringify(error);
          console.error(`Error with ${model} (attempt ${attempt + 1}):`, errorMessage);
          
          if (errorMessage.includes("500") && attempt === 0) {
            try {
              const noToolResponse = await ai.models.generateContent({
                model: model,
                contents: prompt + "\n\nIMPORTANT: Do not use external search tools for this specific retry. Use your internal knowledge.",
                config: {
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
              if (noToolResponse.text) {
                result = JSON.parse(noToolResponse.text);
                success = true;
                break;
              }
            } catch (inner) {}
          }

          const isRetryable = errorMessage.includes("503") || errorMessage.includes("429") || errorMessage.includes("high demand") || errorMessage.includes("timeout");
          if (isRetryable && attempt < maxRetries) {
            await sleep(Math.pow(2, attempt) * 2000);
            continue;
          }
          break;
        }
      }
    }

    if (success) {
      res.json(result);
    } else {
      console.error("All attempts failed for advisories generation");
      res.status(500).json({ error: lastError?.message || "Failed to generate advisories" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

startServer();
