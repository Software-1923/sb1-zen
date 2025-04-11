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
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.9,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    }
  });

  const prompt = `Generate ${count} unique quadratic equations in the form ax² + bx + c with integer coefficients where a is 1 or -1, and their factors. Each equation should be different from the previous ones. Format each equation as a JSON object with "equation" and "factors" properties. The factors should be in the form (x+p)(x+q) where p and q are integers. Return only the JSON array.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const equations = JSON.parse(text);
      // Ensure we don't have duplicate equations
      const uniqueEquations = (Array.from(new Set(equations.map(JSON.stringify))) as string[]).map((value: string) => JSON.parse(value));
      return uniqueEquations.slice(0, count);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      return mockEquations.slice(0, count);
    }
  } catch (error) {
    console.error("Failed to generate equations:", error);
    return mockEquations.slice(0, count);
  }
}