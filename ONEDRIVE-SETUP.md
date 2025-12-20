# OneDrive Sync Setup Guide

This app supports automatic sync to Microsoft OneDrive. Each user connects their own OneDrive account and all data stays private to them.

## Quick Setup (5 minutes)

### 1. Register an Azure AD Application

1. Go to [Azure Portal - App Registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Click **"New registration"**
3. Fill in:
   - **Name**: `Time Tracker` (or any name you like)
   - **Supported account types**: Select **"Accounts in any organizational directory and personal Microsoft accounts"**
   - **Redirect URI**: 
     - Platform: **Single-page application (SPA)**
     - URL: Your app URL (e.g., `http://localhost:8080` for local dev, or your GitHub Pages URL)
4. Click **"Register"**

### 2. Copy Your Client ID

After registration, you'll see an **"Application (client) ID"** on the overview page. Copy this GUID.

### 3. Configure the App

Open `js/sync/onedrive-sync.js` and replace `YOUR_CLIENT_ID_HERE` with your Client ID:

```javascript
msalConfig: {
    auth: {
        clientId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Your Client ID here
        ...
    }
}
```

### 4. That's It!

No other configuration needed. The app uses:
- **Public client flow** (no secrets needed)
- **AppFolder permission** (the app can only access its own folder in the user's OneDrive, not their other files)

## How It Works

- Click **"Sign in"** to connect your OneDrive
- Your data is automatically saved to OneDrive whenever you make changes
- Data is stored in: `OneDrive/Apps/Time Tracker/time-tracker-data.json`
- Uses simple last-write-wins approach
- All data stays in the user's own OneDrive - the app developer cannot access it

## Multiple Redirect URIs

If you deploy to multiple environments, add all your URLs as redirect URIs:
1. Go to your app in Azure Portal
2. Click **"Authentication"** in the sidebar
3. Under **"Single-page application"**, add all your URLs:
   - `http://localhost:8080`
   - `http://localhost:3000`
   - `https://yourusername.github.io/time-tracker`

## Troubleshooting

### "AADSTS50011: The redirect URI does not match"
Add your current app URL to the redirect URIs in Azure Portal.

### "Sign in failed" with consent error
Make sure you selected "Accounts in any organizational directory and personal Microsoft accounts" during registration.

### Data not syncing
Check the browser console for errors. The sync indicator (⟳) shows when data is being saved.
