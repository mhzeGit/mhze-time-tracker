/**
 * Chart Rendering Module
 * Handles rendering of pie chart and time graph using Chart.js
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
            labels = data.map(d => {
                const date = new Date(d.date + 'T00:00:00');
                return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            });

            datasets = App.data.types.map(type => ({
                label: type.name,
                data: data.map(d => (d.byType[type.id] || 0) / 60),
                backgroundColor: type.color,
                borderColor: type.color,
                borderWidth: 0
            }));

        } else if (view === 'week') {
            labels = data.map(d => d.week);

            datasets = App.data.types.map(type => ({
                label: type.name,
                data: data.map(d => (d.byType[type.id] || 0) / 60),
                backgroundColor: type.color,
                borderColor: type.color,
                borderWidth: 0
            }));

        } else if (view === 'month') {
            labels = data.map(d => {
                const [year, month] = d.month.split('-');
                const date = new Date(year, month - 1);
                return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
            });

            datasets = App.data.types.map(type => ({
                label: type.name,
                data: data.map(d => (d.byType[type.id] || 0) / 60),
                backgroundColor: type.color,
                borderColor: type.color,
                borderWidth: 0
            }));
        }

        const maxValue = Math.max(...data.map(d => d.total / 60));
        const suggestedMax = Math.ceil(maxValue);

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
            aspectRatio: 1.5,
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
                        font: { size: view === 'month' ? 11 : 11 },
                        maxRotation: view === 'day' ? 45 : (view === 'month' ? 45 : 0),
                        minRotation: view === 'day' ? 0 : (view === 'month' ? 0 : 0)
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
                        stepSize: 1,
                        callback: function(value) {
                            return Math.round(value) + 'h';
                        }
                    }
                }
            }
        };
    }
};

window.ChartRenderer = ChartRenderer;
