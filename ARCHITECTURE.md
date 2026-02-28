# YojanaMitra AI - AWS Architecture & Implementation Guide

## Executive Summary

**YojanaMitra** is an AI-powered platform that helps Indian citizens discover government welfare schemes (yojanas) they're eligible for. This document explains how AWS Generative AI services and infrastructure deliver the core value propositions.

### Key AWS Technologies Integrated
- **AWS Bedrock** - Multi-model generative AI (Claude 3.5 Sonnet, Llama)
- **Amazon Cognito** - Secure authentication for Indian citizens
- **DynamoDB** - Real-time scheme database and user profiles
- **AWS Transcribe** - Voice-to-text for accessibility
- **AWS Lambda** - Serverless API backend
- **Amazon S3** - Document storage and processing
- **AWS API Gateway** - Secure, rate-limited API access
- **AWS Amplify** - Managed full-stack deployment with CI/CD

---

## Why AI is Required

### Problem
India has **100+ government schemes** providing benefits for different citizen categories (farmers, students, women, seniors, entrepreneurs, unemployed). Citizens manually:
1. Visit multiple government websites
2. Read complex eligibility criteria
3. Navigate language barriers (non-English speakers)
4. Fail to discover schemes they qualify for

**Result**: Billions in unclaimed subsidies, benefits not reaching intended citizens.

### AI Solution

#### 1. **Personalized Eligibility Matching** (Bedrock)
- **What**: User profile + scheme database → AI ranks applicable schemes in seconds
- **How AI helps**: Claude model analyzes multi-dimensional eligibility criteria (income, location, category, documents) across 100+ schemes simultaneously
- **Value**: Citizens see top 5-10 relevant schemes without manual checking
- **Example**:
  ```
  User: "I'm a farmer in Maharashtra earning ₹200,000/year with Aadhaar & PAN"
  Bedrock: "You're eligible for: PM-KISAN (95%), PMFBY (88%), NRLM (80%)..."
  ```

#### 2. **Conversational Accessibility** (Bedrock + Transcribe)
- **Problem**: 33% of Indians speak limited English; low digital literacy
- **AI Solution**:
  - **AWS Transcribe**: Voice → Text (supports Hindi, Marathi, regional languages)
  - **Bedrock**: Responds in simple, accessible language via Claude's instruction-tuning
  - **Future**: Polly for text-to-speech output
- **Value**: Non-literate citizens can query via voice in mother tongue

#### 3. **Real-Time Scheme Updates & Web Grounding** (Gemini Search)
- **Problem**: Scheme rules change (income thresholds, deadlines, benefits update)
- **AI Solution**: Dual-AI architecture where Gemini's web search tool finds latest announcements/updates
- **During recommendation**: Gemini searches web for "PM-KISAN latest updates 2024" → grounds Bedrock response with current facts
- **Value**: Recommendations never become stale; users get accurate current information

#### 4. **Scalability** (Bedrock + DynamoDB)
- **Without AI**: Hard-coding 100+ schemes in frontend code is unmaintainable
- **With Bedrock + RAG**: Schemes stored in DynamoDB; Bedrock retrieves relevant docs before responding
- **Value**: System scales to 1000+ schemes without code changes

#### 5. **Intelligent Fallback & Comparison** (Dual-AI Strategy)
- **Bedrock primary**: Faster, cost-effective, consistent responses
- **Gemini fallback**: If Bedrock unavailable, web search provides grounding
- **A/B Testing**: Compare which model gives better recommendations
- **Value**: Highest availability and quality assurance

---

