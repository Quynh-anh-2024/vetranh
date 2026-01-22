import { ArtStyle } from "../components/StyleSelector";

interface TranslateParams {
  apiKey: string;
  vnText: string;
  style: ArtStyle;
  grade: number;
  lessonName: string;
}

const CACHE: Record<string, string> = {};
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const translateVnToEnPrompt = async ({
  apiKey, vnText, style, grade, lessonName
}: TranslateParams): Promise<string> => {
  if (!apiKey) {
    return `Kids drawing of ${lessonName}, ${vnText}, ${style} style, white background, no text`;
  }

  const cacheKey = `${grade}|${lessonName}|${style}|${vnText}`;
  if (CACHE[cacheKey]) return CACHE[cacheKey];

  // Style logic
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

  const systemInstruction = `Role: Expert AI Art Prompter for Primary Education.
Task: Convert the following Vietnamese idea into a high-quality English prompt for image generation.
Constraints: White background (unless specified), NO text, Safe for kids, High quality 8k.
Style: ${styleInstruction}`;

  const userPrompt = `Input Idea (Vietnamese): "${vnText}"
Context: Grade ${grade} Lesson "${lessonName}"
Output: ONLY the final English prompt string.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });

    if (!response.ok) throw new Error("Gemini Translation Failed");
    
    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || `Illustration of ${vnText}, ${style} style`;
    
    CACHE[cacheKey] = result;
    return result;

  } catch (error) {
    console.error("Translation Error:", error);
    return `Illustration of ${lessonName}: ${vnText}, ${style} style`;
  }
};