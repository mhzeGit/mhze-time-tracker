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

        // Determine if on mobile
        const isMobile = window.innerWidth <= 768;
        const legendFontSize = isMobile ? 9 : 12;
        const legendPadding = isMobile ? 8 : 15;
        const legendBoxSize = isMobile ? 8 : 12;

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
                            padding: legendPadding,
                            font: { size: legendFontSize },
                            usePointStyle: true,
                            pointStyle: 'rectRounded',
                            boxWidth: legendBoxSize,
                            boxHeight: legendBoxSize
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
            options: this.getStackedBarOptions(view, suggestedMax),
            plugins: [this.multiTooltipPlugin]
        });
    },

    /**
     * Custom plugin to render single tooltip for hovered stacked bar segment
     */
    multiTooltipPlugin: {
        id: 'multiTooltipPlugin',
        afterInit(chart) {
            if (chart.config.type !== 'bar') return;
            const canvas = chart.canvas;
            const parent = canvas.parentNode;
            const style = getComputedStyle(parent);
            if (style.position === 'static') parent.style.position = 'relative';
            parent.style.overflow = 'visible';
            const container = document.createElement('div');
            Object.assign(container.style, { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '10', overflow: 'visible' });
            parent.appendChild(container);
            chart.$multiTooltip = { container };
        },
        afterEvent(chart, args) {
            if (chart.config.type !== 'bar') return;
            const mt = chart.$multiTooltip; if (!mt) return;
            const { event } = args; if (!event) return;

            const clearTips = () => { Array.from(mt.container.querySelectorAll('[data-tip-id]')).forEach(el => el.remove()); };

            if (event.type === 'mouseout') { clearTips(); return; }

            const actives = chart.getActiveElements();
            if (!actives || actives.length === 0) { clearTips(); return; }

            // Helper to validate a target and return its element/value or null
            const validateTarget = (dsIndex, idx) => {
                const meta = chart.getDatasetMeta(dsIndex);
                const el = meta && meta.data ? meta.data[idx] : null; if (!el) return null;
                const value = chart.data.datasets[dsIndex].data[idx]; if (!value || value <= 0) return null;
                const props = el.getProps(['x','y','base','width','height'], true);
                // ignore completely collapsed segments
                if (!props || !isFinite(props.x) || Math.abs(props.height) === 0) return null;
                return { el, value, props };
            };

            // Start from the primary active
            let a = actives[0];
            let target = validateTarget(a.datasetIndex, a.index);

            // Fallback: if nearest element is zero/invalid, pick closest non-zero segment in same index
            if (!target) {
                const idx = a.index;
                let best = null;
                for (let d = 0; d < chart.data.datasets.length; d++) {
                    const cand = validateTarget(d, idx);
                    if (!cand) continue;
                    const dist = Math.abs((event.y ?? 0) - (Math.min(cand.props.y, cand.props.base) + Math.abs(cand.props.height)/2));
                    if (!best || dist < best.dist) best = { ds: d, ...cand, dist };
                }
                if (best) {
                    a = { datasetIndex: best.ds, index: a.index };
                    target = { el: best.el, value: best.value, props: best.props };
                }
            }

            if (!target) { clearTips(); return; }

            const used = new Set();
            const id = `${a.datasetIndex}:${a.index}`; used.add(id);
            let tip = mt.container.querySelector(`[data-tip-id="${id}"]`);
            if (!tip) {
                tip = document.createElement('div'); tip.setAttribute('data-tip-id', id);
                Object.assign(tip.style, { position: 'absolute', border: 'none', borderRadius: '6px', padding: '6px 8px', font: '11px sans-serif', whiteSpace: 'nowrap', pointerEvents: 'none', transform: 'translateY(-50%)', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '6px', filter: 'drop-shadow(0 0 0 rgba(0,0,0,0.55)) drop-shadow(0 4px 8px rgba(0,0,0,0.35))' });
                const colorBox = document.createElement('span'); colorBox.className = 'cb'; Object.assign(colorBox.style, { width: '8px', height: '8px', borderRadius: '2px', flex: '0 0 auto', opacity: '0.55', background: '#000' }); tip.appendChild(colorBox);
                const text = document.createElement('span'); text.className = 'txt'; tip.appendChild(text);
                const arrowWrapper = document.createElement('div'); arrowWrapper.className = 'arr'; Object.assign(arrowWrapper.style, { position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '8px', height: '16px', pointerEvents: 'none' }); tip.appendChild(arrowWrapper);
                mt.container.appendChild(tip);
            }

            // helper to derive darker text color from background
            const deriveTextColor = (hex) => {
                if (!hex || typeof hex !== 'string') return '#0f172a';
                if (hex.startsWith('rgb')) return '#0f172a';
                if (hex[0] === '#') hex = hex.slice(1);
                if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
                if (hex.length !== 6) return '#0f172a';
                const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
                const rn = r/255, gn = g/255, bn = b/255;
                const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
                let h, s; const l = (max+min)/2;
                if (max === min) { h = 0; s = 0; } else {
                    const d = max - min;
                    s = l > .5 ? d/(2-max-min) : d/(max+min);
                    switch(max){case rn: h=(gn-bn)/d+(gn<bn?6:0); break; case gn: h=(bn-rn)/d+2; break; case bn: h=(rn-gn)/d+4; break; }
                    h/=6;
                }
                const l2 = Math.max(0, Math.min(1, l * 0.45));
                const s2 = Math.max(0, Math.min(1, s * 0.5));
                const hue2rgb = (p,q,t)=>{ if(t<0) t+=1; if(t>1) t-=1; if(t<1/6) return p+(q-p)*6*t; if(t<1/2) return q; if(t<2/3) return p+(q-p)*(2/3 - t)*6; return p; };
                let r2,g2,b2; if(s2===0){ r2=g2=b2=l2; } else { const q = l2 < .5 ? l2 * (1+s2) : l2 + s2 - l2*s2; const p = 2*l2 - q; r2 = hue2rgb(p,q,h+1/3); g2 = hue2rgb(p,q,h); b2 = hue2rgb(p,q,h-1/3);} 
                return `rgb(${Math.round(r2*255)},${Math.round(g2*255)},${Math.round(b2*255)})`;
            };

            const dsColor = chart.data.datasets[a.datasetIndex].backgroundColor;
            tip.style.background = dsColor;
            const textColor = deriveTextColor(dsColor);
            const txt = tip.querySelector('.txt'); if (txt) { txt.style.color = textColor; txt.style.textShadow = 'none'; }
            const cb = tip.querySelector('.cb'); if (cb) cb.style.background = textColor;
            const hours = target.value; const h = Math.floor(hours); const mins = Math.round((hours - h) * 60); if (txt) txt.textContent = `${chart.data.datasets[a.datasetIndex].label}: ${h}h ${mins}m`;

            // position tooltip to left of the hovered segment
            const props = target.props;
            const segmentLeft = props.x - props.width / 2; const topY = Math.min(props.y, props.base); const centerY = topY + Math.abs(props.height)/2;
            const gap = 8; const tipWidth = tip.offsetWidth || 0; const left = segmentLeft - gap - tipWidth;
            tip.style.left = `${Math.round(left)}px`; tip.style.top = `${Math.round(centerY)}px`;

            // right-pointing arrow
            const arrowWrapper = tip.querySelector('.arr'); if (arrowWrapper) {
                arrowWrapper.innerHTML = '';
                const arrowWidth = 7; const arrowHeight = tip.offsetHeight;
                arrowWrapper.style.top = '0'; arrowWrapper.style.transform = 'none';
                tip.style.borderTopRightRadius = '0px'; tip.style.borderBottomRightRadius = '0px';
                Object.assign(arrowWrapper.style, { right: `-${arrowWidth}px`, left: '' });
                arrowWrapper.style.width = `${arrowWidth}px`; arrowWrapper.style.height = `${arrowHeight}px`;
                const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('width', `${arrowWidth}`); svg.setAttribute('height', `${arrowHeight}`); svg.setAttribute('viewBox', `0 0 ${arrowWidth} ${arrowHeight}`); svg.style.display = 'block';
                const poly = document.createElementNS('http://www.w3.org/2000/svg','polygon');
                poly.setAttribute('points', `${arrowWidth},${arrowHeight/2} 0,0 0,${arrowHeight}`);
                poly.setAttribute('fill', dsColor); poly.setAttribute('stroke','none');
                svg.appendChild(poly); arrowWrapper.appendChild(svg);
            }

            // cleanup any stale tips
            Array.from(mt.container.querySelectorAll('[data-tip-id]')).forEach(el => { const rid = el.getAttribute('data-tip-id'); if (!used.has(rid)) el.remove(); });
        },
        afterDestroy(chart) { const mt = chart.$multiTooltip; if (mt && mt.container && mt.container.parentNode) mt.container.parentNode.removeChild(mt.container); chart.$multiTooltip = null; }
    },

    /**
     * Get common stacked bar chart options
     */
    getStackedBarOptions(view, suggestedMax) {
        // Determine if on mobile
        const isMobile = window.innerWidth <= 768;
        const legendFontSize = isMobile ? 9 : 12;
        const legendPadding = isMobile ? 8 : 15;
        const legendBoxSize = isMobile ? 8 : 12;
        const axisFontSize = isMobile ? 9 : 11;
        
        return {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            interaction: {
                mode: 'nearest',
                intersect: false // allow hover detection in gaps between bars (full-width collider)
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#f1f5f9',
                        padding: legendPadding,
                        font: { size: legendFontSize },
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                        boxWidth: legendBoxSize,
                        boxHeight: legendBoxSize
                    }
                },
                tooltip: {
                    enabled: false, // disable default tooltip; we render custom tooltip
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 12
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
                        font: { size: axisFontSize },
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
                        font: { size: axisFontSize },
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
