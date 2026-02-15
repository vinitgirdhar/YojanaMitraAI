
import { GoogleGenAI } from "@google/genai";

// Lazy-initialize so the app doesn't crash when no API key is set.
let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY in a .env file.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function askYojanaMitra(query: string, userContext?: any) {
  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are YojanaMitra AI, an expert assistant for Indian Government Schemes. 
            User context: ${JSON.stringify(userContext || {})}
            Answer the user's question simply and clearly in the context of Indian welfare. 
            Keep it encouraging and helpful for someone who may have low digital literacy.
            If they ask about specific schemes, use the Google Search tool to get the most up-to-date details.
            Query: ${query}`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    // Return an object containing both the text response and grounding chunks (sources).
    return {
      text: response.text || "I'm sorry, I couldn't generate a response.",
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.",
      groundingChunks: []
    };
  }
}
