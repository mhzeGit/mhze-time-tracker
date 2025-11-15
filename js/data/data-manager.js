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
            if (!entry.id || !entry.title || !entry.typeId || !entry.date || 
                !entry.startTime || !entry.endTime || typeof entry.durationMinutes !== 'number') {
                return false;
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
