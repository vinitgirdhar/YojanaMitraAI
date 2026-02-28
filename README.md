# YojanaMitra - AI-Powered Government Scheme Assistant

YojanaMitra is an intelligent platform that helps Indian citizens discover and access government welfare schemes using AI-powered recommendations. The app leverages AWS Bedrock and Google Gemini to provide personalized scheme recommendations based on user profiles.

## 🎯 Project Overview

YojanaMitra is designed to bridge the digital divide by providing an accessible, voice-enabled interface for citizens to:
- Discover government welfare schemes relevant to their profile
- Get personalized AI recommendations
- Upload and manage documents
- Access scheme details and application procedures
- Communicate via voice and text chat

## ✨ Key Features

- **AI-Powered Recommendations**: Uses AWS Bedrock (Claude 3.5 Sonnet) for intelligent scheme matching
- **Multi-Model Support**: Bedrock (primary) with Gemini (fallback) AI backend
- **Voice Assistant**: Voice input for accessibility
- **User Authentication**: AWS Cognito integration for secure user management
- **Document Management**: S3-based document storage and verification
- **Real-time Chat**: Conversation logging with DynamoDB
- **Responsive UI**: React + TypeScript frontend with Vite
- **Mobile-Friendly**: Designed for accessibility across devices

## 🏗️ Architecture

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** (via Lucide icons)
- **React Router** for navigation

### Backend Services (AWS)
- **Cognito**: User authentication and identity management
- **API Gateway**: RESTful API endpoints
- **Lambda Functions**: 
  - `bedrock-recommender`: Scheme recommendations via Bedrock AI
  - `chat-handler`: Chat API endpoints
  - `transcribe-handler`: Voice transcription processing
- **DynamoDB**: NoSQL database for users, profiles, schemes, chat history
- **S3**: Document and audio storage
- **Bedrock**: AWS AI service for Claude model
- **Transcribe**: Voice-to-text service
- **CloudWatch**: Logging and monitoring

### AI Services
- **AWS Bedrock**: 
  - Primary: `anthropic.claude-3-5-sonnet-20241022-v2:0`
  - Fallback: `meta.llama3-1-8b-instruct-v1:0`
- **Google Gemini**: Fallback AI service

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **AWS Account**: With appropriate permissions
- **AWS CLI**: Configured with credentials
- **Git**: For version control

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd YojanaMitraAI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create `.env.local` in the project root:
```bash
cp .env.example .env.local
```

Update `.env.local` with your AWS credentials:
```env
# AWS Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key

# Cognito
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_USER_POOL_CLIENT_ID=your_client_id
VITE_COGNITO_USER_POOL_CLIENT_SECRET=your_client_secret
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# API Gateway
VITE_API_GATEWAY_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod

# Gemini
VITE_GEMINI_API_KEY=your_gemini_api_key

# S3
VITE_S3_BUCKET=yojanamitra-documents
VITE_TRANSCRIBE_OUTPUT_BUCKET=yojanamitra-audio

# Other
VITE_DEV_SERVER_PORT=5173
VITE_ENVIRONMENT=development
```

### 4. Run Development Server
```bash
npm run dev
```

Access the app at `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
YojanaMitraAI/
├── components/
│   ├── VoiceAssistant.tsx          # Voice input component
│   └── ...
├── pages/
│   ├── Landing.tsx                 # Landing page
│   ├── Dashboard.tsx                # Main dashboard
│   ├── Schemes.tsx                  # Schemes listing
│   ├── SchemeDetail.tsx             # Scheme details page
│   ├── ProfileSetup.tsx             # User profile setup
│   ├── Documentation.tsx            # Documentation page
│   └── Redirect.tsx                 # Redirect handler
├── services/
│   ├── authService.ts               # Cognito authentication
│   ├── bedrockService.ts            # Bedrock AI service
│   └── geminiService.ts             # Gemini fallback service
├── lambda/
│   ├── bedrock-recommender.ts       # Scheme recommendations
│   ├── chat-handler.ts              # Chat API handler
│   └── transcribe-handler.ts        # Voice transcription
├── types.ts                         # TypeScript interfaces
├── constants.tsx                    # App constants
├── aws-config.ts                    # AWS configuration
├── dynamodb-schema.ts               # DynamoDB table definitions
├── App.tsx                          # Main app component
├── index.tsx                        # React entry point
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies
└── .env.example                     # Environment variables template
```

## 🗄️ Database Schema

### DynamoDB Tables

