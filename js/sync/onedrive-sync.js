/**
 * OneDrive Sync Module
 * Handles Microsoft sign-in and automatic sync to user's OneDrive AppFolder
 * Uses MSAL.js for authentication and Microsoft Graph API for file operations
 */
const OneDriveSync = {
    // MSAL configuration - uses PUBLIC client (no secret needed)
    // Register your app at https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
    // Set redirect URI to your app URL (e.g., http://localhost:8080 or your GitHub Pages URL)
    msalConfig: {
        auth: {
            clientId: '569971d1-9f8c-4db3-bd24-f9efe5e07947', // Replace with your Azure AD app client ID
            authority: 'https://login.microsoftonline.com/common',
            redirectUri: window.location.origin + window.location.pathname
        },
        cache: {
            cacheLocation: 'localStorage',
            storeAuthStateInCookie: false
        }
    },

    // Graph API scopes needed for AppFolder access
    scopes: ['Files.ReadWrite.AppFolder', 'User.Read'],

    // File name in OneDrive AppFolder
    DATA_FILE_NAME: 'time-tracker-data.json',

    // MSAL instance
    msalInstance: null,

    // Current account
    account: null,

    // Sync state
    isSyncing: false,

    /**
     * Initialize MSAL and check for existing session
     */
    async init() {
        if (!this.msalConfig.auth.clientId || this.msalConfig.auth.clientId === 'YOUR_CLIENT_ID_HERE') {
            console.log('OneDrive sync not configured - no client ID');
            return;
        }

        try {
            this.msalInstance = new msal.PublicClientApplication(this.msalConfig);
            await this.msalInstance.initialize();

            // Handle redirect response if coming back from login
            const response = await this.msalInstance.handleRedirectPromise();
            if (response) {
                this.account = response.account;
                await this.onSignedIn();
            } else {
                // Check for existing session
                const accounts = this.msalInstance.getAllAccounts();
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    this.updateUI();
                    // Don't auto-load on page refresh, user can click sync if needed
                }
            }
        } catch (error) {
            console.error('MSAL init error:', error);
        }
    },

    /**
     * Sign in with Microsoft
     */
    async signIn() {
        if (!this.msalInstance) {
            Notifications.show('OneDrive sync not configured', 'error');
            return;
        }

        try {
            // Use popup for better UX
            const response = await this.msalInstance.loginPopup({
                scopes: this.scopes
            });
            this.account = response.account;
            await this.onSignedIn();
        } catch (error) {
            console.error('Sign in error:', error);
            if (error.errorCode !== 'user_cancelled') {
                Notifications.show('Sign in failed: ' + error.message, 'error');
            }
        }
    },

    /**
     * Sign out
     */
    async signOut() {
        if (!this.msalInstance || !this.account) return;

        try {
            await this.msalInstance.logoutPopup({
                account: this.account
            });
            this.account = null;
            this.updateUI();
            Notifications.show('Signed out from OneDrive', 'success');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    },

    /**
     * Called after successful sign-in
     */
    async onSignedIn() {
        this.updateUI();
        Notifications.show('Signed in as ' + this.account.username, 'success');
        
        // Load data from OneDrive
        await this.loadFromOneDrive();
    },

    /**
     * Get access token for Graph API
     */
    async getAccessToken() {
        if (!this.msalInstance || !this.account) return null;

        try {
            const response = await this.msalInstance.acquireTokenSilent({
                scopes: this.scopes,
                account: this.account
            });
            return response.accessToken;
        } catch (error) {
            // Token expired, try interactive
            try {
                const response = await this.msalInstance.acquireTokenPopup({
                    scopes: this.scopes
                });
                return response.accessToken;
            } catch (interactiveError) {
                console.error('Token acquisition failed:', interactiveError);
                return null;
            }
        }
    },

    /**
     * Load data from OneDrive AppFolder
     */
    async loadFromOneDrive() {
        if (!this.account) return;

        const token = await this.getAccessToken();
        if (!token) {
            Notifications.show('Failed to get access token', 'error');
            return;
        }

        try {
            // Try to get the file from AppFolder
            const response = await fetch(
                `https://graph.microsoft.com/v1.0/me/drive/special/approot:/${this.DATA_FILE_NAME}:/content`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.status === 404) {
                // File doesn't exist yet, that's okay
                console.log('No existing data in OneDrive');
                Notifications.show('No existing data in OneDrive - your data will be synced', 'success');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to load from OneDrive');
            }

            const data = await response.json();

            // Validate and load data
            if (DataManager.validateData(data)) {
                App.data.types = data.types || [];
                App.data.entries = data.entries || [];
                CacheManager.saveCache();
                UIRenderer.renderAll();
                Notifications.show('Data loaded from OneDrive', 'success');
            } else {
                Notifications.show('Invalid data format in OneDrive', 'error');
            }
        } catch (error) {
            console.error('Load from OneDrive error:', error);
            Notifications.show('Error loading from OneDrive: ' + error.message, 'error');
        }
    },

    /**
     * Save data to OneDrive AppFolder (overwrites existing file)
     */
    async saveToOneDrive() {
        if (!this.account || this.isSyncing) return;

        const token = await this.getAccessToken();
        if (!token) return;

        this.isSyncing = true;
        this.updateSyncIndicator(true);

        try {
            const dataToSave = {
                types: App.data.types,
                entries: App.data.entries
            };

            const response = await fetch(
                `https://graph.microsoft.com/v1.0/me/drive/special/approot:/${this.DATA_FILE_NAME}:/content`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dataToSave, null, 2)
                }
            );

            if (!response.ok) {
                throw new Error('Failed to save to OneDrive');
            }

            console.log('Saved to OneDrive');
        } catch (error) {
            console.error('Save to OneDrive error:', error);
            // Don't show error notification on every auto-save failure
        } finally {
            this.isSyncing = false;
            this.updateSyncIndicator(false);
        }
    },

    /**
     * Update UI based on sign-in state
     */
    updateUI() {
        const signInBtn = document.getElementById('oneDriveSignInBtn');
        const signOutBtn = document.getElementById('oneDriveSignOutBtn');
        const userDisplay = document.getElementById('oneDriveUser');

        if (!signInBtn || !signOutBtn || !userDisplay) return;

        if (this.account) {
            signInBtn.style.display = 'none';
            signOutBtn.style.display = 'inline-flex';
            userDisplay.textContent = this.account.username;
            userDisplay.style.display = 'inline';
        } else {
            signInBtn.style.display = 'inline-flex';
            signOutBtn.style.display = 'none';
            userDisplay.style.display = 'none';
        }
    },

    /**
     * Show/hide sync indicator
     */
    updateSyncIndicator(syncing) {
        const indicator = document.getElementById('syncIndicator');
        if (indicator) {
            indicator.style.display = syncing ? 'inline' : 'none';
        }
    },

    /**
     * Check if signed in
     */
    isSignedIn() {
        return this.account !== null;
    }
};

// Make globally available
window.OneDriveSync = OneDriveSync;