## AWS Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (React + TypeScript)                 │
│  - VoiceAssistant: Bedrock chat + Transcribe voice input             │
│  - Dashboard: Bedrock scheme recommendations                         │
│  - Authentication: Cognito login                                     │
│  - Hosted on AWS Amplify                                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼─────┐      ┌──────▼──────┐    ┌─────▼────┐
    │ Cognito  │      │ API Gateway│    │Transcribe│
    │          │      │ + Lambda   │    │          │
    │- Sign up │      │            │    │-Audio→   │
    │- Sign in │      │- Auth      │    │ Text     │
    │- MFA     │      │- Chat/Chat │    │(WebRTC)  │
    │          │      │- Transcribe│    │          │
    └──────────┘      └──────┬─────┘    └──────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼──────────┐   ┌────▼──────┐   ┌─────▼────────┐
    │   Bedrock     │   │ DynamoDB  │   │ S3 + Textract│
    │               │   │           │   │              │
    │- Claude 3.5   │   │- Users    │   │- Document    │
    │  Sonnet       │   │- Schemes  │   │  Storage     │
    │- Llama 2      │   │- Chat     │   │- OCR         │
    │- RAG          │   │  History  │   │  (future)    │
    │- Reasoning    │   │- Profiles │   │              │
    └────────────────┘   └───────────┘   └──────────────┘
                             │
    ┌────────────────────────┴────────────────────────┐
    │                                                  │
┌───▼──────┐                                     ┌─────▼────┐
│ Gemini   │                                     │CloudWatch│
│(Fallback)│                                     │+ Logs    │
│          │                                     │          │
│- Web     │                                     │-Monitor  │
│  Search  │                                     │-Metrics  │
│- Ground  │                                     │-Alerts   │
│  Bedrock │                                     │          │
└──────────┘                                     └──────────┘
```

---

## How AWS Services Add Value

### 1. **AWS Bedrock** - Multi-Model AI Foundation
**Why it's essential:**
- Removes vendor lock-in (Google Gemini only)
- Provides multiple models (Claude, Llama) for comparison/fallback
- RAG (Retrieval-Augmented Generation) directly grounds responses in DynamoDB scheme data
- Cost-effective: Pay per token, not per request

**User Value:**
- Faster response time than external APIs
- More accurate recommendations from larger context window (200K tokens)
- Compliance-ready: Data doesn't leave AWS infrastructure
- Better reasoning for complex multi-criteria eligibility

**Implementation:**
- Lambda function `bedrock-recommender` calls Claude 3.5 Sonnet
- Prompt: "Given user [profile], rank schemes in DynamoDB [database context]"
- Returns JSON with scheme_id, eligibility score, reasoning
- Stored in DynamoDB for audit trail

---

### 2. **Amazon Cognito** - Secure Citizen Identity
**Why it's essential:**
- Manages identity for potentially 1B+ Indian citizens
- Scales horizontally (no database bottleneck)
- MFA support for security
- Compliance-ready for PII (email, phone)
- Integration path for Aadhaar federated identity (Phase 2)

**User Value:**
- Single secure login across all devices
- Password reset via email/SMS
- Sessions managed securely (no localStorage tokens)
- Audit trail: Every login/action logged for compliance

**Implementation:**
- User pool in `ap-south-1` (India region)
- Email verification on signup
- Custom login page in Landing.tsx
- JWT tokens stored in sessionStorage (not localStorage)
- Automatic token refresh

**Future Phase 2:**
- Register UIDAI (Aadhaar Authority) as federated identity provider
- Citizens login with Aadhaar OTP instead of password
- Direct Aadhaar verification without uploading documents

---

### 3. **DynamoDB** - Real-Time Scheme Database
**Why it's essential:**
- Low-latency (<10ms) queries for scheme matching
- Infinitely scalable: On-demand billing
- Supports complex relationships (user → schemes → rules → documents)

**User Value:**
- Recommendations generated instantly (not waiting for Bedrock)
- Chat history persists for personalized follow-up conversations
- Eligibility scores cached: "You asked about this scheme before..."

**Tables:**
| Table | Purpose | TTL |
|-------|---------|-----|
| `Users` | Authentication + Profile | Never |
| `Schemes` | All government schemes | Never |
| `UserProfiles` | Extended eligibility data | 90 days |
| `ChatHistory` | Conversation logs | 90 days |
| `Recommendations` | AI-generated rankings | 60 days |
| `Eligibility` | User-scheme compatibility | 30 days |
| `Documents` | Uploaded verification files | Based on status |
| `AIMetrics` | Bedrock vs Gemini comparison | 6 months |

**Example Query Flow:**
```
1. User profile submitted → Stored in DynamoDB Users table
2. "Show eligible schemes" → Lambda queries Schemes + UserProfiles
3. Bedrock receives: User [X] + Schemes [100] → Returns top 5 matches
4. Results stored in Eligibility table + cached in CloudFront
5. Next day, user re-logs in → Cached recommendations shown instantly
```

---

### 4. **AWS Transcribe** - Voice Access for Low-Literacy Citizens
**Why it's essential:**
- 33% of Indians speak limited English
- Rural citizens (60% of population) prefer voice
- Accessibility for visually impaired users

**User Value:**
- Voice input in Hindi, Marathi, Tamil, Telugu, etc.
- Real-time transcription (not async delay)
- Fallback to text if audio fails

**Implementation:**
- VoiceAssistant component: "Record" button captures WebRTC audio stream
- Audio blob → Base64 → Lambda → Transcribe API
- Transcribe returns text → Sent to Bedrock chat
- Response displayed as text (Polly text-to-speech in Phase 2)

**Language Support:**
- Hindi (hi-IN) - Primary
- English (en-IN) - Secondary
- Marathi (mr-IN), Tamil (ta-IN), Telugu (te-IN) - Future

---

### 5. **AWS Lambda** - Serverless AI Backend
**Why it's essential:**
- Scales from 0 to billions of requests automatically
- Stateless: No need to manage servers
- Integrated with other AWS services (Bedrock, Transcribe, DynamoDB)
- Cost: Pay only for execution time

**Functions:**
```
bedrock-recommender (8KB)
  ├─ Input: UserProfile
  ├─ Action: Query Schemes from DynamoDB
  ├─ Action: Call Bedrock Claude 3.5 Sonnet with RAG prompt
  ├─ Action: Cache results in Eligibility table
  └─ Output: Top 5 schemes + scores

