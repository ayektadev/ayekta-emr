# Google Drive Integration - Setup Guide

This guide will help you set up Google Drive automatic sync for Ayekta EMR.

## Overview

The Google Drive integration provides:
- ✅ Automatic backup to Google Drive when online
- ✅ Offline queueing - data syncs when WiFi becomes available
- ✅ Both JSON and PDF files uploaded to a dedicated folder
- ✅ No changes to your workflow - everything happens automatically

## Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click **"Select a project"** (top bar) → **"New Project"**
3. Project name: `Ayekta EMR`
4. Click **"Create"**
5. Wait ~30 seconds for project creation

### Step 2: Enable Google Drive API

1. In the Google Cloud Console search bar, type: `Google Drive API`
2. Click **"Google Drive API"** from results
3. Click **"Enable"** button
4. Wait for API to enable (~10 seconds)

### Step 3: Create OAuth 2.0 Credentials

#### 3a. Configure OAuth Consent Screen (First Time Only)

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type → Click **"Create"**
3. Fill in the form:
   - **App name**: `Ayekta EMR`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click **"Save and Continue"** through all remaining steps (you can skip optional sections)
5. On the final summary page, click **"Back to Dashboard"**

#### 3b. Create OAuth Client ID

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `Ayekta EMR Web Client`
5. **Authorized JavaScript origins**: Add both:
   ```
   http://localhost:5173
   https://YOUR_GITHUB_USERNAME.github.io
   ```
   Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username

6. **Authorized redirect URIs**: Add both:
   ```
   http://localhost:5173/oauth/callback
   https://YOUR_GITHUB_USERNAME.github.io/ayekta-emr/oauth/callback
   ```

7. Click **"Create"**
8. **IMPORTANT**: Copy your **Client ID** (looks like `xxxxx.apps.googleusercontent.com`)
   - Save this somewhere safe - you'll need it in the next step

### Step 4: Configure Your Application

1. Open the file `.env.local` in your project root
2. Replace the placeholder with your actual Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com
   ```

3. Save the file

### Step 5: Deploy to GitHub Pages

```bash
npm run deploy
```

This will build and deploy your application with Google Drive integration enabled.

### Step 6: Test the Integration

1. Open your deployed application
2. Login to the EMR
3. Look for the **"Google Drive Sync"** panel in the bottom-right corner
4. Click **"Sign in to Google Drive"**
5. Complete the Google OAuth flow:
   - Select your Google account
   - Click **"Continue"** when you see the warning about unverified app
   - Grant permission to access Google Drive
6. Once signed in, the sync will happen automatically!

## How It Works

### Automatic Sync Flow

```
1. You save patient data in the EMR
   ↓
2. Data saved to IndexedDB (local, offline-capable)
   ↓
3. Data added to sync queue
   ↓
4. If online + signed in → Immediate sync to Google Drive
   If offline → Queued for later sync
   ↓
5. When you come back online → Automatic sync of queued data
```

### File Organization in Google Drive

All files are saved to a folder named **"Ayekta EMR Data"** which is automatically created.

For each patient, two files are uploaded:
- `GH26001.json` - Full patient data in JSON format
- `GH26001_Chart.pdf` - Complete PDF chart

If you save the same patient multiple times, the files are **updated** (not duplicated).

### Sync Status Indicators

The Google Drive Sync panel shows:
- **Green dot**: Online and connected
- **Gray dot**: Offline
- **Orange badge**: Number of files queued for sync
- **Status messages**: Real-time sync progress

### Manual Sync

You can manually trigger a sync by clicking the **"Sync Now"** button in the sync panel.

## Troubleshooting

### "Sign-in failed" Error

**Solution**: Make sure your authorized URLs in Google Cloud Console exactly match your deployment URL.

### "Not signed in to Google Drive" Message

**Solution**: Click "Sign in to Google Drive" in the sync panel and complete the OAuth flow.

### Files Not Syncing

**Check**:
1. Are you signed in? (Green checkmark should show "✓ Signed in")
2. Are you online? (Green dot next to "Online")
3. Check the queue badge - if it shows a number, click "Sync Now"

### "Unverified App" Warning During Sign-In

**This is normal!** Google shows this warning for apps that haven't been verified yet.

To continue:
1. Click **"Advanced"** (or "Show Advanced")
2. Click **"Go to Ayekta EMR (unsafe)"** (it's safe - it's your own app!)
3. Click **"Continue"**

**Optional**: To remove this warning, you can verify your app through Google's verification process (takes 1-2 weeks).

### Can't Find the Sync Panel

The sync panel is **fixed** in the bottom-right corner of the screen. If you can't see it:
- Try scrolling down
- Make sure you're logged into the EMR (not on the login screen)
- Check browser console for errors

## Privacy & Security

### What Data is Shared?

- **Patient medical records**: Uploaded to YOUR Google Drive only
- **No third-party access**: Only you can see the files
- **Encrypted in transit**: All data uses HTTPS
- **Encrypted at rest**: Google Drive encrypts stored files

### Who Can Access the Files?

**Only you!** Files are stored in your personal Google Drive account. No one else has access unless you explicitly share them.

### Revoking Access

To revoke Ayekta EMR's access to your Google Drive:

1. Go to https://myaccount.google.com/permissions
2. Find "Ayekta EMR"
3. Click "Remove Access"

## Advanced Configuration

### Changing the Folder Name

Edit `src/services/googleDrive.ts` line 99:

```typescript
const folderName = 'Ayekta EMR Data'; // Change this to your preferred name
```

### Disabling Auto-Sync

If you want to sync manually only, edit `src/utils/storage.ts` and remove the `processSyncQueue()` call (lines 26-30).

## Support

If you encounter issues:

1. Check browser console for error messages (F12 → Console tab)
2. Verify your OAuth credentials in Google Cloud Console
3. Make sure `.env.local` has the correct Client ID
4. Try signing out and signing back in

## Next Steps

Once Google Drive sync is working, you may want to:
- Set up automated backups to a second location
- Export data in FHIR format for interoperability
- Configure multiple Google accounts for team access
