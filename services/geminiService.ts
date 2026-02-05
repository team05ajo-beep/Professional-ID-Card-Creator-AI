
import { GoogleGenAI } from "@google/genai";
import { ProfessionType } from "../types";

export const generateProfessionalPhoto = async (
  base64Image: string, 
  profession: ProfessionType = ProfessionType.CORPORATE_MALE
): Promise<string | null> => {
  // Inisialisasi langsung sesuai instruksi SDK terbaru
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts = base64Image.split(',');
  if (parts.length < 2) return null;
  
  const mimeType = parts[0].split(';')[0].split(':')[1];
  const data = parts[1];

  let attireDescription = "";
  if (profession === ProfessionType.CORPORATE_MALE) {
    attireDescription = "a high-quality black executive business suit, crisp white shirt, and professional dark blue tie.";
  } else if (profession === ProfessionType.CORPORATE_FEMALE) {
    attireDescription = "a high-quality black corporate blazer with a white formal blouse.";
  } else if (profession === ProfessionType.MEDICAL) {
    attireDescription = "a standard professional white medical doctor's lab coat.";
  } else {
    attireDescription = "standard professional corporate attire.";
  }

  const prompt = `
    TASK: Professional ID headshot manipulation.
    COMPOSITION: Chest-up (Pas Foto 3x4 style), person faces camera DIRECTLY and centered.
    BACKGROUND: Solid BRIGHT RED (#FF0000) background.
    IMPORTANT: THE RED BACKGROUND MUST FILL THE ENTIRE IMAGE FRAME WITHOUT ANY WHITE BORDERS OR MARGINS.
    IDENTITY: Keep the face 100% identical to the source photo.
    ATTIRE: Change current clothes to ${attireDescription}.
    OUTPUT: Return ONLY the base64 image string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: prompt }
        ]
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
};
