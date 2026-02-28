
import { GoogleGenAI } from "@google/genai";
import { featureFlags } from '../aws-config';

// Lazy-initialize so the app doesn't crash when no API key is set.
let ai: GoogleGenAI | null = null;

// Simple in-memory cache for responses (can be replaced with DynamoDB later)
const responseCache = new Map<string, { response: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

function getAI(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in a .env file.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

/**
 * Gets a cached response if available and not expired
 */
function getCachedResponse(query: string): any | null {
  const cached = responseCache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached Gemini response');
    return cached.response;
  }
  return null;
}

/**
 * Caches a response for future use
 */
function cacheResponse(query: string, response: any): void {
  responseCache.set(query, {
    response,
    timestamp: Date.now()
  });
}

/**
 * Main Gemini query function with caching and fallback support
 * Used as fallback when Bedrock is unavailable or for search grounding
 */
export async function askYojanaMitra(query: string, userContext?: any) {
  try {
    // Check cache first
    const cached = getCachedResponse(query);
    if (cached) {
      return cached;
    }

    if (!featureFlags.useGeminiAsFallback) {
      throw new Error('Gemini fallback is disabled via feature flag');
    }

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

    const result = {
      text: response.text || "I'm sorry, I couldn't generate a response.",
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
      aiModel: 'Gemini 3 Flash (with Search Grounding)',
      timestamp: new Date().toISOString()
    };

    // Cache the response
    cacheResponse(query, result);

    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.",
      groundingChunks: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Query Gemini specifically for search grounding
 * Used to ground Bedrock responses with real-time web search
 */
export async function searchForSchemeUpdates(schemeName: string) {
  try {
    const query = `Latest updates and announcements about ${schemeName} Indian government scheme`;
    
    // Check cache
    const cached = getCachedResponse(query);
    if (cached) {
      return cached;
    }

    const response = await getAI().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for the latest information about the scheme: ${query}
                Provide recent updates, changes in eligibility criteria, new deadlines, or announcements.
                Format the response clearly with links to official sources.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const result = {
      schemeName,
      updates: response.text || "No recent updates found",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
      timestamp: new Date().toISOString()
    };

    cacheResponse(query, result);
    return result;
  } catch (error) {
    console.error("Error searching for scheme updates:", error);
    return {
      schemeName,
      updates: "Unable to fetch latest updates at this moment",
      sources: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Clear the response cache (useful for testing or forcing refresh)
 */
export function clearCache(): void {
  responseCache.clear();
  console.log('Gemini response cache cleared');
}

/**
 * Gets cache statistics
 */
export function getCacheStats() {
  return {
    cacheSize: responseCache.size,
    entries: Array.from(responseCache.keys())
  };
}