transcribe-handler (6KB)
  ├─ Input: Audio blob (base64)
  ├─ Action: Upload to S3
  ├─ Action: Start Transcribe job
  ├─ Action: Pool for completion
  └─ Output: Transcribed text

chat-handler (10KB)
  ├─ Input: User message + conversation context
  ├─ Action: Retrieve chat history from DynamoDB
  ├─ Action: Call Bedrock (primary) or Gemini (fallback)
  ├─ Action: Store message + response in ChatHistory table
  └─ Output: AI response + source model
```

---

### 6. **Amazon S3** - Document Storage & Processing
**Why it's essential:**
- Secure storage for user-uploaded documents (Aadhaar, PAN copies)
- Integration with Textract for OCR (future: automated verification)
- CloudFront CDN for fast global distribution

**User Value:**
- Documents are encrypted at rest + with SSL in transit
- Versioning: Keeps history of document updates
- Lifecycle policies: Auto-delete expired documents after 1 year

**Buckets:**
- `yojanamitra-documents` - User uploads (private)
- `yojanamitra-audio` - Transcribe audio & results (private)
- `yojanamitra-static` - Frontend assets (public, cached by CloudFront)

---

### 7. **API Gateway** - Secure Endpoint Access
**Why it's essential:**
- Single entry point for all backend services
- Rate limiting: Prevents abuse (100 requests/min per user)
- API keys & authorization: Only authenticated users can call Lambda
- Monitoring: Track API usage, errors, latency

**Endpoints:**
```
POST /schemes/recommend
  Response: { recommendations: [...], aiModel: "Bedrock Claude" }

POST /chat/message
  Response: { message: "...", conversationId, aiModel: "..." }

POST /transcribe
  Response: { jobName, status: "QUEUED" }

