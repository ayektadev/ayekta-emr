# GitHub Pages Deployment Guide

This guide will help you deploy the Ayekta EMR application to GitHub Pages for offline demo access, including on mobile phones.

## Prerequisites

1. A GitHub account
2. Git installed on your computer
3. Node.js and npm installed

## Step-by-Step Deployment Instructions

### 1. Install gh-pages package

First, install the required deployment package:

```bash
npm install
```

This will install `gh-pages` and all other dependencies.

### 2. Create a GitHub Repository

1. Go to https://github.com and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository: **ayekta-emr** (must match the base path in vite.config.ts)
4. Choose "Public" visibility (required for GitHub Pages free tier)
5. Do NOT initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 3. Update package.json with your GitHub username

Edit `package.json` and replace `YOUR_GITHUB_USERNAME` with your actual GitHub username:

```json
"homepage": "https://YOUR_GITHUB_USERNAME.github.io/ayekta-emr",
```

For example, if your username is `johndoe`, it should be:
```json
"homepage": "https://johndoe.github.io/ayekta-emr",
```

### 4. Initialize Git and Push to GitHub

Run these commands in the project directory:

```bash
# Initialize git repository
git init

# Add all files to git
git add .

# Create initial commit
git commit -m "Initial commit: Ayekta EMR v6react"

# Add your GitHub repository as remote
# Replace YOUR_GITHUB_USERNAME with your actual username
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ayekta-emr.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### 5. Deploy to GitHub Pages

Once your code is on GitHub, deploy it to GitHub Pages:

```bash
npm run deploy
```

This command will:
- Build your application (`npm run build`)
- Create a `gh-pages` branch
- Push the built files to that branch
- GitHub will automatically serve your app

### 6. Enable GitHub Pages (if needed)

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" section (left sidebar)
4. Under "Source", ensure it says "Deploy from a branch"
5. Under "Branch", select `gh-pages` and `/root`
6. Click "Save"

### 7. Access Your Application

Your app will be available at:
```
https://YOUR_GITHUB_USERNAME.github.io/ayekta-emr/
```

It usually takes 1-2 minutes for the deployment to complete.

## Accessing on Mobile Phone

### Option 1: Direct URL
Simply open the GitHub Pages URL on your mobile browser:
```
https://YOUR_GITHUB_USERNAME.github.io/ayekta-emr/
```

### Option 2: Add to Home Screen (PWA)

Since this is a Progressive Web App (PWA), you can install it on your phone:

**On iPhone/iPad:**
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

**On Android:**
1. Open the app in Chrome
2. Tap the three-dot menu
3. Tap "Add to Home Screen" or "Install App"
4. Tap "Add" or "Install"

The app will now work offline and appear like a native app!

## Updating Your Deployment

When you make changes to the code:

```bash
# Add your changes
git add .

# Commit changes
git commit -m "Description of your changes"

# Push to GitHub
git push origin main

# Deploy updated version
npm run deploy
```

## Troubleshooting

### Blank page after deployment
- Make sure the `base` path in `vite.config.ts` matches your repository name
- Check that your `homepage` in `package.json` is correct

### 404 errors
- Ensure GitHub Pages is enabled in repository settings
- Verify the `gh-pages` branch exists
- Wait 1-2 minutes for deployment to complete

### App not updating
- Clear your browser cache
- Do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check that `npm run deploy` completed successfully

## Offline Functionality

Once loaded, the app works completely offline thanks to:
- IndexedDB for patient data storage
- Service Worker for caching
- PWA manifest for app-like experience

All patient data is stored locally on the device and never sent to any server.

## Security Note

This app stores medical data locally on the device. For production use:
- Consider adding authentication
- Implement data encryption
- Use HTTPS (GitHub Pages provides this automatically)
- Follow HIPAA or relevant healthcare data regulations in your region
