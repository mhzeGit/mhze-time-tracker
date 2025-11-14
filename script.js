/**
 * Time Tracker Application - Dark Mode with Type Management
 * A static web app for tracking time entries with analytics and stacked charts
 */

 // Main Application Object - Single source of truth
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
    }
};

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
                    UIRenderer.showNotification('Data loaded and cached successfully!', 'success');
                    resolve(data);
                } catch (error) {
                    UIRenderer.showNotification('Error loading file: ' + error.message, 'error');
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
                
                UIRenderer.showNotification('Data saved and cached successfully!', 'success');
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
        
        UIRenderer.showNotification('Data downloaded and cached!', 'success');
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
            types: [],  // Start with empty types array
            entries: []
        };
    },

    /**
     * Generate a simple UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

/**
 * Type Management Module
 */
const TypeManager = {
    addType(type) {
        const newType = {
            id: DataManager.generateUUID(),
            name: type.name,
            color: type.color
        };
        
        App.data.types.push(newType);
        CacheManager.saveCache(); // Auto-cache
        UIRenderer.renderTypes();
        UIRenderer.renderAll();
    },

    updateType(id, updatedData) {
        const index = App.data.types.findIndex(t => t.id === id);
        if (index !== -1) {
            App.data.types[index] = {
                ...App.data.types[index],
                ...updatedData
            };
            CacheManager.saveCache(); // Auto-cache
            UIRenderer.renderTypes();
            UIRenderer.renderAll();
        }
    },

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
        CacheManager.saveCache(); // Auto-cache
        UIRenderer.renderTypes();
        UIRenderer.renderAll();
    },

    getTypeById(id) {
        return App.data.types.find(t => t.id === id);
    }
};

/**
 * Entry Management Module
 */
const EntryManager = {
    addEntry(entry = {}) {
        const newEntry = {
            id: DataManager.generateUUID(),
            title: entry.title || 'Untitled Entry',
            typeId: entry.typeId || null,
            date: entry.date || new Date().toISOString().split('T')[0],
            startTime: entry.startTime || '00:00',
            endTime: entry.endTime || '01:00',
            durationMinutes: this.calculateDuration(entry.startTime, entry.endTime)
        };
        
        App.data.entries.push(newEntry);
        App.data.entries.sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.startTime);
            const dateB = new Date(b.date + ' ' + b.startTime);
            return dateB - dateA;
        });
        
        CacheManager.saveCache(); // Auto-cache
        UIRenderer.renderAll();
    },

    updateEntry(id, updatedData) {
        const index = App.data.entries.findIndex(e => e.id === id);
        if (index !== -1) {
            App.data.entries[index] = {
                ...App.data.entries[index],
                ...updatedData,
                durationMinutes: this.calculateDuration(updatedData.startTime, updatedData.endTime)
            };
            
            App.data.entries.sort((a, b) => {
                const dateA = new Date(a.date + ' ' + a.startTime);
                const dateB = new Date(b.date + ' ' + b.startTime);
                return dateB - dateA;
            });
            
            CacheManager.saveCache(); // Auto-cache
            UIRenderer.renderAll();
        }
    },

    deleteEntry(id) {
        if (!confirm('Are you sure you want to delete this entry?')) {
            return;
        }
        
        App.data.entries = App.data.entries.filter(e => e.id !== id);
        CacheManager.saveCache(); // Auto-cache
        UIRenderer.renderAll();
    },

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

    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }
};

/**
 * Analytics Module
 */
