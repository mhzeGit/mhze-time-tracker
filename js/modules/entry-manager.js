/**
 * Entry Management Module
 * Handles CRUD operations for time entries
 */
const EntryManager = {
    /**
     * Add a new entry
     */
    addEntry(entry = {}) {
        const newEntry = {
            id: Helpers.generateUUID(),
            title: entry.title || 'Untitled Entry',
            typeId: entry.typeId || null,
            date: entry.date || new Date().toISOString().split('T')[0],
            startTime: entry.startTime || '00:00',
            endTime: entry.endTime || '01:00',
            durationMinutes: Helpers.calculateDuration(entry.startTime, entry.endTime),
            isOffDay: entry.isOffDay || false
        };
        
        App.data.entries.push(newEntry);
        this.sortEntries();
        CacheManager.saveCache();
        UIRenderer.renderAll();
    },

    /**
     * Add multiple entries at once (Batch)
     */
    addEntries(entries = []) {
        entries.forEach(entry => {
             const newEntry = {
                id: Helpers.generateUUID(),
                title: entry.title || 'Untitled Entry',
                typeId: entry.typeId || null,
                date: entry.date || new Date().toISOString().split('T')[0],
                startTime: entry.startTime || '00:00',
                endTime: entry.endTime || '01:00',
                durationMinutes: Helpers.calculateDuration(entry.startTime || '00:00', entry.endTime || '00:00'),
                isOffDay: entry.isOffDay || false
            };
            App.data.entries.push(newEntry);
        });
        
        this.sortEntries();
        CacheManager.saveCache();
        UIRenderer.renderAll();
    },

    /**
     * Update an existing entry
     */
    updateEntry(id, updatedData) {
        const index = App.data.entries.findIndex(e => e.id === id);
        if (index !== -1) {
            App.data.entries[index] = {
                ...App.data.entries[index],
                ...updatedData,
                durationMinutes: Helpers.calculateDuration(updatedData.startTime, updatedData.endTime),
                isOffDay: updatedData.isOffDay !== undefined ? updatedData.isOffDay : (App.data.entries[index].isOffDay || false)
            };
            
            this.sortEntries();
            CacheManager.saveCache();
            UIRenderer.renderAll();
        }
    },

    /**
     * Delete an entry
     */
    deleteEntry(id) {
        if (!confirm('Are you sure you want to delete this entry?')) {
            return;
        }
        
        App.data.entries = App.data.entries.filter(e => e.id !== id);
        CacheManager.saveCache();
        UIRenderer.renderAll();
    },

    /**
     * Sort entries by date and time (descending)
     */
    sortEntries() {
        App.data.entries.sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.startTime);
            const dateB = new Date(b.date + ' ' + b.startTime);
            return dateB - dateA;
        });
    }
};

window.EntryManager = EntryManager;
