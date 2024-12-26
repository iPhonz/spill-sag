class TrendingTicker {
    constructor() {
        this.tickerEl = document.getElementById('trendingTicker');
        this.sidebarEl = document.getElementById('trendingTopics');
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const trendItem = e.target.closest('.trend-item, .trending-topic');
            if (trendItem) {
                const trendData = trendItem.dataset.trend;
                if (trendData) {
                    this.handleTrendClick(JSON.parse(trendData));
                }
            }
        });
    }

    handleTrendClick(trend) {
        // Filter article grid to show only articles related to this trend
        if (window.app && typeof window.app.filterByTrend === 'function') {
            window.app.filterByTrend(trend);
        }

        // Highlight selected trend
        this.highlightTrend(trend.name);
    }

    highlightTrend(trendName) {
        const items = document.querySelectorAll('.trend-item, .trending-topic');
        items.forEach(item => {
            const data = JSON.parse(item.dataset.trend || '{}');
            item.classList.toggle('active', data.name === trendName);
        });
    }

    update(trends) {
        if (this.tickerEl) {
            this.tickerEl.innerHTML = trends.map(trend => 
                `<div class="trend-item" data-trend='${JSON.stringify(trend)}'>
                    <span class="trend-name">${trend.name}</span>
                    <span class="trend-count">(${trend.count})</span>
                    <span class="trend-topic">${trend.topic}</span>
                </div>`
            ).join('');
        }

        if (this.sidebarEl) {
            this.sidebarEl.innerHTML = trends.map(trend =>
                `<div class="trending-topic" data-trend='${JSON.stringify(trend)}'>
                    <div class="topic-name">${trend.name}</div>
                    <div class="topic-meta">
                        <span>${trend.display}</span>
                        <span class="topic-category">${trend.topic}</span>
                    </div>
                </div>`
            ).join('');
        }
    }
}