const Analytics = {
    /**
     * Get entries to analyze (filtered or all)
     */
    getEntriesToAnalyze() {
        return FilterManager.getFilteredEntries();
    },

    getDailyAverage() {
        const dailyTotals = this.getDailyTotals();
        const days = Object.keys(dailyTotals).length;
        
        if (days === 0) return 0;
        
        const totalMinutes = Object.values(dailyTotals).reduce((sum, min) => sum + min, 0);
        return Math.round(totalMinutes / days);
    },

    getWeeklyAverage() {
        const weeklyTotals = this.getWeeklyTotals();
        const weeks = Object.keys(weeklyTotals).length;
        
        if (weeks === 0) return 0;
        
        const totalMinutes = Object.values(weeklyTotals).reduce((sum, min) => sum + min, 0);
        return Math.round(totalMinutes / weeks);
    },

    getDailyTotals() {
        const totals = {};
        const entries = this.getEntriesToAnalyze();
        
        entries.forEach(entry => {
            if (!totals[entry.date]) {
                totals[entry.date] = 0;
            }
            totals[entry.date] += entry.durationMinutes;
        });
        
        return totals;
    },

    getDailyTotalsByType() {
        const totals = {};
        const entries = this.getEntriesToAnalyze();
        
        entries.forEach(entry => {
            if (!totals[entry.date]) {
                totals[entry.date] = {};
            }
            if (!totals[entry.date][entry.typeId]) {
                totals[entry.date][entry.typeId] = 0;
            }
            totals[entry.date][entry.typeId] += entry.durationMinutes;
        });
        
        return totals;
    },

    getWeeklyTotals() {
        const totals = {};
        const entries = this.getEntriesToAnalyze();
        
        entries.forEach(entry => {
            const weekKey = this.getWeekKey(entry.date);
            if (!totals[weekKey]) {
                totals[weekKey] = 0;
            }
            totals[weekKey] += entry.durationMinutes;
        });
        
        return totals;
    },

    getWeeklyTotalsByType() {
        const totals = {};
        const entries = this.getEntriesToAnalyze();
        
        entries.forEach(entry => {
            const weekKey = this.getWeekKey(entry.date);
            if (!totals[weekKey]) {
                totals[weekKey] = {};
            }
            if (!totals[weekKey][entry.typeId]) {
                totals[weekKey][entry.typeId] = 0;
            }
            totals[weekKey][entry.typeId] += entry.durationMinutes;
        });
        
        return totals;
    },

    getWeekKey(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const firstDay = new Date(year, 0, 1);
        const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((days + firstDay.getDay() + 1) / 7);
        return `${year}-W${String(week).padStart(2, '0')}`;
    },

    getTotalTime() {
        const entries = this.getEntriesToAnalyze();
        return entries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
    },

    /**
     * Get total time per type for pie chart
     */
    getTimePerType() {
        const totals = {};
        const entries = this.getEntriesToAnalyze();
        
        entries.forEach(entry => {
            if (!totals[entry.typeId]) {
                totals[entry.typeId] = 0;
            }
            totals[entry.typeId] += entry.durationMinutes;
        });
        
        return totals;
    },

    getLastNDays(n) {
        const dailyTotalsByType = this.getDailyTotalsByType();
        const dates = [];
        const today = new Date();
        
        for (let i = n - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const typeData = {};
            App.data.types.forEach(type => {
                typeData[type.id] = (dailyTotalsByType[dateStr] && dailyTotalsByType[dateStr][type.id]) || 0;
            });
            
            dates.push({
                date: dateStr,
                byType: typeData
            });
        }
        
        return dates;
    },

    getLastNWeeks(n) {
        const weeklyTotalsByType = this.getWeeklyTotalsByType();
        const weeks = [];
        const today = new Date();
        
        for (let i = n - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - (i * 7));
            const weekKey = this.getWeekKey(date.toISOString().split('T')[0]);
            
            const typeData = {};
            App.data.types.forEach(type => {
                typeData[type.id] = (weeklyTotalsByType[weekKey] && weeklyTotalsByType[weekKey][type.id]) || 0;
            });
            
            weeks.push({
                week: weekKey,
                byType: typeData
            });
        }
        
        return weeks;
    },

    /**
     * Get data for time graph based on view mode
     */
    getTimeGraphData(view) {
        if (view === 'day') {
            // All days with entries (including gaps)
            return this.getAllDaysDataWithGaps();
        } else if (view === 'week') {
            // Group by weeks (including empty weeks)
            return this.getAllWeeksDataWithGaps();
        } else if (view === 'month') {
            // Current month's days (all days, not weeks)
            return this.getCurrentMonthDataAllDays();
        }
    },

    /**
     * Get all days from first to last entry (including days with 0 hours)
     */
    getAllDaysDataWithGaps() {
        const dailyTotalsByType = this.getDailyTotalsByType();
        const dates = Object.keys(dailyTotalsByType).sort();
        
        if (dates.length === 0) return [];
        
        // Get first and last date
        const firstDate = new Date(dates[0]);
        const lastDate = new Date(dates[dates.length - 1]);
        
        const data = [];
        const currentDate = new Date(firstDate);
        
        // Loop through all days from first to last
        while (currentDate <= lastDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            
            const typeData = {};
            let total = 0;
            
            App.data.types.forEach(type => {
                const minutes = (dailyTotalsByType[dateStr] && dailyTotalsByType[dateStr][type.id]) || 0;
                typeData[type.id] = minutes;
                total += minutes;
            });
            
            data.push({
                date: dateStr,
                total: total,
                byType: typeData
            });
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return data;
    },

    /**
     * Get all weeks from first to last entry (including weeks with 0 hours)
     */
    getAllWeeksDataWithGaps() {
        const weeklyTotalsByType = this.getWeeklyTotalsByType();
        const weeks = Object.keys(weeklyTotalsByType).sort();
        
        if (weeks.length === 0) return [];
        
        // Parse first and last week
        const firstWeek = weeks[0];
        const lastWeek = weeks[weeks.length - 1];
        
        const data = [];
        const allWeeks = this.getWeekRange(firstWeek, lastWeek);
        
        allWeeks.forEach(weekKey => {
            const typeData = {};
            let total = 0;
            
            App.data.types.forEach(type => {
                const minutes = (weeklyTotalsByType[weekKey] && weeklyTotalsByType[weekKey][type.id]) || 0;
                typeData[type.id] = minutes;
                total += minutes;
            });
            
            data.push({
                week: weekKey,
                total: total,
                byType: typeData
            });
        });
        
        return data;
    },

    /**
     * Get range of weeks between two week identifiers
     */
    getWeekRange(firstWeek, lastWeek) {
        const weeks = [];
        const [firstYear, firstWeekNum] = firstWeek.split('-W').map(Number);
        const [lastYear, lastWeekNum] = lastWeek.split('-W').map(Number);
        
        for (let year = firstYear; year <= lastYear; year++) {
            const startWeek = (year === firstYear) ? firstWeekNum : 1;
            const endWeek = (year === lastYear) ? lastWeekNum : 52;
            
            for (let week = startWeek; week <= endWeek; week++) {
                weeks.push(`${year}-W${String(week).padStart(2, '0')}`);
            }
        }
        
        return weeks;
    },

    /**
     * Get current month's ALL days (not just days with entries)
     */
    getCurrentMonthDataAllDays() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const dailyTotalsByType = this.getDailyTotalsByType();
        const data = [];
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            
            const typeData = {};
            let total = 0;
            
            App.data.types.forEach(type => {
                const minutes = (dailyTotalsByType[dateStr] && dailyTotalsByType[dateStr][type.id]) || 0;
                typeData[type.id] = minutes;
                total += minutes;
            });
            
            data.push({
                date: dateStr,
                day: day,
                total: total,
                byType: typeData
            });
        }
        
        return data;
    }
};

