import { GoogleGenAI, Type } from "@google/genai";
import { IdeaSuggestion } from '../types';

// Helper to translate Vietnamese lesson title to English Art Prompt
export const generateArtPrompt = async (apiKey: string, lessonTitle: string, grade: number, topic: string): Promise<string> => {
  if (!apiKey) return `Children's art illustration of ${lessonTitle}`;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // Updated to faster/cheaper model if available, else fallback
      contents: `Translate this Vietnamese primary school art lesson into a visual description prompt for an AI image generator.
      Lesson: "${lessonTitle}"
      Topic: "${topic}"
      Grade: ${grade}
      Context: "Ket noi tri thuc" textbook series.
      
      Requirements:
      - Style: Vibrant, crayon or watercolor style, suitable for kids.
      - Content: Safe, educational, simple shapes.
      - Output: ONLY the English prompt text. No explanations.
      `,
    });
    return response.text?.trim() || `Illustration for ${lessonTitle}`;
  } catch (e) {
    console.error("Prompt Gen Error", e);
    return `Children's art illustration of ${lessonTitle}`;
  }
};

export const generateImageBlob = async (apiKey: string, prompt: string, styleModifier?: string): Promise<Blob | null> => {
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

  try {
    // If a style modifier is provided, use it. Otherwise, fallback to default colorful style.
    const styleContext = styleModifier || "colorful children's book illustration style";
    
    // Construct the final prompt
    const finalPrompt = `${prompt}, ${styleContext}, white background, no text, no words, high quality, masterpiece`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Ensure user has access to this model
      contents: { parts: [{ text: finalPrompt }] },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        // Convert Base64 to Blob
        const byteCharacters = atob(part.inlineData.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: 'image/png' });
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error; // Re-throw to handle UI error states
  }
};

export const generateImageForIdea = async (apiKey: string, title: string, description: string): Promise<string | null> => {
  if (!apiKey) return null;
  const prompt = `Children's art project illustration: ${title}. ${description}`;
  try {
    const blob = await generateImageBlob(apiKey, prompt);
    if (blob) {
      return URL.createObjectURL(blob);
    }
  } catch (e) {
    console.error("Error generating image for idea:", e);
  }
  return null;
};

export const generateCreativeIdeas = async (apiKey: string, grade: number, subjectName: string, topicName: string): Promise<IdeaSuggestion[]> => {
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Suggest 3 creative art project ideas for primary school students (Grade ${grade}) for the topic "${topicName}" in subject "${subjectName}".
      For each idea, provide a title, a short description suitable for children, and a list of materials needed.
      The content should be in Vietnamese.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              materials: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "description", "materials"]
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as IdeaSuggestion[];
    }
    return [];
  } catch (e) {
    console.error("Error generating ideas:", e);
    return [];
  }
};