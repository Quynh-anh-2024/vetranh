import { IdeaSuggestion } from '../types';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const IMAGEN_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict";

// Helper for Text Generation via REST
const fetchGeminiText = async (apiKey: string, prompt: string, systemInstruction?: string, responseSchema?: any) => {
  const body: any = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  if (responseSchema) {
    body.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: responseSchema
    };
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

// Helper to translate Vietnamese lesson title to English Art Prompt
export const generateArtPrompt = async (apiKey: string, lessonTitle: string, grade: number, topic: string): Promise<string> => {
  if (!apiKey) return `Children's art illustration of ${lessonTitle}`;

  const prompt = `Translate this Vietnamese primary school art lesson into a visual description prompt for an AI image generator.
  Lesson: "${lessonTitle}"
  Topic: "${topic}"
  Grade: ${grade}
  Context: "Ket noi tri thuc" textbook series.
  
  Requirements:
  - Style: Vibrant, crayon or watercolor style, suitable for kids.
  - Content: Safe, educational, simple shapes.
  - Output: ONLY the English prompt text. No explanations.`;

  try {
    const text = await fetchGeminiText(apiKey, prompt);
    return text.trim() || `Illustration for ${lessonTitle}`;
  } catch (e) {
    console.error("Prompt Gen Error", e);
    return `Children's art illustration of ${lessonTitle}`;
  }
};

export const generateImageBlob = async (apiKey: string, prompt: string, styleModifier?: string): Promise<Blob | null> => {
  if (!apiKey) return null;

  try {
    const styleContext = styleModifier || "colorful children's book illustration style";
    const finalPrompt = `${prompt}, ${styleContext}, white background, no text, no words, high quality, masterpiece`;
    
    // Using Imagen 3 REST Endpoint structure
    const body = {
      instances: [
        { prompt: finalPrompt }
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1"
      }
    };

    const response = await fetch(`${IMAGEN_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Imagen API Error Body:", err);
      throw new Error(`Imagen API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    
    // Imagen 3 response structure: { predictions: [ { bytesBase64Encoded: "..." } ] }
    const base64Data = data.predictions?.[0]?.bytesBase64Encoded;

    if (base64Data) {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: 'image/png' });
    }
    
    return null;
  } catch (error) {
    console.error("Imagen Gen Error:", error);
    throw error;
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

  const prompt = `Suggest 3 creative art project ideas for primary school students (Grade ${grade}) for the topic "${topicName}" in subject "${subjectName}".
  For each idea, provide a title, a short description suitable for children, and a list of materials needed.
  The content should be in Vietnamese.`;

  // Define Schema for structured JSON
  const schema = {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        description: { type: "STRING" },
        materials: {
          type: "ARRAY",
          items: { type: "STRING" }
        }
      },
      required: ["title", "description", "materials"]
    }
  };

  try {
    const jsonText = await fetchGeminiText(apiKey, prompt, undefined, schema);
    if (jsonText) {
      return JSON.parse(jsonText) as IdeaSuggestion[];
    }
    return [];
  } catch (e) {
    console.error("Error generating ideas:", e);
    return [];
  }
};