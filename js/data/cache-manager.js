/**
 * Local Storage Caching Module
 * Handles automatic caching of data to prevent loss on refresh
 */
const CacheManager = {
    CACHE_KEY: 'timeTrackerCachedData',
    FILENAME_KEY: 'timeTrackerCachedFileName',
    FILTERS_KEY: 'timeTrackerCachedFilters',

    /**
     * Save current app data to localStorage
     */
    saveCache() {
        try {
            const dataToCache = {
                types: App.data.types,
                entries: App.data.entries
            };
            
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(dataToCache));
            
            if (App.currentFileName) {
                localStorage.setItem(this.FILENAME_KEY, App.currentFileName);
            }
            
            // Also cache current filters
            localStorage.setItem(this.FILTERS_KEY, JSON.stringify(App.filters));
            
            console.log('Data cached successfully');
            
            // Auto-sync to OneDrive if signed in
            if (typeof OneDriveSync !== 'undefined' && OneDriveSync.isSignedIn()) {
                OneDriveSync.saveToOneDrive();
            }
        } catch (error) {
            console.error('Error saving to cache:', error);
            // Handle quota exceeded or other storage errors
            if (error.name === 'QuotaExceededError') {
                Notifications.show('Cache storage full. Please save your data manually.', 'error');
            }
        }
    },

    /**
     * Load cached data from localStorage
     */
    loadCache() {
        try {
            const cachedData = localStorage.getItem(this.CACHE_KEY);
            const cachedFileName = localStorage.getItem(this.FILENAME_KEY);
            const cachedFilters = localStorage.getItem(this.FILTERS_KEY);
            
            if (cachedData) {
                const data = JSON.parse(cachedData);
                
                // Validate cached data
                if (DataManager.validateData(data)) {
                    App.data.types = data.types || [];
                    App.data.entries = data.entries || [];
                    App.currentFileName = cachedFileName || 'cached-data.json';
                    
                    // Restore filters
                    if (cachedFilters) {
                        const filters = JSON.parse(cachedFilters);
                        App.filters = filters;
                        
                        // Update filter UI will be done after DOM is ready
                        if (filters.dateStart) document.getElementById('filterDateStart').value = filters.dateStart;
                        if (filters.dateEnd) document.getElementById('filterDateEnd').value = filters.dateEnd;
                    }
                    
                    console.log('Loaded from cache:', App.data.entries.length, 'entries');
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error loading from cache:', error);
            return false;
        }
    },

    /**
     * Clear all cached data
     */
    clearCache() {
        try {
            localStorage.removeItem(this.CACHE_KEY);
            localStorage.removeItem(this.FILENAME_KEY);
            localStorage.removeItem(this.FILTERS_KEY);
            console.log('Cache cleared');
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    },

    /**
     * Check if cache exists
     */
    hasCache() {
        return localStorage.getItem(this.CACHE_KEY) !== null;
    }
};

window.CacheManager = CacheManager;
