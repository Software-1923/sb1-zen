import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

// Instead of throwing an error, provide mock data for development
const mockEquations = [
  { equation: "x² + 2x + 1", factors: "(x+1)(x+1)" },
  { equation: "x² - 4x + 4", factors: "(x-2)(x-2)" },
  { equation: "x² + 3x + 2", factors: "(x+2)(x+1)" },
  { equation: "x² - x - 2", factors: "(x+1)(x-2)" },
  { equation: "x² - 9", factors: "(x+3)(x-3)" },
  { equation: "x² + 5x + 6", factors: "(x+2)(x+3)" },
];

export type QuadraticEquation = {
  equation: string;
  factors: string;
};

export async function generateEquations(count: number): Promise<QuadraticEquation[]> {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not found, using mock data");
    return mockEquations.slice(0, count);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-pro-preview-03-25",
    generationConfig: {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 65536
    }
  });

  const prompt = `Generate ${count} unique quadratic equations in the form ax² + bx + c with integer coefficients where a is 1 or -1, and their factors. Format each equation as a JSON object with "equation" and "factors" properties. The factors should be in the form (x+p)(x+q) where p and q are integers. Return only the JSON array.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to generate equations:", error);
    return mockEquations.slice(0, count);
  }
}