1. **yojanamitra-users**: User authentication and basic info
2. **yojanamitra-user-profiles**: Extended user profile data
3. **yojanamitra-schemes**: Government schemes database
4. **yojanamitra-eligibility**: User-scheme eligibility scores
5. **yojanamitra-chat-history**: Conversation logs
6. **yojanamitra-documents**: User document uploads
7. **yojanamitra-recommendations**: AI recommendations
8. **yojanamitra-ai-metrics**: Model performance tracking

See [dynamodb-schema.ts](./dynamodb-schema.ts) for detailed schema definitions.

## 🔑 AWS Setup

### Create DynamoDB Tables
```bash
# Use AWS CLI to create tables
aws dynamodb create-table --cli-input-json file://schemas/users.json --region us-east-1
# ... repeat for other tables
```

### Create S3 Buckets
```bash
aws s3 mb s3://yojanamitra-documents --region us-east-1
aws s3 mb s3://yojanamitra-audio --region us-east-1
```

### Enable Bedrock Models
1. Go to AWS Console > Bedrock > Model Access
2. Request access for:
   - Claude 3.5 Sonnet
   - Llama 3.1 8B

### Configure Cognito
- Identity Pool: `us-east-1:06d7a558-0890-4668-9920-9041f4d88ee1`
- User Pool: `us-east-1_f67Lk3MVf`
- Client ID: Pre-configured in `.env.local`

## 📊 API Endpoints

### Schemes
- `POST /api/schemes/recommend` - Get AI recommendations

### Chat
- `POST /api/chat/message` - Send chat message
- `GET /api/chat/history/{conversationId}` - Get chat history

### Transcribe
- `POST /api/transcribe/upload` - Upload and transcribe audio

### User
- `POST /api/user/profile` - Create/update user profile
- `GET /api/user/profile/{userId}` - Get user profile

## 🔐 Environment Variables

See `.env.example` for all available variables:
- `VITE_AWS_*`: AWS credentials and configuration
- `VITE_COGNITO_*`: Cognito configuration
- `VITE_API_*`: API endpoints
- `VITE_BEDROCK_*`: Bedrock model configuration
- `VITE_GEMINI_*`: Gemini API key
- `VITE_S3_*`: S3 bucket names
- `VITE_ENABLE_*`: Feature flags

## 🧪 Testing

```bash
# Run development server with hot reload
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

## 📦 Dependencies

### Core
- `react`: UI framework
- `react-dom`: React DOM utilities
- `react-router-dom`: Client-side routing

### AWS
- `aws-amplify`: AWS integration
- `@aws-amplify/ui-react`: Amplify UI components
- `@aws-sdk/client-bedrock-runtime`: Bedrock AI
- `@aws-sdk/client-transcribe`: Speech-to-text
- `@aws-sdk/client-dynamodb`: Database operations
- `@aws-sdk/client-s3`: File storage

### AI & Services
- `@google/genai`: Google Gemini AI

### UI
- `lucide-react`: Icon library
- `vite`: Build tool

## 📝 Development Notes

### Feature Flags
Control features via environment variables:
- `VITE_USE_BEDROCK_PRIMARY`: Enable Bedrock AI (default: true)
- `VITE_USE_GEMINI_FALLBACK`: Enable Gemini fallback (default: true)
- `VITE_ENABLE_VOICE_INPUT`: Enable voice features (default: true)
- `VITE_ENABLE_DOCUMENT_UPLOAD`: Enable document uploads (default: true)

### Adding New Schemes
Update the `yojanamitra-schemes` DynamoDB table with scheme data including:
- Scheme ID and name
- Category (Agriculture, Healthcare, Education, etc.)
- Benefits description
- Eligibility criteria
- Required documents
- Official URL

## 🚢 Deployment

### To AWS (via Amplify)
```bash
amplify init
amplify push
```

### To Other Platforms
- Build: `npm run build`
- Output: `dist/` directory
- Deploy `dist/` to your hosting service

## 📄 Documentation

- [AWS Implementation Checklist](./AWS_IMPLEMENTATION_CHECKLIST.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Deployment Guide](./DEPLOY.sh)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Submit a pull request

## 📜 License

This project is built for the "AI for Bharat" initiative.

## 📞 Support

For issues or questions:
- Check existing documentation
- Review [AWS_IMPLEMENTATION_CHECKLIST.md](./AWS_IMPLEMENTATION_CHECKLIST.md)
- Check [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🔗 Useful Links

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

---

**Last Updated**: March 2026  
**Version**: 1.0.0  
**Status**: Active Development