/**
 * Chart Rendering Module
 */
const ChartRenderer = {
    /**
     * Render pie chart showing type distribution
     */
    renderPieChart() {
        const canvas = document.getElementById('pieChart');
        const ctx = canvas.getContext('2d');
        
        if (App.charts.pie) {
            App.charts.pie.destroy();
        }
        
        const timePerType = Analytics.getTimePerType();
        const totalMinutes = Object.values(timePerType).reduce((sum, m) => sum + m, 0);
        
        if (totalMinutes === 0) {
            // Show empty state
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#64748b';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const labels = [];
        const data = [];
        const colors = [];
        
        App.data.types.forEach(type => {
            const minutes = timePerType[type.id] || 0;
            if (minutes > 0) {
                const percentage = ((minutes / totalMinutes) * 100).toFixed(1);
                labels.push(`${type.name} (${percentage}%)`);
                data.push(minutes / 60); // Convert to hours
                colors.push(type.color);
            }
        });
        
        App.charts.pie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: '#1e293b',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#f1f5f9',
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        borderColor: '#334155',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const hours = context.parsed;
                                const mins = Math.round((hours - Math.floor(hours)) * 60);
                                return `${context.label}: ${Math.floor(hours)}h ${mins}m`;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Render time graph based on current view
     */
    renderTimeGraph() {
        const canvas = document.getElementById('timeGraph');
        const ctx = canvas.getContext('2d');
        
        if (App.charts.timeGraph) {
            App.charts.timeGraph.destroy();
        }
        
        const view = App.currentTimeView;
        const data = Analytics.getTimeGraphData(view);
        
        if (!data || data.length === 0) {
            // Show empty state
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#64748b';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        let labels, datasets;
        
        if (view === 'day') {
            // Show dates (e.g., "15 Nov" or "15/11")
            labels = data.map(d => {
                const date = new Date(d.date + 'T00:00:00');
                return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            });
            
            datasets = App.data.types.map(type => ({
                label: type.name,
                data: data.map(d => (d.byType[type.id] || 0) / 60), // Convert to hours
                backgroundColor: type.color,
                borderColor: type.color,
                borderWidth: 0
            }));
            
        } else if (view === 'week') {
            // Show week labels
            labels = data.map(d => d.week);
            
            datasets = App.data.types.map(type => ({
                label: type.name,
                data: data.map(d => (d.byType[type.id] || 0) / 60), // Convert to hours
                backgroundColor: type.color,
                borderColor: type.color,
                borderWidth: 0
            }));
            
        } else if (view === 'month') {
            // Show day numbers
            labels = data.map(d => d.day.toString());
            
            datasets = App.data.types.map(type => ({
                label: type.name,
                data: data.map(d => (d.byType[type.id] || 0) / 60), // Convert to hours
                backgroundColor: type.color,
                borderColor: type.color,
                borderWidth: 0
            }));
        }
        
        // Calculate max value for flexible Y-axis
        const maxValue = Math.max(...data.map(d => d.total / 60)); // Convert to hours
        const suggestedMax = Math.ceil(maxValue); // Round up to nearest hour
        
        App.charts.timeGraph = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: this.getStackedBarOptions(view, suggestedMax)
        });
    },

    /**
     * Get common stacked bar chart options
     */
    getStackedBarOptions(view, suggestedMax) {
        return {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5, // Changed from 2 to 1.5 for a more square appearance
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#f1f5f9',
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const hours = context.parsed.y;
                            const mins = Math.round((hours - Math.floor(hours)) * 60);
                            return `${context.dataset.label}: ${Math.floor(hours)}h ${mins}m`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        color: '#334155',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: view === 'month' ? 9 : 11 },
                        maxRotation: view === 'day' ? 45 : (view === 'month' ? 90 : 0),
                        minRotation: view === 'day' ? 0 : (view === 'month' ? 45 : 0)
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    suggestedMax: suggestedMax > 0 ? suggestedMax : 1,
                    grid: {
                        color: '#334155',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 11 },
                        stepSize: 1, // Force whole hours
                        callback: function(value) {
                            return Math.round(value) + 'h';
                        }
                    }
                }
            }
        };
    }
};

