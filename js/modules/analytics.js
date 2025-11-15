/**
 * Analytics Module
 * Calculates statistics and aggregates data for charts and summaries
 */
const Analytics = {
    /**
     * Get entries to analyze (filtered or all)
     */
    getEntriesToAnalyze() {
        return FilterManager.getFilteredEntries();
    },

    /**
     * Calculate daily average
     */
    getDailyAverage() {
        const dailyTotals = this.getDailyTotals();
        const days = Object.keys(dailyTotals).length;
        
        if (days === 0) return 0;
        
        const totalMinutes = Object.values(dailyTotals).reduce((sum, min) => sum + min, 0);
        return Math.round(totalMinutes / days);
    },

    /**
     * Calculate weekly average
     */
    getWeeklyAverage() {
        const weeklyTotals = this.getWeeklyTotals();
        const weeks = Object.keys(weeklyTotals).length;
        
        if (weeks === 0) return 0;
        
        const totalMinutes = Object.values(weeklyTotals).reduce((sum, min) => sum + min, 0);
        return Math.round(totalMinutes / weeks);
    },

    /**
     * Get total time across all entries
     */
    getTotalTime() {
        const entries = this.getEntriesToAnalyze();
        return entries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
    },

    /**
     * Get daily totals (minutes per day)
     */
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

    /**
     * Get daily totals by type
     */
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

    /**
     * Get weekly totals (minutes per week)
     */
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

    /**
     * Get weekly totals by type
     */
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

    /**
     * Get week key from date (e.g., "2024-W01")
     */
    getWeekKey(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const firstDay = new Date(year, 0, 1);
        const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((days + firstDay.getDay() + 1) / 7);
        return `${year}-W${String(week).padStart(2, '0')}`;
    },

    /**
     * Get data for time graph based on view mode
     */
    getTimeGraphData(view) {
        if (view === 'day') {
            return this.getAllDaysDataWithGaps();
        } else if (view === 'week') {
            return this.getAllWeeksDataWithGaps();
        } else if (view === 'month') {
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
        
        const firstDate = new Date(dates[0]);
        const lastDate = new Date(dates[dates.length - 1]);
        
        const data = [];
        const currentDate = new Date(firstDate);
        
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

window.Analytics = Analytics;
