#!/bin/bash
# AWS Amplify Deployment Script for YojanaMitra AI
# Run this script to deploy the application to AWS

set -e

echo "🚀 YojanaMitra AI - AWS Deployment Script"
echo "=========================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo "⚠️  Amplify CLI not found. Installing..."
    npm install -g @aws-amplify/cli
fi

echo "✅ Prerequisites check passed"
echo ""

# Step 1: Initialize Amplify (if not already done)
if [ ! -d "amplify" ]; then
    echo "📦 Step 1: Initializing Amplify project..."
    amplify init --yes
else
    echo "✅ Amplify project already initialized"
fi

echo ""

# Step 2: Create environment configuration
echo "📋 Step 2: Setting up AWS resources..."
echo ""
echo "Please provide your AWS credentials:"
echo "  - AWS Region: ap-south-1 (India - Mumbai)"
echo "  - Project Name: yojanamitra"
echo ""

# Set environment variables from .env.example if present
if [ -f ".env.example" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Edit .env with your actual AWS credentials and endpoints"
fi

echo ""

# Step 3: Configure Cognito
echo "🔐 Step 3: Configuring Amazon Cognito..."
read -p "Do you want to set up Cognito authentication? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    amplify add auth --yes
fi

echo ""

# Step 4: Configure API (Lambda + DynamoDB)
echo "🔌 Step 4: Configuring API Gateway + Lambda..."
read -p "Do you want to set up API endpoints? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    amplify add api --yes
fi

echo ""

# Step 5: Configure Storage (S3)
echo "💾 Step 5: Configuring Amazon S3 for document storage..."
read -p "Do you want to set up S3 storage? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    amplify add storage --yes
fi

echo ""

# Step 6: Push all changes to AWS
echo "🌍 Step 6: Deploying to AWS..."
echo "This may take 5-10 minutes..."
amplify push

echo ""

# Step 7: Build frontend
echo "🏗️  Step 7: Building frontend..."
npm run build

echo ""

# Step 8: Deploy to Amplify Hosting
echo "📡 Step 8: Deploying to Amplify Hosting..."
amplify publish

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🎉 Your YojanaMitra AI application is now live!"
echo ""
echo "Next steps:"
echo "1. Go to Amplify console: https://console.aws.amazon.com/amplify"
echo "2. Monitor deploy logs"
echo "3. Test the application:"
echo "   - Sign up with Cognito"
echo "   - Create your profile"
echo "   - See AI-powered scheme recommendations"
echo ""
echo "For production:"
echo "1. Configure custom domain"
echo "2. Enable CloudFront caching"
echo "3. Set up CI/CD with GitHub integration"
echo "4. Configure DynamoDB backups"
echo "5. Enable CloudTrail for audit logging"
echo ""
