#!/bin/bash

echo "============================================"
echo "  L2H Blog Backend - Vercel Deployment"
echo "============================================"
echo ""

echo "Step 1: Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed! Please fix TypeScript errors first."
    exit 1
fi
echo "✅ Build successful!"
echo ""

echo "Step 2: Checking for Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi
echo "✅ Vercel CLI is ready!"
echo ""

echo "Step 3: Deploying to Vercel..."
echo ""
echo "Choose deployment type:"
echo "1. Preview deployment (test)"
echo "2. Production deployment"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" == "1" ]; then
    echo "Deploying to preview..."
    vercel
elif [ "$choice" == "2" ]; then
    echo "Deploying to production..."
    vercel --prod
else
    echo "Invalid choice!"
    exit 1
fi

echo ""
echo "============================================"
echo "  Deployment Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Configure environment variables (see env.vercel.example)"
echo "3. Setup Vercel Blob Storage"
echo "4. Update MongoDB Atlas Network Access (allow 0.0.0.0/0)"
echo "5. Test your API endpoints"
echo ""
echo "Read VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions."
echo ""

