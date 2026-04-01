import { GoogleGenAI, Type } from "@google/genai";

export interface EducationSnapshot {
  city: string;
  overallScore: number; // 1-10
  summary: string;
  
  // Higher Education
  higherEd: {
    types: string[]; // Public national, Private secular, Private religious, Technical, Community colleges, Online, Foreign branch, Military
    accreditation: {
      national: string;
      international: string;
      professional: string;
      globalRanking: string;
    };
    structure: {
      faculties: string[];
      totalPrograms: string;
      languages: string[];
    };
    financials: {
      tuitionLocal: string;
      tuitionIntl: string;
      adminFees: string;
      loanAvailability: string;
    };
    internationalExperience: {
      percentIntl: string;
      topNationalities: string[];
      supportServices: string[]; // Buddy, Visa, Airport, etc.
    };
    outcomes: {
      employmentRate: string;
      startingSalary: string;
      topEmployers: string[];
    };
    studentReviews: {
      overall: number;
      teaching: number;
      campusLife: number;
      careerSupport: number;
      valueForMoney: number;
      socialLife: number;
    };
    topUniversities: {
      name: string;
      type: string;
      highlight: string;
    }[];
  };
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = 
      error.message?.includes('429') || 
      error.message?.includes('503') || 
      error.message?.includes('overwhelmed') ||
      error.message?.includes('deadline') ||
      error.message?.includes('fetch');

    if (retries > 0 && isRetryable) {
      console.log(`Retrying Education API call... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function getEducationSnapshot(city: string): Promise<EducationSnapshot> {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Provide a comprehensive, blunt, and data-driven snapshot of the Higher Education (Universities & Colleges) landscape in ${city}. 
    Target audience: International students, relocating academics, and families with university-age children.
    
    Focus ONLY on higher education (undergraduate, masters, PhD, technical institutes, community colleges). 
    DO NOT include K-12 school data.
    
    Include:
    1. Types: Public national, Private secular, Private religious, Technical/polytechnic, Community colleges, Online/hybrid, Foreign branch campuses, Military academies.
    2. Accreditation & Recognition: National, International (US CHEA, UK QAA, etc.), Professional bodies, and Global ranking position.
    3. Academic Structure: Faculties, total programs (undergrad/masters/PhD), and languages of instruction.
    4. Financial: Tuition (local vs intl), admin fees, and student loan availability.
    5. International Student Experience: % intl students, top nationalities, buddy/mentoring programs, visa support, and airport pickup.
    6. Career & Outcomes: Graduate employment rate (6mo/1yr), average starting salary, and top employers.
    7. Student Reviews: Overall satisfaction, teaching quality, campus life, career support, value for money, and social life (all 1-10 scores).
    8. Top Institutions: List 3-5 top universities with their type and a key highlight.
    
    Be realistic and critical. If tuition is exorbitant or international support is lacking, say so.
    
    CRITICAL: Return the data in the specified JSON format. Use Google Search to find real, current data points for ${city}.`;

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
            city: { type: Type.STRING },
            overallScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            higherEd: {
              type: Type.OBJECT,
              properties: {
                types: { type: Type.ARRAY, items: { type: Type.STRING } },
                accreditation: {
                  type: Type.OBJECT,
                  properties: {
                    national: { type: Type.STRING },
                    international: { type: Type.STRING },
                    professional: { type: Type.STRING },
                    globalRanking: { type: Type.STRING },
                  },
                  required: ["national", "international", "professional", "globalRanking"]
                },
                structure: {
                  type: Type.OBJECT,
                  properties: {
                    faculties: { type: Type.ARRAY, items: { type: Type.STRING } },
                    totalPrograms: { type: Type.STRING },
                    languages: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["faculties", "totalPrograms", "languages"]
                },
                financials: {
                  type: Type.OBJECT,
                  properties: {
                    tuitionLocal: { type: Type.STRING },
                    tuitionIntl: { type: Type.STRING },
                    adminFees: { type: Type.STRING },
                    loanAvailability: { type: Type.STRING },
                  },
                  required: ["tuitionLocal", "tuitionIntl", "adminFees", "loanAvailability"]
                },
                internationalExperience: {
                  type: Type.OBJECT,
                  properties: {
                    percentIntl: { type: Type.STRING },
                    topNationalities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    supportServices: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["percentIntl", "topNationalities", "supportServices"]
                },
                outcomes: {
                  type: Type.OBJECT,
                  properties: {
                    employmentRate: { type: Type.STRING },
                    startingSalary: { type: Type.STRING },
                    topEmployers: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["employmentRate", "startingSalary", "topEmployers"]
                },
                studentReviews: {
                  type: Type.OBJECT,
                  properties: {
                    overall: { type: Type.NUMBER },
                    teaching: { type: Type.NUMBER },
                    campusLife: { type: Type.NUMBER },
                    careerSupport: { type: Type.NUMBER },
                    valueForMoney: { type: Type.NUMBER },
                    socialLife: { type: Type.NUMBER },
                  },
                  required: ["overall", "teaching", "campusLife", "careerSupport", "valueForMoney", "socialLife"]
                },
                topUniversities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      type: { type: Type.STRING },
                      highlight: { type: Type.STRING },
                    },
                    required: ["name", "type", "highlight"]
                  }
                }
              },
              required: ["types", "accreditation", "structure", "financials", "internationalExperience", "outcomes", "studentReviews", "topUniversities"]
            }
          },
          required: ["city", "overallScore", "summary", "higherEd"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI model.");
    return JSON.parse(text);
  });
}
