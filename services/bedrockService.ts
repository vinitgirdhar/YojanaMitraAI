import { UserProfile, Scheme } from '../types';
import { bedrockConfig, featureFlags } from '../aws-config';

export interface SchemeRecommendation extends Scheme {
  score: number;
  explanation: string;
  reasoning: string;
}

export interface ChatResponse {
  success: boolean;
  conversationId: string;
  message: string;
  aiModel: string;
  timestamp: string;
}

export interface RecommendationResponse {
  success: boolean;
  recommendations: SchemeRecommendation[];
  aiModel: string;
  timestamp: string;
}

/**
 * Gets the API endpoint URL from environment or config
 */
function getApiEndpoint(): string {
  return process.env.VITE_API_ENDPOINT || process.env.VITE_API_GATEWAY_URL || 'http://localhost:3001/api';
}

/**
 * Fetches recommendations from Bedrock via API Gateway
 */
export async function getSchemeRecommendations(
  userProfile: UserProfile,
  topN: number = 5
): Promise<RecommendationResponse> {
  try {
    if (!featureFlags.useBedrockAsPrimary) {
      throw new Error('Bedrock is disabled via feature flag');
    }

    const apiEndpoint = getApiEndpoint();
    const response = await fetch(`${apiEndpoint}/schemes/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        userProfile,
        topN
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Bedrock recommendations:', error);
    throw new Error(`Failed to get scheme recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Sends a chat message and gets response from dual-AI (Bedrock + optional Gemini)
 */
export async function sendChatMessage(
  userId: string,
  message: string,
  conversationId?: string,
  useGemini: boolean = false,
  userContext?: any
): Promise<ChatResponse> {
  try {
    const apiEndpoint = getApiEndpoint();
    const response = await fetch(`${apiEndpoint}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        userId,
        message,
        conversationId,
        useGemini,
        userContext
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieves chat history for a conversation
 */
export async function getChatHistory(
  conversationId: string,
  limit: number = 20
): Promise<any> {
  try {
    const apiEndpoint = getApiEndpoint();
    const response = await fetch(
      `${apiEndpoint}/chat/history?conversationId=${conversationId}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw new Error(`Failed to fetch chat history: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Transcribes audio using AWS Transcribe
 */
export async function transcribeAudio(
  audioData: string, // Base64 encoded
  mediaFormat: 'mp3' | 'wav' | 'webm' | 'ogg' = 'wav',
  languageCode: string = 'en-IN'
): Promise<any> {
  try {
    if (!featureFlags.enableVoiceInput) {
      throw new Error('Voice input is disabled via feature flag');
    }

    const apiEndpoint = getApiEndpoint();
    const response = await fetch(`${apiEndpoint}/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        audioData,
        mediaFormat,
        languageCode
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Polls transcription job status
 */
export async function getTranscriptionStatus(jobName: string): Promise<any> {
  try {
    const apiEndpoint = getApiEndpoint();
    const response = await fetch(`${apiEndpoint}/transcribe/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({ jobName })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting transcription status:', error);
    throw new Error(`Failed to get transcription status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets authentication token from Cognito (via Amplify)
 * This will be implemented in the auth module
 */
async function getAuthToken(): Promise<string> {
  try {
    // This will be implemented when Amplify Auth is configured
    // For now, return a placeholder
    const token = sessionStorage.getItem('authToken') || '';
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return '';
  }
}

/**
 * Compares responses from Bedrock and Gemini for A/B testing
 */
export async function compareAIResponses(
  message: string,
  userContext?: any
): Promise<{ bedrock: string; gemini: string }> {
  try {
    const apiEndpoint = getApiEndpoint();
    const response = await fetch(`${apiEndpoint}/compare-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        message,
        userContext
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error comparing AI responses:', error);
    throw new Error(`Failed to compare responses: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets Bedrock model information and availability
 */
export function getBedrockModelInfo() {
  return {
    primaryModel: bedrockConfig.models.primary,
    fallbackModel: bedrockConfig.models.fallback,
    region: bedrockConfig.region,
    maxTokens: bedrockConfig.maxTokens,
    isPrimaryEnabled: featureFlags.useBedrockAsPrimary,
    isFallbackEnabled: featureFlags.useGeminiAsFallback
  };
}
