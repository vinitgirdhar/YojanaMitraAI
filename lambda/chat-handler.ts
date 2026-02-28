import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const bedrockClient = new BedrockRuntimeClient({ region: 'ap-south-1' });
const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'ap-south-1' }));

const CHAT_HISTORY_TABLE = 'yojanamitra-chat-history';
const BEDROCK_MODEL = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface ChatRequest {
  userId: string;
  message: string;
  conversationId?: string;
  useGemini?: boolean;
  userContext?: any; // User profile context for better recommendations
}

/**
 * Retrieves chat history for a conversation
 */
async function getChatHistory(conversationId: string, limit: number = 10): Promise<ChatMessage[]> {
  try {
    const result = await dynamoDb.send(
      new QueryCommand({
        TableName: CHAT_HISTORY_TABLE,
        KeyConditionExpression: 'conversationId = :convId',
        ExpressionAttributeValues: {
          ':convId': conversationId
        },
        ScanIndexForward: false, // Latest messages first
        Limit: limit
      })
    );

    return result.Items?.map((item: any) => ({
      role: item.role,
      content: item.text,
      timestamp: item.timestamp
    })) || [];
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return [];
  }
}

/**
 * Saves a chat message to DynamoDB
 */
async function saveChatMessage(
  conversationId: string,
  userId: string,
  role: 'user' | 'assistant',
  text: string
): Promise<void> {
  try {
    await dynamoDb.send(
      new PutCommand({
        TableName: CHAT_HISTORY_TABLE,
        Item: {
          conversationId,
          timestamp: Date.now(),
          userId,
          role,
          text,
          sortKey: `${Date.now()}-${Math.random()}`
        }
      })
    );
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
}

/**
 * Invokes Bedrock with conversation history for context-aware responses
 */
async function invokeBedrockWithContext(
  userMessage: string,
  chatHistory: ChatMessage[],
  userContext?: any
): Promise<string> {
  try {
    // Prepare messages with conversation history
    const messages = [
      ...chatHistory.reverse().map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: userMessage
      }
    ];

    // System prompt for scheme guidance
    const systemPrompt = `You are a helpful AI assistant for YojanaMitra, an application that helps Indian citizens discover government welfare schemes (yojanas). 

${userContext ? `User Profile: ${JSON.stringify(userContext)}` : ''}

Your responsibilities:
1. Answer questions about Indian government schemes and welfare programs
2. Provide personalized recommendations based on user eligibility
3. Explain eligibility criteria and required documents
4. Guide users through the application process
5. Provide information in simple, accessible language suitable for all literacy levels

Always be accurate about scheme details and provide official links when available.`;

    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-06-01',
        max_tokens: 512,
        system: systemPrompt,
        messages: messages
      })
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return responseBody.content[0].text;
  } catch (error) {
    console.error('Error invoking Bedrock in chat:', error);
    throw new Error('Failed to generate response from Bedrock');
  }
}

/**
 * Fallback to Gemini for web search grounding
 * (Implementation would call Gemini API via HTTP)
 */
async function invokeGeminiWithSearch(userMessage: string): Promise<string> {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY || ''
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userMessage
              }
            ]
          }
        ],
        tools: [
          {
            googleSearch: {}
          }
        ]
      })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';
    return text;
  } catch (error) {
    console.error('Error invoking Gemini:', error);
    throw new Error('Failed to generate response from Gemini');
  }
}

/**
 * Main chat handler supporting dual-AI processing
 */
export async function handler(event: any) {
  try {
    const { 
      userId, 
      message, 
      conversationId = `conv-${userId}-${Date.now()}`, 
      useGemini = false,
      userContext 
    } = JSON.parse(event.body || '{}') as ChatRequest;

    if (!userId || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId or message in request body' })
      };
    }

    // Save user message to history
    await saveChatMessage(conversationId, userId, 'user', message);

    // Fetch conversation history for context
    const history = await getChatHistory(conversationId, 5);

    // Process with primary AI (Bedrock) or fallback to Gemini
    let response: string;
    let aiModel: string;

    try {
      response = await invokeBedrockWithContext(message, history, userContext);
      aiModel = 'Bedrock Claude 3.5 Sonnet';
    } catch (bedrockError) {
      console.warn('Bedrock failed, falling back to Gemini:', bedrockError);
      
      if (useGemini) {
        try {
          response = await invokeGeminiWithSearch(message);
          aiModel = 'Gemini 3 Flash (with Search Grounding)';
        } catch (geminiError) {
          console.error('Both Bedrock and Gemini failed:', geminiError);
          response = 'Sorry, I was unable to process your request at this moment. Please try again later.';
          aiModel = 'Error';
        }
      } else {
        throw bedrockError;
      }
    }

    // Save assistant response to history
    await saveChatMessage(conversationId, userId, 'assistant', response);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        conversationId,
        message: response,
        aiModel,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error in chat-handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Chat processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}

/**
 * Handler to retrieve chat history for a conversation
 */
export async function getHistoryHandler(event: any) {
  try {
    const { conversationId, limit = 20 } = event.queryStringParameters || {};

    if (!conversationId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing conversationId parameter' })
      };
    }

    const history = await getChatHistory(conversationId, Math.min(limit, 50));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        conversationId,
        messages: history.reverse(),
        count: history.length,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error in getHistory handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to retrieve chat history',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}