/**
 * UI Rendering Module
 */
const UIRenderer = {
    renderAll() {
        this.renderSummary();
        this.renderTypes();
        this.renderEntries();
        this.renderCharts();
    },

    renderSummary() {
        const filteredEntries = FilterManager.getFilteredEntries();
        
        document.getElementById('dailyAverage').textContent = 
            EntryManager.formatDuration(Analytics.getDailyAverage());
        
        document.getElementById('weeklyAverage').textContent = 
            EntryManager.formatDuration(Analytics.getWeeklyAverage());
        
        document.getElementById('totalEntries').textContent = 
            filteredEntries.length;
        
        document.getElementById('totalTime').textContent = 
            EntryManager.formatDuration(Analytics.getTotalTime());
    },

    renderTypes() {
        const container = document.getElementById('typeList');
        
        if (App.data.types.length === 0) {
            container.innerHTML = '<p class="empty-state">No types defined. Click "Add Type" to create one.</p>';
            return;
        }
        
        container.innerHTML = App.data.types.map(type => `
            <div class="type-item" data-id="${type.id}">
                <div class="type-color-indicator" style="background-color: ${type.color};"></div>
                <div class="type-name">${this.escapeHtml(type.name)}</div>
                <div class="type-actions">
                    <button class="btn btn-secondary btn-small edit-type-btn" data-id="${type.id}">
                        <span class="icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </span>
                        Edit
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

    updateTypeDropdown() {
        const select = document.getElementById('taskType');
        const currentValue = select.value;
        
        select.innerHTML = '<option value="">Select a type...</option>' +
            App.data.types.map(type => 
                `<option value="${type.id}">${this.escapeHtml(type.name)}</option>`
            ).join('');
        
        if (currentValue && App.data.types.find(t => t.id === currentValue)) {
            select.value = currentValue;
        }
    },

    renderEntries() {
        const container = document.getElementById('entriesTableBody');
        const filteredEntries = FilterManager.getFilteredEntries();
        
        if (filteredEntries.length === 0) {
            container.innerHTML = '<p class="empty-state">No entries found. Try adjusting filters or add a new task.</p>';
            return;
        }
        
        this.renderEntriesSorted(filteredEntries);
    },

    renderEntriesSorted(filteredEntries) {
        const container = document.getElementById('entriesTableBody');
        
        container.innerHTML = filteredEntries.map(entry => {
            const type = TypeManager.getTypeById(entry.typeId);
            const typeName = type ? type.name : 'Unknown';
            const typeColor = type ? type.color : '#64748b';
            
            return `
                <div class="entry-row" data-id="${entry.id}">
                    <div class="entry-col entry-col-title" data-label="Title">${this.escapeHtml(entry.title)}</div>
                    <div class="entry-col entry-col-type" data-label="Type">
                        <span class="entry-type-dot" style="background-color: ${typeColor};"></span>
                        ${this.escapeHtml(typeName)}
                    </div>
                    <div class="entry-col entry-col-date" data-label="Date">${this.formatShortDate(entry.date)}</div>
                    <div class="entry-col entry-col-time" data-label="Start">${entry.startTime}</div>
                    <div class="entry-col entry-col-time" data-label="End">${entry.endTime}</div>
                    <div class="entry-col entry-col-duration" data-label="Duration">${EntryManager.formatDuration(entry.durationMinutes)}</div>
                    <div class="entry-col entry-col-actions">
                        <button class="entry-action-btn edit-btn" data-id="${entry.id}">Edit</button>
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

    renderCharts() {
        ChartRenderer.renderPieChart();
        ChartRenderer.renderTimeGraph();
    },

    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-GB', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    },

    formatShortDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-GB', { 
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${bgColor};
            color: white;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
            z-index: 10000;
            animation: slideIn 0.3s;
            font-weight: 600;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

/**
 * Modal Management
 */
const ModalManager = {
    openAddModal() {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        
        form.reset();
        document.getElementById('taskDate').valueAsDate = new Date();
        document.getElementById('modalTitle').textContent = 'Add Task';
        
        App.editingId = null;
        modal.classList.add('active');
        
        UIRenderer.updateTypeDropdown();
    },

    openEditModal(id) {
        const entry = App.data.entries.find(e => e.id === id);
        if (!entry) return;
        
        const modal = document.getElementById('taskModal');
        
        document.getElementById('taskTitle').value = entry.title;
        document.getElementById('taskType').value = entry.typeId;
        document.getElementById('taskDate').value = entry.date;
        document.getElementById('taskStartTime').value = entry.startTime;
        document.getElementById('taskEndTime').value = entry.endTime;
        
        this.updateDurationDisplay();
        document.getElementById('modalTitle').textContent = 'Edit Task';
        
        App.editingId = id;
        modal.classList.add('active');
    },

    closeModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('active');
        App.editingId = null;
    },

    updateDurationDisplay() {
        const startTime = document.getElementById('taskStartTime').value;
        const endTime = document.getElementById('taskEndTime').value;
        
        if (startTime && endTime) {
            const duration = EntryManager.calculateDuration(startTime, endTime);
            document.getElementById('durationDisplay').textContent = 
                EntryManager.formatDuration(duration);
        } else {
            document.getElementById('durationDisplay').textContent = '0h 0m';
        }
    },

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('taskTitle').value,
            typeId: document.getElementById('taskType').value,
            date: document.getElementById('taskDate').value,
            startTime: document.getElementById('taskStartTime').value,
            endTime: document.getElementById('taskEndTime').value
        };
        
        if (!formData.typeId) {
            alert('Please select a type!');
            return;
        }
        
        const duration = EntryManager.calculateDuration(formData.startTime, formData.endTime);
        if (duration <= 0) {
            alert('End time must be after start time!');
            return;
        }
        
        if (App.editingId) {
            EntryManager.updateEntry(App.editingId, formData);
        } else {
            EntryManager.addEntry(formData);
        }
        
        this.closeModal();
    }
};

