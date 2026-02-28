import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { UserProfile, Scheme } from '../types';

const bedrockClient = new BedrockRuntimeClient({ region: 'ap-south-1' });
const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'ap-south-1' }));

const SCHEMES_TABLE = 'yojanamitra-schemes';
const MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

interface RecommendationRequest {
  userProfile: UserProfile;
  topN?: number;
}

interface SchemeRecommendation extends Scheme {
  score: number;
  explanation: string;
  reasoning: string;
}

/**
 * Retrieves all schemes from DynamoDB with RAG context
 */
async function getSchemeDatabase(): Promise<Scheme[]> {
  try {
    const result = await dynamoDb.send(
      new ScanCommand({
        TableName: SCHEMES_TABLE,
        ProjectionExpression: 'id, #name, category, benefits, requiredDocs, eligibility, description, #url',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#url': 'url'
        }
      })
    );
    return (result.Items as Scheme[]) || [];
  } catch (error) {
    console.error('Error fetching schemes from DynamoDB:', error);
    return [];
  }
}

/**
 * Invokes AWS Bedrock with Claude model for scheme recommendations
 */
async function invokeBedrockModel(prompt: string): Promise<string> {
  try {
    const message = {
      role: 'user',
      content: prompt
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-06-01',
        max_tokens: 1024,
        messages: [message]
      })
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return responseBody.content[0].text;
  } catch (error) {
    console.error('Error invoking Bedrock model:', error);
    throw new Error('Failed to invoke Bedrock model');
  }
}

/**
 * Generates a RAG-enhanced prompt with scheme context
 */
function generateRAGPrompt(userProfile: UserProfile, schemes: Scheme[]): string {
  const schemeContext = schemes
    .map(s => `- ${s.name} (ID: ${s.id}): For category "${s.category}". Benefits: ${s.benefits}. Required docs: ${s.requiredDocs.join(', ')}`)
    .join('\n');

  return `You are an expert advisor on Indian government welfare schemes. Based on the user profile and available schemes, provide personalized recommendations.

USER PROFILE:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- State: ${userProfile.state}
- Category: ${userProfile.category}
- Annual Income: ₹${userProfile.annualIncome}
- Documents Available: ${[
    userProfile.hasAadhaar && 'Aadhaar',
    userProfile.hasPan && 'PAN',
    userProfile.hasRationCard && 'Ration Card',
    userProfile.hasIncomeCertificate && 'Income Certificate'
  ].filter(Boolean).join(', ')}

AVAILABLE SCHEMES:
${schemeContext}

TASK:
Analyze the user profile and rank the top 5 most eligible schemes. For each scheme, provide:
1. Scheme ID
2. Eligibility Score (0-100)
3. Brief explanation of why this scheme is suitable
4. Any eligibility gaps the user needs to address

Format your response as a JSON array with this structure:
[
  {
    "schemeId": "string",
    "schemeName": "string",
    "score": number,
    "explanation": "string",
    "reasoning": "string"
  }
]

IMPORTANT: Return ONLY valid JSON, no additional text.`;
}

/**
 * Handler function for API Gateway / Lambda invocation
 */
export async function handler(event: any) {
  try {
    const { userProfile, topN = 5 } = JSON.parse(event.body || '{}') as RecommendationRequest;

    if (!userProfile) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userProfile in request body' })
      };
    }

    // Fetch scheme database for RAG
    const schemes = await getSchemeDatabase();
    if (schemes.length === 0) {
      // Return error or fallback to hardcoded schemes
      console.warn('No schemes found in DynamoDB');
    }

    // Generate RAG-enhanced prompt
    const prompt = generateRAGPrompt(userProfile, schemes);

    // Invoke Bedrock model
    const bedrockResponse = await invokeBedrockModel(prompt);

    // Parse Bedrock response
    let recommendations: SchemeRecommendation[] = [];
    try {
      recommendations = JSON.parse(bedrockResponse).slice(0, topN);
    } catch (parseError) {
      console.error('Error parsing Bedrock response:', parseError);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to parse Bedrock response',
          rawResponse: bedrockResponse 
        })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        recommendations,
        aiModel: 'Bedrock Claude 3.5 Sonnet',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error in bedrock-recommender handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}
