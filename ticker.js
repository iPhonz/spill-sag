class TrendingTicker {
    constructor() {
        this.tickerTrack = document.getElementById('tickerTrack');
        this.trends = [];
        this.isInitialized = false;
    }

    updateTrends(trends) {
        if (!this.tickerTrack) return;
        this.trends = trends;

        const tickerContent = trends.map(trend => `
            <div class="ticker-item">
                <span class="trend-text">${trend.phrase}</span>
                <span class="trend-count">(${trend.count})</span>
                <span class="trend-topics">${trend.topics.join(', ')}</span>
            </div>
        `).join('');

        this.tickerTrack.innerHTML = tickerContent + tickerContent;

        // Update trending sidebar
        const trendingTopics = document.getElementById('trendingTopics');
        if (trendingTopics) {
            trendingTopics.innerHTML = trends.map(trend => `
                <div class="trending-topic">
                    <div class="topic-header">
                        <span class="topic-name">${trend.phrase}</span>
                    </div>
                    <div class="topic-details">
                        <span>${trend.displayCount}</span>
                        <span class="topic-category">${trend.topics[0]}</span>
                    </div>
                </div>
            `).join('');
        }
    }
}