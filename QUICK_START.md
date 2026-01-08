# Quick Start Guide - GitHub Pages Deployment

## Option 1: Automated Setup (Easiest)

Run the setup script:

```bash
./setup-github.sh
```

This will prompt for your GitHub username and configure everything automatically.

## Option 2: Manual Setup

### Step 1: Edit package.json

Replace `YOUR_GITHUB_USERNAME` on line 6 with your actual GitHub username.

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: **ayekta-emr**
3. Visibility: **Public**
4. Click "Create repository"

### Step 4: Initialize and Push

```bash
git init
git add .
git commit -m "Initial commit: Ayekta EMR v6react"
git remote add origin https://github.com/YOUR_USERNAME/ayekta-emr.git
git branch -M main
git push -u origin main
```

### Step 5: Deploy

```bash
npm run deploy
```

### Step 6: Access Your App

Visit: `https://YOUR_USERNAME.github.io/ayekta-emr/`

## Mobile Access

### Add to Home Screen

**iPhone/iPad:**
1. Open Safari → Share → Add to Home Screen

**Android:**
1. Open Chrome → Menu → Install App

## Commands Reference

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run deploy      # Deploy to GitHub Pages
npm run preview     # Preview production build locally
```

## Troubleshooting

**Blank page?**
- Check that repository name is `ayekta-emr`
- Verify GitHub Pages is enabled in repo settings

**Not updating?**
- Clear browser cache
- Wait 1-2 minutes for deployment

**404 Error?**
- Ensure `gh-pages` branch exists
- Check repository is Public

## File Output

When you save a patient:
- `GH26{ISHI_ID}.json` - Patient data
- `GH26{ISHI_ID}_Chart.pdf` - Full chart PDF

ISHI ID is a 13-digit random number (e.g., `3847261950382`)

## Important Notes

✓ Works completely offline after first load
✓ Data stored locally in browser
✓ No data sent to servers
✓ PWA-enabled for mobile installation
✓ Supports medical imaging (DICOM, PDF, JPG)

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
