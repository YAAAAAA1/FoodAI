import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FoodAnalysis } from "../types";

// Initialize Gemini Client safely
// This prevents immediate crash if 'process' is not defined (e.g. running locally in a vanilla browser)
const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';

const ai = new GoogleGenAI({ apiKey });

export const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    is_food: { type: Type.BOOLEAN, description: "True if the image contains food or drink, false otherwise." },
    food_name: { type: Type.STRING, description: "Name of the identified food dish or item." },
    serving_size_estimate: { type: Type.STRING, description: "Estimated serving size shown in the image (e.g., '1 cup', '200g')." },
    calories_kcal: { type: Type.NUMBER, description: "Estimated calories for the visible serving size." },
    macronutrients: {
      type: Type.OBJECT,
      properties: {
        protein_g: { type: Type.NUMBER, description: "Protein in grams." },
        carbs_g: { type: Type.NUMBER, description: "Carbohydrates in grams." },
        fat_g: { type: Type.NUMBER, description: "Total fat in grams." },
      },
      required: ["protein_g", "carbs_g", "fat_g"]
    },
    micronutrients: {
      type: Type.OBJECT,
      properties: {
        sugar_g: { type: Type.NUMBER, description: "Sugar in grams." },
        fiber_g: { type: Type.NUMBER, description: "Fiber in grams." },
        sodium_mg: { type: Type.NUMBER, description: "Sodium in milligrams." }
      },
      required: ["sugar_g", "fiber_g"]
    },
    health_score: { type: Type.NUMBER, description: "A score from 0 (unhealthy) to 100 (very healthy) based on nutritional density." },
    short_description: { type: Type.STRING, description: "A brief, 1-sentence interesting fact or summary about this food's nutrition." },
    confidence: { type: Type.NUMBER, description: "Confidence score of the identification (0-100)." },
    alternatives: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of 2-3 healthier alternative options if the food is unhealthy, or similar foods if healthy."
    }
  },
  required: ["is_food", "food_name", "calories_kcal", "macronutrients", "micronutrients", "health_score", "short_description"]
};

/**
 * Analyzes a food image using Gemini Vision model.
 * @param base64Image The base64 encoded image string (without data:image/... prefix)
 * @param mimeType The mime type of the image (e.g., 'image/jpeg')
 */
export const analyzeFoodImage = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<FoodAnalysis> => {
  if (!apiKey) {
    throw new Error("API Key is missing. If running locally, ensure process.env.API_KEY is configured or use the Integration Code view to learn more.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: `Analyze this image. If it is food, provide a detailed nutritional breakdown for the estimated portion size visible. 
            Be realistic with serving sizes. If it is NOT food, set 'is_food' to false and provide a generic description in 'food_name'.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2, // Low temperature for more factual/consistent output
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No data returned from AI");
    }

    const data = JSON.parse(jsonText) as FoodAnalysis;
    return data;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};