const TypeModalManager = {
    openAddModal() {
        const modal = document.getElementById('typeModal');
        const form = document.getElementById('typeForm');
        
        form.reset();
        document.getElementById('typeColor').value = '#3b82f6';
        document.getElementById('colorPreview').style.backgroundColor = '#3b82f6';
        document.getElementById('typeModalTitle').textContent = 'Add Type';
        
        App.editingTypeId = null;
        modal.classList.add('active');
    },

    openEditModal(id) {
        const type = TypeManager.getTypeById(id);
        if (!type) return;
        
        const modal = document.getElementById('typeModal');
        
        document.getElementById('typeName').value = type.name;
        document.getElementById('typeColor').value = type.color;
        document.getElementById('colorPreview').style.backgroundColor = type.color;
        document.getElementById('typeModalTitle').textContent = 'Edit Type';
        
        App.editingTypeId = id;
        modal.classList.add('active');
    },

    closeModal() {
        const modal = document.getElementById('typeModal');
        modal.classList.remove('active');
        App.editingTypeId = null;
    },

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('typeName').value,
            color: document.getElementById('typeColor').value
        };
        
        if (App.editingTypeId) {
            TypeManager.updateType(App.editingTypeId, formData);
        } else {
            TypeManager.addType(formData);
        }
        
        this.closeModal();
    }
};

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
        CacheManager.saveCache(); // Save filters to cache
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
        
        CacheManager.saveCache(); // Update cache
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
            
            const typeName = UIRenderer.escapeHtml(type.name);
            
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

