# Deployment Guide - Time Tracker

Complete step-by-step instructions for deploying your Time Tracker app to various static hosting platforms.

---

## ?? Prerequisites

- Your project files: `index.html`, `style.css`, `script.js`
- A Git account (GitHub, GitLab, etc.) - optional but recommended
- A modern web browser

---

## ?? Deployment Options

### Option 1: GitHub Pages (Recommended)

**Pros**: Free, easy, version control, custom domains
**Time**: 5 minutes

#### Steps:

1. **Create a GitHub Account** (if you don't have one)
   - Go to [github.com](https://github.com)
   - Sign up for free

2. **Create a New Repository**
   - Click the "+" icon ? "New repository"
   - Name: `time-tracker` (or any name you like)
   - Choose "Public"
   - Don't initialize with README
   - Click "Create repository"

3. **Upload Your Files**
   
   **Option A: Using Git (Command Line)**
   ```bash
   # Navigate to your project folder
   cd C:\Projects\Web\mhze-time-tracker
   
   # Initialize Git
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial commit - Time Tracker app"
   
   # Add remote (replace with your repository URL)
   git remote add origin https://github.com/YOUR-USERNAME/time-tracker.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```
   
   **Option B: Using GitHub Web Interface**
   - Click "uploading an existing file"
   - Drag and drop: `index.html`, `style.css`, `script.js`
   - Click "Commit changes"

4. **Enable GitHub Pages**
   - Go to your repository settings
   - Scroll to "Pages" section (left sidebar)
   - Under "Source", select "Deploy from a branch"
   - Branch: `main`, Folder: `/ (root)`
   - Click "Save"
   - Wait 1-2 minutes

5. **Access Your App**
   - URL: `https://YOUR-USERNAME.github.io/time-tracker/`
   - GitHub will show you the URL in the Pages settings

#### Custom Domain (Optional)
- Buy a domain (e.g., from Namecheap, Google Domains)
- In GitHub Pages settings, add your custom domain
- Update your DNS settings (follow GitHub's instructions)

---

### Option 2: Netlify

**Pros**: Super fast deployment, automatic HTTPS, form handling
**Time**: 2 minutes

#### Method A: Drag & Drop

1. **Create a Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up (free)

2. **Deploy**
   - Log in to Netlify
   - Click "Add new site" ? "Deploy manually"
   - Drag your project folder (containing all 3 files)
   - Done! Netlify gives you a URL like `random-name-123.netlify.app`

3. **Custom Domain** (Optional)
   - Click "Domain settings"
   - Add custom domain
   - Follow DNS instructions

#### Method B: Git Integration

1. **Push to GitHub** (see GitHub Pages steps above)

2. **Connect to Netlify**
   - Click "Add new site" ? "Import an existing project"
   - Choose "GitHub"
   - Authorize Netlify
   - Select your repository
   - Build settings: Leave empty (static site)
   - Click "Deploy"

3. **Auto-Deploy**
   - Every time you push to GitHub, Netlify auto-deploys!

---

### Option 3: Cloudflare Pages

**Pros**: Blazing fast CDN, unlimited bandwidth
**Time**: 3 minutes

1. **Create Cloudflare Account**
   - Go to [cloudflare.com](https://cloudflare.com)
   - Sign up (free)

2. **Go to Pages**
   - Navigate to "Workers & Pages"
   - Click "Create application"
   - Choose "Pages"

3. **Connect Git Repository**
   - Click "Connect to Git"
   - Choose GitHub/GitLab
   - Select your repository
   
4. **Configure Build**
   - Project name: `time-tracker`
   - Production branch: `main`
   - Build command: (leave empty)
   - Build output directory: `/`
   - Click "Save and Deploy"

5. **Access Your App**
   - URL: `time-tracker.pages.dev`
   - Custom domains available in settings

---

### Option 4: Vercel

**Pros**: Fast deployment, preview URLs, great DX
**Time**: 2 minutes

#### Method A: Web Interface

1. **Create Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." ? "Project"
   - Select your repository
   - Framework: None (or Other)
   - Click "Deploy"

3. **Done!**
   - URL: `time-tracker.vercel.app`

#### Method B: CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd C:\Projects\Web\mhze-time-tracker

# Deploy
vercel

# Follow prompts:
# - Login
# - Set up project (default settings are fine)
# - Deploy!
```

---

### Option 5: Surge.sh

**Pros**: Simplest deployment, command-line only
**Time**: 1 minute

```bash
# Install Surge
npm install -g surge

# Navigate to project
cd C:\Projects\Web\mhze-time-tracker

# Deploy
surge

# Follow prompts:
# - Email/password (first time)
# - Project path: . (current directory)
# - Domain: press Enter for random, or type custom domain
# - Done!
```

---

### Option 6: Local File System

**Pros**: No internet required, instant access
**Time**: 0 minutes

1. Just open `index.html` in your browser
2. Bookmark the file location
3. Works offline!

**Note**: Some browsers restrict file:// access. Use a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

---

## ?? What to Upload

Always upload these files:
- ? `index.html`
- ? `style.css`
- ? `script.js`

Optional:
- ?? `README.md` (documentation)
- ?? `sample-data.json` (example data)

**Do NOT upload**:
- ? Your actual data JSON file (keep it private!)

---

## ?? Security Considerations

### Protecting Your Data

Your time tracking data is personal. Here's how to keep it safe:

1. **Don't Upload Your Data File**
   - Never commit your actual `data.json` to Git
   - Use `.gitignore`:
     ```
     data.json
     my-time-data.json
     *.private.json
     ```

2. **Store Data Locally**
   - Keep your JSON file on your computer
   - Back it up to cloud storage (encrypted)
   - Use version control for backups (private repo)

3. **Use Private Repositories**
   - If you modify the code, use private repos
   - Or use a local deployment

---

## ?? Customization Before Deploy

### 1. Change the Title
Edit `index.html`:
```html
<title>My Time Tracker</title>
<h1>My Time Tracker</h1>
```

### 2. Change Colors
Edit `style.css`:
```css
:root {
    --primary-color: #your-color;
}
```

### 3. Add Favicon
1. Create a 32x32 icon (or use [favicon.io](https://favicon.io))
2. Save as `favicon.ico`
3. Add to `index.html`:
```html
<link rel="icon" type="image/x-icon" href="favicon.ico">
```

---

## ?? Updating Your Deployed App

### GitHub Pages
```bash
git add .
git commit -m "Update: description of changes"
git push
# Wait 1-2 minutes for deployment
```

### Netlify (Git Integration)
```bash
git push
# Auto-deploys instantly!
```

### Netlify (Manual)
- Drag and drop updated files
- Old version is replaced

### Vercel
```bash
vercel --prod
# Or just push to Git (if connected)
```

### Surge
```bash
surge
# Same domain as before
```

---

## ? Performance Tips

1. **Enable Caching**
   - Most hosts do this automatically
   - Check host documentation

2. **Use CDN**
   - Cloudflare Pages has built-in CDN
   - Netlify has global CDN
   - GitHub Pages uses Fastly CDN

3. **Compress Assets** (Optional)
   - Minify CSS/JS for faster loading
   - Most hosts do this automatically

---

## ?? Custom Domain Setup

### General Steps (All Platforms)

1. **Buy a Domain**
   - Namecheap, Google Domains, Cloudflare, etc.
   - Cost: ~$10-15/year

2. **Add to Your Hosting Platform**
   - GitHub Pages: Settings ? Pages ? Custom domain
   - Netlify: Site settings ? Domain management
   - Vercel: Project settings ? Domains
   - Cloudflare: Automatic if domain is on Cloudflare

3. **Update DNS**
   - Add CNAME record: `www` ? `your-site.platform.com`
   - Add A records for apex domain (platform-specific)

4. **Enable HTTPS**
   - Most platforms auto-enable SSL
   - Wait 24 hours for propagation

---

## ?? Troubleshooting

### Deployment Fails
- Check all files are uploaded
- Verify file names are correct (case-sensitive on some hosts)
- Check browser console for errors

### App Not Working
- Ensure files are in root directory
- Check file paths in HTML (`style.css`, `script.js`)
- Verify JSON structure in sample data

### Custom Domain Not Working
- Wait 24-48 hours for DNS propagation
- Use [whatsmydns.net](https://whatsmydns.net) to check
- Verify DNS records are correct

---

## ?? Recommended Setup

For most users:

1. **Code**: GitHub (version control + backup)
2. **Hosting**: Netlify (auto-deploy from GitHub)
3. **Data**: Local JSON file (manual load/save)
4. **Backup**: Google Drive / Dropbox

This gives you:
- ? Free hosting
- ? Auto-deployment
- ? Version control
- ? Data privacy
- ? Easy updates

---

## ?? You're Done!

Your time tracker is now live on the internet!

Share your URL, start tracking time, and enjoy your new app!

**Questions?** Check the main README.md or browser console for errors.
