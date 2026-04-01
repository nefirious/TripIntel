import { GoogleGenAI, Type } from "@google/genai";

export interface School {
  name: string;
  type: 'Public' | 'Private' | 'International' | 'Religious';
  curriculum: string;
  rating: number;
  ageRange: string;
}

export interface SchoolQualitySnapshot {
  city: string;
  overallScore: number;
  classificationDistribution: {
    public: string;
    private: string;
    international: string;
    religious: string;
  };
  availableCurriculums: string[];
  ageRangesCovered: string;
  satisfactionScore: number;
  teacherQualityRating: number;
  topRatedSchools: School[];
  englishSupport: string;
  techInfrastructure: string;
  summary: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getSchoolQualitySnapshot(city: string): Promise<SchoolQualitySnapshot> {
  const prompt = `Provide a detailed report on the school system (pre-school to secondary) in ${city}. 
  Focus on:
  - Classification distribution (Public, Private, International, Religious)
  - Curriculum types available (IB, Cambridge, American, British, local, Montessori, Waldorf)
  - Age ranges covered
  - Overall satisfaction score (1-10)
  - Teacher quality ratings (1-10)
  - Top 3-5 rated schools with their specific details
  - English language support for non-native speakers
  - Technology infrastructure in schools
  
  Be objective and highlight both strengths and common complaints from parents.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          city: { type: Type.STRING },
          overallScore: { type: Type.NUMBER },
          classificationDistribution: {
            type: Type.OBJECT,
            properties: {
              public: { type: Type.STRING, description: "Description of public school availability and quality" },
              private: { type: Type.STRING, description: "Description of private school availability and quality" },
              international: { type: Type.STRING, description: "Description of international school availability and quality" },
              religious: { type: Type.STRING, description: "Description of religious school availability and quality" }
            },
            required: ["public", "private", "international", "religious"]
          },
          availableCurriculums: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of available curriculums like IB, Cambridge, etc."
          },
          ageRangesCovered: { type: Type.STRING, description: "e.g. 3 to 18 years" },
          satisfactionScore: { type: Type.NUMBER },
          teacherQualityRating: { type: Type.NUMBER },
          topRatedSchools: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["Public", "Private", "International", "Religious"] },
                curriculum: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                ageRange: { type: Type.STRING }
              },
              required: ["name", "type", "curriculum", "rating", "ageRange"]
            }
          },
          englishSupport: { type: Type.STRING },
          techInfrastructure: { type: Type.STRING },
          summary: { type: Type.STRING, description: "A 2-3 sentence overview of the education landscape" }
        },
        required: [
          "city", "overallScore", "classificationDistribution", "availableCurriculums", 
          "ageRangesCovered", "satisfactionScore", "teacherQualityRating", 
          "topRatedSchools", "englishSupport", "techInfrastructure", "summary"
        ]
      }
    }
  });

  return JSON.parse(response.text);
}
