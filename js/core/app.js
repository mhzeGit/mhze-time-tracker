/**
 * Main Application State
 * Single source of truth for the entire application
 */
const App = {
    data: {
        entries: [],
        types: []
    },
    filters: {
        typeId: '',
        dateStart: '',
        dateEnd: ''
    },
    currentFileName: null,
    currentFileHandle: null,
    editingId: null,
    editingTypeId: null,
    currentTimeView: 'day', // day, week, or month
    charts: {
        pie: null,
        timeGraph: null
    },
    // System Constants
    SYSTEM_OFF_DAY_TYPE_ID: 'SYSTEM_OFF_DAY'
};

// Make App globally available
window.App = App;
