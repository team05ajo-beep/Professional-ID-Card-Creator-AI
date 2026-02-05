
import { GoogleGenAI } from "@google/genai";
import { ProfessionType } from "../types";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const generateProfessionalPhoto = async (
  base64Image: string, 
  profession: ProfessionType = ProfessionType.CORPORATE_MALE
): Promise<string | null> => {
  const ai = getAI();
  const mimeType = base64Image.split(';')[0].split(':')[1];
  const data = base64Image.split(',')[1];

  let attireDescription = "";
  
  if (profession === ProfessionType.CORPORATE_MALE) {
    attireDescription = "a high-quality black executive business suit, crisp white shirt, and professional dark blue tie. The fabric should look real with natural folds.";
  } else if (profession === ProfessionType.CORPORATE_FEMALE) {
    attireDescription = "a high-quality black corporate blazer with a white formal blouse. The attire should look like a real professional garment.";
  } else if (profession === ProfessionType.MEDICAL) {
    attireDescription = "a standard professional white medical doctor's lab coat with realistic fabric texture.";
  } else {
    attireDescription = "standard professional corporate attire.";
  }

  const prompt = `
    TASK: Photo-realistic corporate ID headshot manipulation.
    
    MANDATORY COMPOSITION & POSE RULES:
    1. FRAMING: Standard ID Card / KTP composition. Chest-up (Pas Foto 3x4 style). The person's head, neck, and upper chest/shoulders must be clearly visible and perfectly centered.
    2. FRONTAL ORIENTATION: The person MUST face the camera DIRECTLY (Frontal View). The nose, eyes, and shoulders must be perfectly symmetrical and level.
    3. ZERO IDENTITY DRIFT: The face in the output MUST be a 100% exact match to the face in the source photo. Maintain every unique facial feature, skin tone, and eye detail exactly as provided.
    4. BACKGROUND: Solid BRIGHT RED background (#FF0000). 
    5. EDGE-TO-EDGE: THE RED BACKGROUND MUST FILL THE ENTIRE IMAGE FRAME FROM EDGE TO EDGE. ABSOLUTELY NO WHITE MARGINS, NO PADDING, AND NO BORDERS IN THE GENERATED IMAGE.
    6. ATTIRE: Replace the current clothing with ${attireDescription}. The suit/blazer must be perfectly fitted and aligned with the new frontal pose.
    7. LIGHTING: Professional studio lighting with soft shadows. No harsh reflections.
    
    THE FINAL IMAGE MUST LOOK LIKE A REAL PHYSICAL PHOTOGRAPH TAKEN IN A PROFESSIONAL PHOTO STUDIO FACING THE CAMERA DIRECTLY. 
    
    OUTPUT: Return ONLY the processed image data as a base64 string.
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

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
