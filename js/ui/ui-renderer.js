/**
 * UI Rendering Module
 * Handles rendering of all UI components
 */
const UIRenderer = {
    /**
     * Render all UI components
     */
    renderAll() {
        this.renderSummary();
        this.renderTypes();
        this.renderEntries();
        this.renderCharts();
    },

    /**
     * Render summary statistics
     */
    renderSummary() {
        const filteredEntries = FilterManager.getFilteredEntries();
        
        document.getElementById('dailyAverage').textContent = 
            Helpers.formatDuration(Analytics.getDailyAverage());
        
        document.getElementById('weeklyAverage').textContent = 
            Helpers.formatDuration(Analytics.getWeeklyAverage());
        
        // Count entries excluding off-days for statistics
        const entriesExcludingOffDays = Analytics.getEntriesToAnalyzeExcludingOffDays();
        document.getElementById('totalEntries').textContent = 
            entriesExcludingOffDays.length;
        
        document.getElementById('totalTime').textContent = 
            Helpers.formatDuration(Analytics.getTotalTime());
    },

    /**
     * Render types list
     */
    renderTypes() {
        const container = document.getElementById('typeList');
        
        // Filter out system types
        const displayTypes = App.data.types.filter(t => t.id !== App.SYSTEM_OFF_DAY_TYPE_ID);

        if (displayTypes.length === 0) {
            container.innerHTML = '<p class="empty-state">No types defined. Click "Add Type" to create one.</p>';
            return;
        }
        
        container.innerHTML = displayTypes.map(type => `
            <div class="type-item" data-id="${type.id}">
                <div class="type-color-indicator" style="background-color: ${type.color};"></div>
                <div class="type-name">${Helpers.escapeHtml(type.name)}</div>
                <div class="type-actions">
                    <button class="btn btn-secondary btn-small edit-type-btn" data-id="${type.id}" title="Edit type">
                        <span class="icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </span>
                    </button>
                    <button class="btn btn-danger btn-small delete-type-btn" data-id="${type.id}" title="Delete type">&times;</button>
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.edit-type-btn').forEach(btn => {
            btn.addEventListener('click', () => TypeModalManager.openEditModal(btn.dataset.id));
        });
        
        container.querySelectorAll('.delete-type-btn').forEach(btn => {
            btn.addEventListener('click', () => TypeManager.deleteType(btn.dataset.id));
        });
        
        this.updateTypeDropdown();
        FilterManager.updateFilterDropdown();
    },

    /**
     * Update type dropdown in task modal to use custom select
     */
    updateTypeDropdown() {
        const customSelect = document.getElementById('taskType');
        if (!customSelect) return;

        const dropdown = customSelect.querySelector('.custom-select-dropdown');
        const trigger = customSelect.querySelector('.custom-select-trigger .selected-text');
        let colorPreview = customSelect.querySelector('.custom-select-trigger .color-preview');

        if (!dropdown || !trigger) return;

        const currentValue = App.editingId ? App.data.entries.find(e => e.id === App.editingId)?.typeId : '';

        // Clear existing options (keep "Select a type...")
        dropdown.innerHTML = `
            <div class="custom-option" data-value="">
                <span class="option-text">Select a type...</span>
            </div>
        `;

        // Add type options with colored indicators (exclude system types)
        App.data.types
            .filter(t => t.id !== App.SYSTEM_OFF_DAY_TYPE_ID)
            .forEach(type => {
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

        // Update trigger text and color preview based on current selection
        if (currentValue) {
            const selectedType = App.data.types.find(t => t.id === currentValue);
            // If selected type is the hidden system type (off day), show specific text
            if (currentValue === App.SYSTEM_OFF_DAY_TYPE_ID) {
                trigger.textContent = 'Off Day';
                if (colorPreview) colorPreview.style.backgroundColor = '#cccccc';
            } else if (selectedType) {
                trigger.textContent = selectedType.name;
                if (colorPreview) {
                    colorPreview.style.backgroundColor = selectedType.color;
                }

                // Update selected state
                dropdown.querySelectorAll('.custom-option').forEach(opt => {
                    if (opt.dataset.value === currentValue) {
                        opt.classList.add('selected');
                    } else {
                        opt.classList.remove('selected');
                    }
                });
            } else {
                // ... (handling deleted or missing types)
                trigger.textContent = 'Select a type...';
                if (colorPreview) {
                    colorPreview.style.backgroundColor = 'transparent';
                }
                dropdown.querySelector('.custom-option[data-value=""]')?.classList.add('selected');
            }
        } else {
            trigger.textContent = 'Select a type...';
            if (colorPreview) {
                colorPreview.style.backgroundColor = 'transparent';
            }
            dropdown.querySelector('.custom-option[data-value=""]')?.classList.add('selected');
        }

        // Append color preview to trigger if not already present
        const triggerContainer = customSelect.querySelector('.custom-select-trigger');
        if (triggerContainer && !colorPreview) {
            colorPreview = document.createElement('span');
            colorPreview.className = 'color-preview';
            triggerContainer.insertBefore(colorPreview, trigger);
        }

        // Add event listener to update color preview on selection
        dropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-option');
            if (!option) return;

            const selectedValue = option.dataset.value;
            const selectedType = App.data.types.find(t => t.id === selectedValue);

            if (selectedType) {
                trigger.textContent = selectedType.name;
                if (colorPreview) {
                    colorPreview.style.backgroundColor = selectedType.color;
                }
            } else {
                trigger.textContent = 'Select a type...';
                if (colorPreview) {
                    colorPreview.style.backgroundColor = 'transparent';
                }
            }

            dropdown.querySelectorAll('.custom-option').forEach(opt => {
                if (opt.dataset.value === selectedValue) {
                    opt.classList.add('selected');
                } else {
                    opt.classList.remove('selected');
                }
            });

            customSelect.classList.remove('open');
        });
    },

    /**
     * Render entries table
     */
    renderEntries() {
        const container = document.getElementById('entriesTableBody');
        const filteredEntries = FilterManager.getFilteredEntries();
        
        if (filteredEntries.length === 0) {
            container.innerHTML = '<p class="empty-state">No entries found. Try adjusting filters or add a new task.</p>';
            return;
        }
        
        this.renderEntriesSorted(filteredEntries);
    },

    /**
     * Render sorted entries
     */
    renderEntriesSorted(filteredEntries) {
        const container = document.getElementById('entriesTableBody');
        
        container.innerHTML = filteredEntries.map(entry => {
            const type = TypeManager.getTypeById(entry.typeId);
            const typeName = type ? type.name : 'Unknown';
            const typeColor = type ? type.color : '#64748b';
            
            let dateDisplay = Helpers.formatShortDate(entry.date);
            if (entry.endDate && entry.endDate !== entry.date) {
                dateDisplay = `${Helpers.formatShortDate(entry.date)} - ${Helpers.formatShortDate(entry.endDate)}`;
            }

            return `
                <div class="entry-row" data-id="${entry.id}">
                    <div class="entry-col entry-col-title" data-label="Title">${Helpers.escapeHtml(entry.title)}</div>
                    <div class="entry-col entry-col-type" data-label="Type">
                        <span class="entry-type-dot" style="background-color: ${typeColor};"></span>
                        ${Helpers.escapeHtml(typeName)}
                    </div>
                    <div class="entry-col entry-col-date" data-label="Date">${dateDisplay}</div>
                    <div class="entry-col entry-col-time" data-label="Start">${entry.startTime}</div>
                    <div class="entry-col entry-col-time" data-label="End">${entry.endTime}</div>
                    <div class="entry-col entry-col-duration" data-label="Duration">${Helpers.formatDuration(entry.durationMinutes)}</div>
                    <div class="entry-col entry-col-actions">
                        <button class="entry-action-btn edit-btn" data-id="${entry.id}" title="Edit entry">
                            <span class="icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </span>
                        </button>
                        <button class="entry-action-btn delete-btn" data-id="${entry.id}" title="Delete entry">&times;</button>
                    </div>
                </div>
            `;
        }).join('');
        
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => ModalManager.openEditModal(btn.dataset.id));
        });
        
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => EntryManager.deleteEntry(btn.dataset.id));
        });
    },

    /**
     * Render charts
     */
    renderCharts() {
        ChartRenderer.renderPieChart();
        ChartRenderer.renderTimeGraph();
    }
};

window.UIRenderer = UIRenderer;
