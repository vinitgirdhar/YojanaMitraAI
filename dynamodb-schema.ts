/**
 * DynamoDB Schema Definition for YojanaMitra
 * 
 * This file defines the tables and indexes required for the application.
 * To deploy these tables to AWS, use AWS CDK or CloudFormation.
 * 
 * For quick setup, use AWS CLI:
 * aws dynamodb create-table --cli-input-json file://dynamodb-schema.json
 */

export const DynamoDBSchema = {
  // ================================================================
  // Table 1: Users (User Profiles & Authentication)
  // ================================================================
  Users: {
    TableName: 'yojanamitra-users',
    BillingMode: 'PAY_PER_REQUEST', // Auto-scaling for variable load
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'N' }
    ],
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' } // Partition key
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'email-index',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' }
      },
      {
        IndexName: 'createdAt-index',
        KeySchema: [
          { AttributeName: 'createdAt', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    StreamSpecification: {
      StreamViewType: 'NEW_AND_OLD_IMAGES'
    },
    Tags: [
      { Key: 'Environment', Value: 'production' },
      { Key: 'Application', Value: 'YojanaMitra' }
    ]
  },

  // ================================================================
  // Table 2: User Profiles (Extended User Information)
  // ================================================================
  UserProfiles: {
    TableName: 'yojanamitra-user-profiles',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'updatedAt', AttributeType: 'N' }
    ],
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'updatedAt-index',
        KeySchema: [
          { AttributeName: 'updatedAt', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    TimeToLiveSpecification: {
      Enabled: true,
      AttributeName: 'expiryTime' // For auto-delete old profiles
    }
  },

  // ================================================================
  // Table 3: Schemes (Government Welfare Schemes Database)
  // ================================================================
  Schemes: {
    TableName: 'yojanamitra-schemes',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'schemeId', AttributeType: 'S' },
      { AttributeName: 'category', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'N' }
    ],
    KeySchema: [
      { AttributeName: 'schemeId', KeyType: 'HASH' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'category-index',
        KeySchema: [
          { AttributeName: 'category', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    StreamSpecification: {
      StreamViewType: 'NEW_AND_OLD_IMAGES'
    },
    Tags: [
      { Key: 'DataSource', Value: 'Government' },
      { Key: 'Sensitivity', Value: 'Public' }
    ]
  },

  // ================================================================
  // Table 4: User-Scheme Eligibility (Computed Recommendations)
  // ================================================================
  UserSchemeEligibility: {
    TableName: 'yojanamitra-eligibility',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'schemeId', AttributeType: 'S' },
      { AttributeName: 'scoreTimestamp', AttributeType: 'N' }
    ],
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },
      { AttributeName: 'schemeId', KeyType: 'RANGE' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'schemeId-score-index',
        KeySchema: [
          { AttributeName: 'schemeId', KeyType: 'HASH' },
          { AttributeName: 'scoreTimestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    TimeToLiveSpecification: {
      Enabled: true,
      AttributeName: 'expiryTime' // Eligibility scores expire after 30 days
    }
  },

  // ================================================================
  // Table 5: Chat History (Conversation Logs)
  // ================================================================
  ChatHistory: {
    TableName: 'yojanamitra-chat-history',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'conversationId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'N' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'conversationId', KeyType: 'HASH' },
      { AttributeName: 'timestamp', KeyType: 'RANGE' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-timestamp-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    TimeToLiveSpecification: {
      Enabled: true,
      AttributeName: 'expiryTime' // Chat history expires after 90 days
    },
    StreamSpecification: {
      StreamViewType: 'NEW_AND_OLD_IMAGES'
    }
  },

  // ================================================================
  // Table 6: Documents (User Document Uploads & Verification)
  // ================================================================
  Documents: {
    TableName: 'yojanamitra-documents',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'documentId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'documentType', AttributeType: 'S' },
      { AttributeName: 'uploadedAt', AttributeType: 'N' }
    ],
    KeySchema: [
      { AttributeName: 'documentId', KeyType: 'HASH' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-type-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'documentType', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      },
      {
        IndexName: 'userId-uploadedAt-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'uploadedAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    TimeToLiveSpecification: {
      Enabled: true,
      AttributeName: 'expiryTime'
    }
  },

  // ================================================================
  // Table 7: Recommendations (AI Model Generated Recommendations)
  // ================================================================
  Recommendations: {
    TableName: 'yojanamitra-recommendations',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'generatedAt', AttributeType: 'N' }
    ],
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },
      { AttributeName: 'generatedAt', KeyType: 'RANGE' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'generatedAt-index',
        KeySchema: [
          { AttributeName: 'generatedAt', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    TimeToLiveSpecification: {
      Enabled: true,
      AttributeName: 'expiryTime' // Recommendations expire after 60 days
    }
  },

  // ================================================================
  // Table 8: AI Model Metrics (Bedrock vs Gemini Performance Tracking)
  // ================================================================
  AIModelMetrics: {
    TableName: 'yojanamitra-ai-metrics',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'metricId', AttributeType: 'S' },
      { AttributeName: 'model', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'N' }
    ],
    KeySchema: [
      { AttributeName: 'metricId', KeyType: 'HASH' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'model-timestamp-index',
        KeySchema: [
          { AttributeName: 'model', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    TimeToLiveSpecification: {
      Enabled: true,
      AttributeName: 'expiryTime' // Keep metrics for 6 months
    }
  }
};

/**
 * Example Item Structures
 */

export const ExampleItems = {
  // User Profile Example
  UserProfile: {
    userId: 'user-123456',
    email: 'rajesh@example.com',
    name: 'Rajesh Kumar',
    age: 35,
    gender: 'Male',
    state: 'Maharashtra',
    category: 'Farmer',
    annualIncome: 250000,
    hasAadhaar: true,
    hasPan: true,
    hasRationCard: true,
    hasIncomeCertificate: false,
    createdAt: 1704067200000,
    updatedAt: 1704153600000,
    expiryTime: 1766275200 // Unix timestamp for TTL
  },

  // Scheme Example
  Scheme: {
    schemeId: 'pm-kisan-samman',
    name: 'PM-KISAN Samman Nidhi',
    category: 'Farmer',
    benefits: '₹6,000 per year in 3 instalments',
    requiredDocs: ['Aadhaar', 'Land Records'],
    eligibility: 'High',
    description: 'Direct income support for farmers holding cultivable land',
    url: 'https://pmkisan.gov.in/',
    createdAt: 1700000000000,
    updatedAt: 1704153600000
  },

  // Chat Message Example
  ChatMessage: {
    conversationId: 'conv-user-123456-1704153600000',
    timestamp: 1704153600000,
    userId: 'user-123456',
    role: 'user',
    text: 'What schemes am I eligible for as a farmer in Maharashtra?',
    sortKey: '1704153600000-0.123456',
    expiryTime: 1711929600 // 90 days from now
  },

  // Recommendation Example
  Recommendation: {
    userId: 'user-123456',
    generatedAt: 1704153600000,
    aiModel: 'Bedrock Claude 3.5 Sonnet',
    recommendations: [
      {
        schemeId: 'pm-kisan-samman',
        schemeName: 'PM-KISAN Samman Nidhi',
        score: 95,
        explanation: 'High eligibility - you own agricultural land',
        reasoning: 'Your profile shows Farmer category, land ownership, and Aadhaar'
      }
    ],
    expiryTime: 1706745600 // 60 days from now
  }
};

/**
 * IndexOptions for Query Efficiency
 * 
 * USER PROFILE QUERIES:
 * - PK: userId (direct lookup)
 * - GSI: email-index (find user by email)
 * - GSI: createdAt-index (analytics on signup trends)
 * 
 * SCHEME QUERIES:
 * - PK: schemeId (direct scheme details)
 * - GSI: category-index (find all schemes for a category)
 * 
 * ELIGIBILITY QUERIES:
 * - PK: userId + schemeId (user's eligibility for specific scheme)
 * - GSI: schemeId-score-index (find top eligible users for a scheme)
 * 
 * CHAT QUERIES:
 * - PK: conversationId + timestamp (chat history for conversation)
 * - GSI: userId-timestamp-index (all conversations for a user)
 * 
 * DOCUMENT QUERIES:
 * - PK: documentId (specific document)
 * - GSI: userId-type-index (user's documents by type)
 * - GSI: userId-uploadedAt-index (user's documents by date)
 */