/**
 * Sorting Module
 * Handles sorting of entries by different columns
 */
const SortManager = {
    currentColumn: null,
    currentDirection: 'desc', // 'asc' or 'desc'

    sortEntries(column) {
        // Toggle direction if clicking same column
        if (this.currentColumn === column) {
            this.currentDirection = this.currentDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentColumn = column;
            this.currentDirection = 'desc'; // Default to descending for new column
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
        } catch (error) {
            console.error('Error saving to cache:', error);
            // Handle quota exceeded or other storage errors
            if (error.name === 'QuotaExceededError') {
                UIRenderer.showNotification('Cache storage full. Please save your data manually.', 'error');
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

/**
 * Event Listeners Setup
 */
function setupEventListeners() {
    // Top bar buttons
    document.getElementById('loadDataBtn').addEventListener('click', () => {
        DataManager.loadData();
    });
    
    document.getElementById('saveDataBtn').addEventListener('click', () => {
        DataManager.saveData();
    });
    
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        ModalManager.openAddModal();
    });
    
    document.getElementById('addTypeBtn').addEventListener('click', () => {
        TypeModalManager.openAddModal();
    });

    // Filter controls
    const filterTypeSelect = document.getElementById('filterType');
    const filterTrigger = filterTypeSelect.querySelector('.custom-select-trigger');
    const filterDropdown = filterTypeSelect.querySelector('.custom-select-dropdown');
    
    // Toggle dropdown
    filterTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        filterTypeSelect.classList.toggle('open');
    });
    
    // Handle option selection
    filterDropdown.addEventListener('click', (e) => {
        const option = e.target.closest('.custom-option');
        if (!option) return;
        
        const value = option.dataset.value;
        const text = option.querySelector('.option-text').textContent;
        
        // Update selection
        App.filters.typeId = value;
        filterTrigger.querySelector('.selected-text').textContent = text;
        
        // Update selected class
        filterDropdown.querySelectorAll('.custom-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        option.classList.add('selected');
        
        // Close dropdown
        filterTypeSelect.classList.remove('open');
        
        // Apply filters
        FilterManager.applyFilters();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!filterTypeSelect.contains(e.target)) {
            filterTypeSelect.classList.remove('open');
        }
    });
    
    // Keyboard support
    filterTypeSelect.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            filterTypeSelect.classList.toggle('open');
        } else if (e.key === 'Escape') {
            filterTypeSelect.classList.remove('open');
        }
    });

    // Date filter controls with calendar picker enhancement
    const filterDateStart = document.getElementById('filterDateStart');
    const filterDateEnd = document.getElementById('filterDateEnd');
    
    // Make clicking anywhere on the input open the calendar
    filterDateStart.addEventListener('click', function(e) {
        this.showPicker();
    });
    
    filterDateEnd.addEventListener('click', function(e) {
        this.showPicker();
    });
    
    // Handle date changes
    filterDateStart.addEventListener('change', (e) => {
        App.filters.dateStart = e.target.value;
        FilterManager.applyFilters();
    });

    filterDateEnd.addEventListener('change', (e) => {
        App.filters.dateEnd = e.target.value;
        FilterManager.applyFilters();
    });

    document.getElementById('clearFiltersBtn').addEventListener('click', () => {
        FilterManager.clearFilters();
    });
    
    // Sortable headers
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-sort');
            SortManager.sortEntries(column);
        });
    });
    
    // Task modal controls
    document.getElementById('closeModal').addEventListener('click', () => {
        ModalManager.closeModal();
    });
    
    document.getElementById('cancelBtn').addEventListener('click', () => {
        ModalManager.closeModal();
    });
    
    document.getElementById('taskModal').addEventListener('click', (e) => {
        if (e.target.id === 'taskModal') {
            ModalManager.closeModal();
        }
    });
    
    document.getElementById('taskForm').addEventListener('submit', (e) => {
        ModalManager.handleFormSubmit(e);
    });
    
    // Task modal date input with calendar picker
    const taskDateInput = document.getElementById('taskDate');
    taskDateInput.addEventListener('click', function(e) {
        this.showPicker();
    });
    
    document.getElementById('taskStartTime').addEventListener('change', () => {
        ModalManager.updateDurationDisplay();
    });
    
    document.getElementById('taskEndTime').addEventListener('change', () => {
        ModalManager.updateDurationDisplay();
    });
    
    // Type modal controls
    document.getElementById('closeTypeModal').addEventListener('click', () => {
        TypeModalManager.closeModal();
    });
    
    document.getElementById('cancelTypeBtn').addEventListener('click', () => {
        TypeModalManager.closeModal();
    });
    
    document.getElementById('typeModal').addEventListener('click', (e) => {
        if (e.target.id === 'typeModal') {
            TypeModalManager.closeModal();
        }
    });
    
    document.getElementById('typeForm').addEventListener('submit', (e) => {
        TypeModalManager.handleFormSubmit(e);
    });
    
    document.getElementById('typeColor').addEventListener('input', (e) => {
        document.getElementById('colorPreview').style.backgroundColor = e.target.value;
    });
    
    // View switcher for time graph
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            App.currentTimeView = view;
            
            // Update active state
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Re-render time graph
            ChartRenderer.renderTimeGraph();
        });
    });
    
    // Window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            UIRenderer.renderCharts();
        }, 250);
    });
}

/**
 * Initialize Application
 */
function initApp() {
    // Try to load from cache first
    const cacheLoaded = CacheManager.loadCache();
    
    if (!cacheLoaded) {
        // No cache, start with empty data
        App.data = DataManager.createEmptyData();
    }
    
    setupEventListeners();
    UIRenderer.renderAll();
    
    if (cacheLoaded) {
        console.log('Time Tracker initialized with cached data');
        // Show subtle notification that data was restored
        setTimeout(() => {
            UIRenderer.showNotification('Previous session restored from cache', 'success');
        }, 500);
    } else {
        console.log('Time Tracker initialized - no cached data found');
    }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
