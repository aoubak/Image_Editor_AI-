import { GoogleGenAI } from "@google/genai";
import { EditImageResponse } from "../types";

// Initialize the Gemini API client
// The API key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Edits an image using Gemini 2.5 Flash Image model based on a text prompt.
 * 
 * @param base64Image The base64 encoded string of the original image (without data URI prefix).
 * @param mimeType The MIME type of the original image.
 * @param prompt The text description of the desired edit.
 * @returns An object containing the generated image URL or text response.
 */
export const generateEditedImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<EditImageResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    const result: EditImageResponse = {};
    
    // The response might contain text or an image (inlineData).
    // We iterate through parts to find the image.
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          result.imageUrl = `data:${mimeType};base64,${base64Data}`;
        } else if (part.text) {
          // Sometimes the model might return text explanation or refusal
          result.text = part.text;
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Error generating edited image:", error);
    throw error;
  }
};
