/**
 * Data Management Module
 * Handles loading, saving, and validation of data
 */
const DataManager = {
    /**
     * Load data from a user-selected JSON file
     * Both types and entries are loaded from the same file
     */
    async loadData() {
        const fileInput = document.getElementById('fileInput');
        
        return new Promise((resolve, reject) => {
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) {
                    reject('No file selected');
                    return;
                }

                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    
                    // Validate data structure
                    if (!this.validateData(data)) {
                        throw new Error('Invalid data format');
                    }

                    // Load both types and entries
                    App.data.types = data.types || [];
                    App.data.entries = data.entries || [];
                    App.currentFileName = file.name;
                    
                    // Auto-save to cache after loading
                    CacheManager.saveCache();
                    
                    UIRenderer.renderAll();
                    Notifications.show('Data loaded and cached successfully!', 'success');
                    resolve(data);
                } catch (error) {
                    Notifications.show('Error loading file: ' + error.message, 'error');
                    reject(error);
                } finally {
                    fileInput.value = '';
                }
            };

            fileInput.click();
        });
    },

    /**
     * Save data to a JSON file
     * Both types and entries are saved together
     */
    async saveData() {
        // Ensure both types and entries are included
        const dataToSave = {
            types: App.data.types,
            entries: App.data.entries
        };
        
        const jsonString = JSON.stringify(dataToSave, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Try to use File System Access API for better UX
        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: App.currentFileName || 'time-tracker-data.json',
                    types: [{
                        description: 'JSON Files',
                        accept: { 'application/json': ['.json'] }
                    }]
                });
                
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                
                App.currentFileHandle = handle;
                App.currentFileName = handle.name;
                
                // Update cache after successful save
                CacheManager.saveCache();
                
                Notifications.show('Data saved and cached successfully!', 'success');
                return;
            } catch (err) {
                if (err.name === 'AbortError') {
                    return;
                }
            }
        }
        
        // Fallback: Download file
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = App.currentFileName || 'time-tracker-data.json';
        a.click();
        URL.revokeObjectURL(url);
        
        // Update cache after download
        CacheManager.saveCache();
        
        Notifications.show('Data downloaded and cached!', 'success');
    },

    /**
     * Validate data structure
     */
    validateData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!Array.isArray(data.entries)) return false;
        if (!Array.isArray(data.types)) {
            // Initialize types if missing (backward compatibility)
            data.types = [];
        }
        
        // Validate each entry
        for (const entry of data.entries) {
            // Check for required fields based on isOffDay property
            if (!entry.id || !entry.title || !entry.date) return false;
            
            // Allow missing values for off-day entries
            if (!entry.isOffDay) {
                if (!entry.typeId || !entry.startTime || !entry.endTime || typeof entry.durationMinutes !== 'number') {
                    return false;
                }
            } else {
                // For off-day entries, just ensure these fields are present if needed, 
                // but our app logic handles nulls fairly gracefully or we can validate them loosely.
                // However, since we save 00:00 and duration 0, basic checks should pass if keys exist.
                // If keys are missing in old data, we might have issues.
                // Let's assume standardized structure even for off-days.
                // But wait, user asked "can not edit any values such as ... task type".
                // We set typeId to null in UI for off-days.
                // So strict check `!entry.typeId` will fail for off-day entries.
                // We must skip typeId check if isOffDay is true.
            }
        }
        
        // Validate each type
        for (const type of data.types) {
            if (!type.id || !type.name || !type.color) {
                return false;
            }
        }
        
        return true;
    },

    /**
     * Create initial empty data structure
     */
    createEmptyData() {
        return {
            types: [],
            entries: []
        };
    }
};

window.DataManager = DataManager;