GET /transcribe/status?jobName=...
  Response: { status: "COMPLETED", transcript: "..." }

GET /chat/history?conversationId=...
  Response: { messages: [...] }
```

---

### 8. **AWS Amplify** - Full-Stack Deployment
**Why it's essential:**
- Manages frontend + backend in single workflow
- Auto-deploys on every GitHub push (CI/CD)
- Built-in SSL, DDoS protection, caching
- Zero-downtime deployments

**Features:**
- Environment variables injected at build time (API_KEY, Model IDs)
- Preview deployments for each PR
- Rollback if deployment fails
- Analytics: Track user engagement

**Deployment Flow:**
```
1. Push changes to GitHub
2. Amplify detects commit
3. Runs: npm install → npm run build
4. Uploads dist/ to S3 + CloudFront
5. Lambda functions updated automatically
6. DynamoDB tables auto-created (IaC)
7. API Gateway routes configured
8. Live in ~2 minutes
```

---

## Why Dual-AI (Bedrock + Gemini)?

### Bedrock (Primary)
✅ Faster (co-located on AWS infrastructure)  
✅ Multi-modal (Claude, Llama, Titan)  
✅ Cost-effective (0.80¢ per 1M input tokens)  
✅ RAG native support  
❌ No web search (data cutoff Sept 2024)

### Gemini (Fallback + Search Grounding)
✅ Real-time web search (latest scheme announcements)  
✅ High-quality reasoning (GPT-4 competitor)  
❌ External API (slight latency)  
❌ Single vendor  
❌ Quota limits (100 req/day free tier)

### Strategy
1. **User asks question** → Route to Bedrock (assume 99% availability)
2. **Bedrock generates response** ← Retrieve scheme context from DynamoDB
3. **If Bedrock fails** → Fallback to Gemini (has web search)
4. **Cache both** → Next similar query uses cached response
5. **A/B test** → Compare Bedrock vs Gemini quality for model improvement

---

## Implementation Checklist

### Phase 1: Backend (Complete as of Feb 2026)
- [x] Amplify initialization & hosting configuration
- [x] Cognito user pool setup (email/phone auth)
- [x] DynamoDB tables created with GSI
- [x] Lambda functions deployed (3 core handlers)
- [x] API Gateway endpoints configured
- [x] Bedrock model access enabled
- [x] Secrets Manager: API keys secured
- [x] CloudWatch monitoring configured

### Phase 2: Frontend Integration
- [ ] Install packages (`npm install` - DONE)
- [ ] Update App.tsx with Amplify config (IN PROGRESS)
- [ ] Implement Cognito login/logout flows
- [ ] Add scheme recommendation UI in Dashboard
- [ ] Integrate Transcribe voice input in VoiceAssistant
- [ ] Add document upload component
- [ ] Testing suite (unit + integration tests)

### Phase 3: Data & Optimization (Weeks 3-4)
- [ ] Seed 100+ real government schemes into DynamoDB
- [ ] Performance tuning: Add CloudFront caching
- [ ] Monitor Bedrock token costs
- [ ] A/B test: Bedrock vs Gemini response quality
- [ ] Set up CI/CD pipeline with GitHub Actions

### Phase 4: Aadhaar Integration (Phase 2)
- [ ] Register UIDAI as Cognito identity provider
- [ ] Implement Aadhaar login flow
- [ ] Verify Aadhaar against government database
- [ ] Auto-populate user profile from Aadhaar
- [ ] Compliance audit (data protection, privacy)

---

## Cost Estimation (Monthly)

| Service | Tier | Estimated Cost |
|---------|------|---|
| **Bedrock Claude 3.5 Sonnet** | 0.80¢/1M input tokens | $50-100 (100M tokens/mo) |
| **Cognito** | 50K MAU free, then variable | $0-20 |
| **DynamoDB** | On-demand | $20-50 |
| **Lambda** | 1M free, $0.20 per 1M | $10-30 |
| **Transcribe** | $0.0004 per second audio | $5-15 (10K min voice) |
| **Amplify Hosting** | Free tier + data transfer | $10-20 |
| **S3** | $0.023/GB storage | $5-10 |
| **API Gateway** | $3.50 per 1M API calls | $10-20 |
| **Total Estimate** | | **$110-265/month** |

💡 **Optimizations**: DynamoDB caching, Lambda reserved concurrency, CloudFront edge caching can reduce costs 40%.

---

## Testing & Validation

### Unit Tests
```bash
npm test
# Tests for:
# - Bedrock prompt engineering
# - DynamoDB query performance
# - Cognito token validation
# - Transcribe audio processing
```

### Integration Tests
```bash
npm run test:integration
# End-to-end flows:
# 1. User signs up via Cognito
# 2. User submits profile
# 3. Lambda queries Bedrock + DynamoDB
# 4. Recommendations appear in Dashboard
# 5. Chat with voice input triggers Transcribe + Bedrock
```

### Load Testing
```bash
npx artillery run load-test.yml
# Simulates 100 concurrent users
# Verifies Lambda auto-scaling
# Monitors Bedrock token limits
```

---

## Security & Compliance

### Data Protection
- **Encryption at rest**: DynamoDB with AWS KMS
- **Encryption in transit**: TLS 1.2+ for all APIs
- **PII handling**: Cognito manages passwords, documents in S3 encrypted
- **DLP**: Data loss prevention via S3 bucket policies

### Compliance
- **GDPR**: Right to be forgotten (delete DynamoDB records)
- **CCPA**: Data export support
- **India data localization**: All data in ap-south-1 region
- **Audit trail**: CloudTrail logs all API calls

### Access Control
- **IAM roles**: Lambda service roles, Cognito identity providers
- **API authentication**: JWT tokens from Cognito required
- **Rate limiting**: API Gateway throttling
- **VPC (future)**: Keep databases private, access via Lambda only

---

## Monitoring & Observability

### CloudWatch Dashboards
```
Bedrock Metrics:
- Tokens generated per day
- API latency (p50, p99)
- Cost tracking

