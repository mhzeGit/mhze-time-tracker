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
     * Get entries excluding off-day types (for statistics calculations)
     */
    getEntriesToAnalyzeExcludingOffDays() {
        const entries = this.getEntriesToAnalyze();
        return entries.filter(entry => !entry.isOffDay);
    },

    /**
     * Calculate daily average
     */
    getDailyAverage() {
        const dailyTotals = this.getDailyTotalsExcludingOffDays();
        const days = Object.keys(dailyTotals).length;
        
        if (days === 0) return 0;
        
        const totalMinutes = Object.values(dailyTotals).reduce((sum, min) => sum + min, 0);
        return Math.round(totalMinutes / days);
    },

    /**
     * Calculate weekly average
     */
    getWeeklyAverage() {
        const weeklyTotals = this.getWeeklyTotalsExcludingOffDays();
        const weeks = Object.keys(weeklyTotals).length;
        
        if (weeks === 0) return 0;
        
        const totalMinutes = Object.values(weeklyTotals).reduce((sum, min) => sum + min, 0);
        return Math.round(totalMinutes / weeks);
    },

    /**
     * Get total time across all entries (excluding off-days)
     */
    getTotalTime() {
        const entries = this.getEntriesToAnalyzeExcludingOffDays();
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
     * Get daily totals excluding off-days (for statistics)
     */
    getDailyTotalsExcludingOffDays() {
        const totals = {};
        const entries = this.getEntriesToAnalyzeExcludingOffDays();
        
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
     * Updated to filter out off-day entries completely if user wants to skip them visually
     * But user says "skips those dasy visually in the graph too"
     * If we want to skip days visually, we need to ensure they don't contribute to "gaps" either if they are the boundary?
     * Or simply filter them out here.
     * Currently `getEntriesToAnalyze` returns everything from FilterManager.
     * If we filter out `isOffDay` entries here, they won't appear in the graph.
     */
    getDailyTotalsByType() {
        const totals = {};
        // Use excluding off-days to hide them from graph entirely
        const entries = this.getEntriesToAnalyzeExcludingOffDays();
        
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
     * Get weekly totals excluding off-days (for statistics)
     */
    getWeeklyTotalsExcludingOffDays() {
        const totals = {};
        const entries = this.getEntriesToAnalyzeExcludingOffDays();
        
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
        // Use excluding off-days to hide them from graph entirely
        const entries = this.getEntriesToAnalyzeExcludingOffDays();
        
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
        const entries = this.getEntriesToAnalyzeExcludingOffDays();
        
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
            return this.getAllMonthsDataWithGaps();
        }
    },

    /**
     * Get off-day date set (all individual dates that are off)
     */
    getOffDayDatesSet() {
        const offDates = new Set();
        
        App.data.entries
            .filter(e => e.isOffDay === true)
            .forEach(e => {
                // Handle both range entries (with endDate) and single-date off-day entries
                const startDateStr = e.date;
                const endDateStr = e.endDate || e.date; // If no endDate, use date as both start and end
                
                // Parse dates properly
                const startDate = new Date(startDateStr + 'T12:00:00'); // Use noon to avoid timezone issues
                const endDate = new Date(endDateStr + 'T12:00:00');
                
                // Add each individual date in the range to the set
                const current = new Date(startDate);
                while (current <= endDate) {
                    const year = current.getFullYear();
                    const month = String(current.getMonth() + 1).padStart(2, '0');
                    const day = String(current.getDate()).padStart(2, '0');
                    offDates.add(`${year}-${month}-${day}`);
                    current.setDate(current.getDate() + 1);
                }
            });
        
        return offDates;
    },

    /**
     * Check if a date string is an off-day
     */
    isDateOff(dateStr) {
        const offDates = this.getOffDayDatesSet();
        return offDates.has(dateStr);
    },

    /**
     * Get all days from first to last entry (including days with 0 hours, but IGNORING Off Days)
     */
    getAllDaysDataWithGaps() {
        const dailyTotalsByType = this.getDailyTotalsByType();
        const dates = Object.keys(dailyTotalsByType).sort();
        
        if (dates.length === 0) return [];
        
        // Get off-day dates set for fast lookup
        const offDates = this.getOffDayDatesSet();
        
        const firstDate = new Date(dates[0] + 'T00:00:00');
        const lastDate = new Date(dates[dates.length - 1] + 'T00:00:00');
        
        const data = [];
        const currentDate = new Date(firstDate);
        
        while (currentDate <= lastDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            
            // SKIP this date if it is an Off Day
            if (offDates.has(dateStr)) {
                currentDate.setDate(currentDate.getDate() + 1);
                continue;
            }

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
     * Get off-day date ranges (for week/month level checks)
     */
    getOffDayRanges() {
        return App.data.entries
            .filter(e => e.isOffDay === true)
            .map(e => {
                if (e.endDate) {
                    return { start: e.date, end: e.endDate };
                }
                return { start: e.date, end: e.date };
            });
    },

    /**
     * Check if a week is completely covered by off-days
     */
    isWeekFullyOff(weekKey) {
        const offDates = this.getOffDayDatesSet();
        
        // Calculate week date range
        const [year, weekNum] = weekKey.split('-W').map(Number);
        
        // Simple ISO week calculation
        const simpleDate = new Date(year, 0, 1 + (weekNum - 1) * 7);
        const dayOfWeek = simpleDate.getDay();
        const isoWeekStart = new Date(simpleDate);
        if (dayOfWeek <= 4) {
            isoWeekStart.setDate(simpleDate.getDate() - simpleDate.getDay() + 1);
        } else {
            isoWeekStart.setDate(simpleDate.getDate() + 8 - simpleDate.getDay());
        }
        
        // Check if ALL 7 days of the week are off
        const current = new Date(isoWeekStart);
        for (let i = 0; i < 7; i++) {
            const dateStr = current.toISOString().split('T')[0];
            if (!offDates.has(dateStr)) {
                return false; // At least one day is not off
            }
            current.setDate(current.getDate() + 1);
        }
        return true;
    },

    /**
     * Check if a month is completely covered by off-days
     */
    isMonthFullyOff(monthKey) {
        const offDates = this.getOffDayDatesSet();
        
        const [year, month] = monthKey.split('-').map(Number);
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0); // Last day of month
        
        // Check if ALL days of the month are off
        const current = new Date(monthStart);
        while (current <= monthEnd) {
            const dateStr = current.toISOString().split('T')[0];
            if (!offDates.has(dateStr)) {
                return false; // At least one day is not off
            }
            current.setDate(current.getDate() + 1);
        }
        return true;
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
            // Skip weeks that are fully covered by off-days
            if (this.isWeekFullyOff(weekKey)) {
                return;
            }

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
     * Get monthly totals by type
     */
    getMonthlyTotalsByType() {
        const totals = {};
        // Use excluding off-days to hide them from graph entirely
        const entries = this.getEntriesToAnalyzeExcludingOffDays();

        entries.forEach(entry => {
            const monthKey = this.getMonthKey(entry.date);
            if (!totals[monthKey]) {
                totals[monthKey] = {};
            }
            if (!totals[monthKey][entry.typeId]) {
                totals[monthKey][entry.typeId] = 0;
            }
            totals[monthKey][entry.typeId] += entry.durationMinutes;
        });

        return totals;
    },

    /**
     * Get month key from date (e.g., "2024-01" for January 2024)
     */
    getMonthKey(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    },

    /**
     * Get all months from first to last entry (including months with 0 hours)
     */
    getAllMonthsDataWithGaps() {
        const monthlyTotalsByType = this.getMonthlyTotalsByType();
        const months = Object.keys(monthlyTotalsByType).sort();

        if (months.length === 0) return [];

        const firstMonth = months[0];
        const lastMonth = months[months.length - 1];

        const data = [];
        const allMonths = this.getMonthRange(firstMonth, lastMonth);

        allMonths.forEach(monthKey => {
            // Skip months that are fully covered by off-days
            if (this.isMonthFullyOff(monthKey)) {
                return;
            }

            const typeData = {};
            let total = 0;

            App.data.types.forEach(type => {
                const minutes = (monthlyTotalsByType[monthKey] && monthlyTotalsByType[monthKey][type.id]) || 0;
                typeData[type.id] = minutes;
                total += minutes;
            });

            data.push({
                month: monthKey,
                total: total,
                byType: typeData
            });
        });

        return data;
    },

    /**
     * Get range of months between two month identifiers
     */
    getMonthRange(firstMonth, lastMonth) {
        const months = [];
        const [firstYear, firstMonthNum] = firstMonth.split('-').map(Number);
        const [lastYear, lastMonthNum] = lastMonth.split('-').map(Number);

        for (let year = firstYear; year <= lastYear; year++) {
            const startMonth = (year === firstYear) ? firstMonthNum : 1;
            const endMonth = (year === lastYear) ? lastMonthNum : 12;

            for (let month = startMonth; month <= endMonth; month++) {
                months.push(`${year}-${String(month).padStart(2, '0')}`);
            }
        }

        return months;
    }
};

window.Analytics = Analytics;
