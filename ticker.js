class TrendingTicker {
    constructor() {
        this.tickerEl = document.getElementById('trendingTicker');
        this.sidebarEl = document.getElementById('trendingTopics');
    }

    update(trends) {
        if (this.tickerEl) {
            this.tickerEl.innerHTML = trends.map(t => 
                `<div class="trend-item">
                    <span>${t.name}</span>
                    <span class="count">(${t.count})</span>
                    <span class="bullet">•</span>
                </div>`
            ).join('');
        }

        if (this.sidebarEl) {
            this.sidebarEl.innerHTML = trends.map(t =>
                `<div class="trending-topic">
                    <div class="topic-name">${t.name}</div>
                    <div class="topic-meta">
                        <span>${t.display}</span>
                        <span class="topic-category">${t.topic}</span>
                    </div>
                </div>`
            ).join('');
        }
    }
}