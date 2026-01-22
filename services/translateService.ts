import { GoogleGenAI } from "@google/genai";
import { ArtStyle } from "../components/StyleSelector";

interface TranslateParams {
  apiKey: string;
  vnText: string;
  style: ArtStyle;
  grade: number;
  lessonName: string;
}

const CACHE: Record<string, string> = {};

export const translateVnToEnPrompt = async ({
  apiKey, vnText, style, grade, lessonName
}: TranslateParams): Promise<string> => {
  if (!apiKey) {
    // Fallback if no API key: Simple mapping
    return `Kids drawing of ${lessonName}, ${vnText}, ${style} style, white background, no text`;
  }

  const cacheKey = `${grade}|${lessonName}|${style}|${vnText}`;
  if (CACHE[cacheKey]) return CACHE[cacheKey];

  const ai = new GoogleGenAI({ apiKey });

  // Style logic construction
  let styleInstruction = "";
  if (style === 'Pencil Line Art' || style === 'Pencil Sketch') {
    styleInstruction = "Strictly black and white outline only, coloring book page style, clean lines, no shading, no gray fill, white background.";
  } else if (style === 'Paper Cutout') {
    styleInstruction = "Paper cutout craft style, layered paper texture, soft shadows for depth, vibrant colors.";
  } else if (style === '3D Cartoon') {
    styleInstruction = "3D blender render, cute, plasticine texture, soft lighting, isometric view.";
  } else {
    styleInstruction = `${style} style, vibrant colors, cheerful atmosphere suitable for grade ${grade} children.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // Fast model
      contents: `
        Role: Expert AI Art Prompter for Primary Education.
        Task: Convert the following Vietnamese idea into a high-quality English prompt for image generation.
        
        Input Idea (Vietnamese): "${vnText}"
        Context: Grade ${grade} Lesson "${lessonName}"
        
        Style Requirements: ${styleInstruction}
        
        Global Constraints:
        - White background (unless specified otherwise in idea).
        - NO text, NO words, NO watermarks, NO signature.
        - Safe for kids, educational.
        - High quality, masterpiece, 8k.

        Output: ONLY the final English prompt string. Do not include explanations.
      `,
    });

    const result = response.text?.trim() || `Illustration of ${vnText}, ${style} style`;
    CACHE[cacheKey] = result;
    return result;

  } catch (error) {
    console.error("Translation Error:", error);
    return `Illustration of ${lessonName}: ${vnText}, ${style} style`;
  }
};