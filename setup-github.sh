#!/bin/bash

# Ayekta EMR - GitHub Setup Script
# This script helps initialize git and set up GitHub deployment

echo "========================================="
echo "Ayekta EMR - GitHub Deployment Setup"
echo "========================================="
echo ""

# Check if git is initialized
if [ -d .git ]; then
    echo "✓ Git repository already initialized"
else
    echo "Initializing git repository..."
    git init
    echo "✓ Git initialized"
fi

echo ""
echo "Please enter your GitHub username:"
read github_username

if [ -z "$github_username" ]; then
    echo "❌ Error: GitHub username cannot be empty"
    exit 1
fi

echo ""
echo "Updating package.json with your GitHub username..."

# Update package.json (works on both macOS and Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/YOUR_GITHUB_USERNAME/$github_username/g" package.json
else
    # Linux
    sed -i "s/YOUR_GITHUB_USERNAME/$github_username/g" package.json
fi

echo "✓ package.json updated"

echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Your app will be available at:"
echo "https://$github_username.github.io/ayekta-emr/"
echo ""
echo "Next steps:"
echo "1. Create a GitHub repository named 'ayekta-emr'"
echo "2. Run these commands:"
echo ""
echo "   git add ."
echo "   git commit -m \"Initial commit: Ayekta EMR v6react\""
echo "   git remote add origin https://github.com/$github_username/ayekta-emr.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo "   npm run deploy"
echo ""
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
