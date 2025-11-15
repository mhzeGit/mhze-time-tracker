/**
 * Type Management Module
 * Handles CRUD operations for task types
 */
const TypeManager = {
    /**
     * Add a new type
     */
    addType(type) {
        const newType = {
            id: Helpers.generateUUID(),
            name: type.name,
            color: type.color
        };
        
        App.data.types.push(newType);
        CacheManager.saveCache();
        UIRenderer.renderTypes();
        UIRenderer.renderAll();
    },

    /**
     * Update an existing type
     */
    updateType(id, updatedData) {
        const index = App.data.types.findIndex(t => t.id === id);
        if (index !== -1) {
            App.data.types[index] = {
                ...App.data.types[index],
                ...updatedData
            };
            CacheManager.saveCache();
            UIRenderer.renderTypes();
            UIRenderer.renderAll();
        }
    },

    /**
     * Delete a type
     */
    deleteType(id) {
        const inUse = App.data.entries.some(e => e.typeId === id);
        
        if (inUse) {
            if (!confirm('This type is currently in use. Deleting it will affect existing entries. Continue?')) {
                return;
            }
        } else {
            if (!confirm('Are you sure you want to delete this type?')) {
                return;
            }
        }
        
        App.data.types = App.data.types.filter(t => t.id !== id);
        CacheManager.saveCache();
        UIRenderer.renderTypes();
        UIRenderer.renderAll();
    },

    /**
     * Get type by ID
     */
    getTypeById(id) {
        return App.data.types.find(t => t.id === id);
    }
};

window.TypeManager = TypeManager;