DynamoDB Metrics:
- Read/write capacity consumed
- Query latency
- Hot partitions

Lambda Metrics:
- Invocations per minute
- Errors
- Duration (cold start vs warm)
```

### Alerts
- Bedrock token quota > 80% → Auto-scale
- API error rate > 0.1% → PagerDuty alert
- DynamoDB throttled → Auto-provision

---

## Next Steps

1. **Deploy MVP**:
   ```bash
   npm run build
   amplify push
   ```

2. **Test Bedrock integration**:
   - Try Dashboard → Recommendations
   - Check CloudWatch logs for Bedrock calls

3. **Seed schemes database**:
   - Run Lambda to populate 50+ Indian government schemes

4. **Gather user feedback**:
   - Test with target users (farmers, students)
   - Measure recommendation accuracy

5. **Phase 2**: Aadhaar support, text-to-speech, document OCR

---

## Troubleshooting Common Issues

### "AWS SDK not initialized" error
→ Check `amplify-config.ts` has Cognito user pool ID

### Bedrock returns "Rate limit exceeded"
→ Increase Lambda timeout, add caching for popular queries

### Lambda timeout calling Bedrock
→ Increase Lambda timeout from 30s to 60s

### DynamoDB query slow
→ Add GSI for common query patterns (e.g., category-based filtering)

### Transcribe job never completes
→ Check S3 bucket permissions for audio files, check language code

---

## References

- [AWS Bedrock Docs](https://docs.aws.amazon.com/bedrock/)
- [Cognito Aadhaar Integration](https://docs.aws.amazon.com/cognito/latest/developerguide/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/)
- [AWS Amplify React Guide](https://docs.amplify.aws/react)

---

**Document Version**: 1.0  
**Date**: February 2026  
**Maintained by**: YojanaMitra AI Team
