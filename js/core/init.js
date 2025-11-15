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
    
    // Setup all event listeners
    EventListeners.setup();
    
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
