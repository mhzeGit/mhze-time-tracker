/**
 * Sorting Module
 * Handles sorting of entries by different columns
 */
const SortManager = {
    currentColumn: null,
    currentDirection: 'desc', // 'asc' or 'desc'

    /**
     * Sort entries by column
     */
    sortEntries(column) {
        // Toggle direction if clicking same column
        if (this.currentColumn === column) {
            this.currentDirection = this.currentDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentColumn = column;
            this.currentDirection = 'desc';
        }

        // Get filtered entries
        const filteredEntries = FilterManager.getFilteredEntries();

        // Sort based on column
        filteredEntries.sort((a, b) => {
            let valueA, valueB;

            switch(column) {
                case 'title':
                    valueA = a.title.toLowerCase();
                    valueB = b.title.toLowerCase();
                    break;
                case 'type':
                    const typeA = TypeManager.getTypeById(a.typeId);
                    const typeB = TypeManager.getTypeById(b.typeId);
                    valueA = typeA ? typeA.name.toLowerCase() : '';
                    valueB = typeB ? typeB.name.toLowerCase() : '';
                    break;
                case 'date':
                    valueA = new Date(a.date + ' ' + a.startTime);
                    valueB = new Date(b.date + ' ' + b.startTime);
                    break;
                case 'start':
                    valueA = a.startTime;
                    valueB = b.startTime;
                    break;
                case 'end':
                    valueA = a.endTime;
                    valueB = b.endTime;
                    break;
                case 'duration':
                    valueA = a.durationMinutes;
                    valueB = b.durationMinutes;
                    break;
                default:
                    return 0;
            }

            // Compare values
            let comparison = 0;
            if (valueA > valueB) comparison = 1;
            if (valueA < valueB) comparison = -1;

            // Apply direction
            return this.currentDirection === 'asc' ? comparison : -comparison;
        });

        // Re-render with sorted data
        UIRenderer.renderEntriesSorted(filteredEntries);
        this.updateSortIndicators();
    },

    /**
     * Update sort indicators in table headers
     */
    updateSortIndicators() {
        // Remove all existing indicators
        document.querySelectorAll('.sort-indicator').forEach(el => el.remove());

        // Add indicator to current column
        if (this.currentColumn) {
            const header = document.querySelector(`[data-sort="${this.currentColumn}"]`);
            if (header) {
                const indicator = document.createElement('span');
                indicator.className = 'sort-indicator';
                indicator.innerHTML = this.currentDirection === 'asc' ? ' &uarr;' : ' &darr;';
                header.appendChild(indicator);
            }
        }
    }
};

window.SortManager = SortManager;
