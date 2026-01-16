/**
 * Application Initialization
 * Main entry point for the application
 */
function initApp() {
    // Try to load from cache first
    const cacheLoaded = CacheManager.loadCache();
    
    if (!cacheLoaded) {
        // No cache, start with empty data
        App.data = DataManager.createEmptyData();
    }

    // Ensure system off-day type exists
    const hasOffDayType = App.data.types.some(t => t.id === App.SYSTEM_OFF_DAY_TYPE_ID);
    if (!hasOffDayType) {
        App.data.types.push({
            id: App.SYSTEM_OFF_DAY_TYPE_ID,
            name: 'Off Day',
            color: '#cccccc', // Neutral gray
            isSystem: true // Flag to identify system types if needed later
        });
        // Save cache to persist the new type
        CacheManager.saveCache();
    }
    
    // Setup all event listeners
    EventListeners.setup();
    
    // Setup OneDrive sign-in/sign-out buttons
    const signInBtn = document.getElementById('oneDriveSignInBtn');
    const signOutBtn = document.getElementById('oneDriveSignOutBtn');
    
    console.log('OneDrive buttons found:', { signInBtn: !!signInBtn, signOutBtn: !!signOutBtn });
    
    if (signInBtn) {
        signInBtn.addEventListener('click', () => {
            console.log('Sign in button clicked');
            OneDriveSync.signIn();
        });
    }
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            console.log('Sign out button clicked');
            OneDriveSync.signOut();
        });
    }
    
    // Initialize OneDrive sync
    console.log('OneDriveSync defined:', typeof OneDriveSync !== 'undefined');
    if (typeof OneDriveSync !== 'undefined') {
        OneDriveSync.init();
    }
    
    // Render initial UI
    UIRenderer.renderAll();
    
    if (cacheLoaded) {
        console.log('Time Tracker initialized with cached data');
        // Show subtle notification that data was restored
        setTimeout(() => {
            Notifications.show('Previous session restored from cache', 'success');
        }, 500);
    } else {
        console.log('Time Tracker initialized - no cached data found');
    }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
