/**
 * Filter Module
 * Handles filtering of entries by type and date range
 */
const FilterManager = {
    /**
     * Get filtered entries based on current filter state
     */
    getFilteredEntries() {
        let filtered = [...App.data.entries];
        
        // Filter by type
        if (App.filters.typeId) {
            filtered = filtered.filter(e => e.typeId === App.filters.typeId);
        }
        
        // Filter by date range
        if (App.filters.dateStart) {
            filtered = filtered.filter(e => e.date >= App.filters.dateStart);
        }
        
        if (App.filters.dateEnd) {
            filtered = filtered.filter(e => e.date <= App.filters.dateEnd);
        }
        
        return filtered;
    },

    /**
     * Apply filter and update UI
     */
    applyFilters() {
        CacheManager.saveCache();
        UIRenderer.renderAll();
    },

    /**
     * Clear all filters
     */
    clearFilters() {
        App.filters.typeId = '';
        App.filters.dateStart = '';
        App.filters.dateEnd = '';
        
        // Reset custom dropdown
        const customSelect = document.getElementById('filterType');
        const trigger = customSelect.querySelector('.selected-text');
        trigger.textContent = 'All Types';
        
        // Clear date inputs
        document.getElementById('filterDateStart').value = '';
        document.getElementById('filterDateEnd').value = '';
        
        // Update selected state in dropdown
        const dropdown = customSelect.querySelector('.custom-select-dropdown');
        dropdown.querySelectorAll('.custom-option').forEach(opt => {
            if (opt.dataset.value === '') {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        
        CacheManager.saveCache();
        UIRenderer.renderAll();
    },

    /**
     * Update filter dropdown with types
     */
    updateFilterDropdown() {
        const customSelect = document.getElementById('filterType');
        if (!customSelect) return;
        
        const dropdown = customSelect.querySelector('.custom-select-dropdown');
        const trigger = customSelect.querySelector('.selected-text');
        
        if (!dropdown || !trigger) return;
        
        const currentValue = App.filters.typeId;
        
        // Clear existing options (keep "All Types")
        dropdown.innerHTML = `
            <div class="custom-option selected" data-value="">
                <span class="option-text">All Types</span>
            </div>
        `;
        
        // Add type options with colored indicators
        App.data.types.forEach(type => {
            const option = document.createElement('div');
            option.className = 'custom-option';
            option.dataset.value = type.id;
            
            const typeName = Helpers.escapeHtml(type.name);
            
            option.innerHTML = `
                <span class="option-color-dot" style="background-color: ${type.color};"></span>
                <span class="option-text">${typeName}</span>
            `;
            
            dropdown.appendChild(option);
        });
        
        // Update trigger text based on current selection
        if (currentValue) {
            const selectedType = App.data.types.find(t => t.id === currentValue);
            if (selectedType) {
                trigger.textContent = selectedType.name;
                
                // Update selected state
                dropdown.querySelectorAll('.custom-option').forEach(opt => {
                    if (opt.dataset.value === currentValue) {
                        opt.classList.add('selected');
                    } else {
                        opt.classList.remove('selected');
                    }
                });
            } else {
                trigger.textContent = 'All Types';
                dropdown.querySelector('.custom-option[data-value=""]')?.classList.add('selected');
            }
        } else {
            trigger.textContent = 'All Types';
            dropdown.querySelector('.custom-option[data-value=""]')?.classList.add('selected');
        }
    }
};

window.FilterManager = FilterManager;
