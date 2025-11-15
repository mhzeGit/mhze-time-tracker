/**
 * Utility Helper Functions
 */
const Helpers = {
    /**
     * Generate a simple UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Format date to readable string
     */
    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-GB', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    },

    /**
     * Format date to short string (DD/MM/YY)
     */
    formatShortDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-GB', { 
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    },

    /**
     * Calculate duration in minutes between two times
     */
    calculateDuration(startTime, endTime) {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        let duration = endMinutes - startMinutes;
        
        if (duration < 0) {
            duration += 24 * 60;
        }
        
        return duration;
    },

    /**
     * Format duration from minutes to readable string
     */
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }
};

window.Helpers = Helpers;
