class TrendingTicker {
    constructor() {
        this.tickerTrack = document.getElementById('tickerTrack');
        this.trends = [];
        this.isInitialized = false;
        this.animationSpeed = 50; // px per second
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            this.tickerTrack = document.getElementById('tickerTrack');
            if (this.trends.length > 0) {
                this.updateTrends(this.trends);
            }
        });
    }

    updateTrends(trends) {
        if (!this.tickerTrack) return;
        this.trends = trends;

        const tickerContent = trends.map(trend => this.createTickerItem(trend)).join('');
        this.tickerTrack.innerHTML = tickerContent + tickerContent;

        if (!this.isInitialized) {
            this.initializeAnimation();
            this.isInitialized = true;
        }
    }

    createTickerItem(trend) {
        const typeIcons = {
            name: '👤',
            tech: '💻',
            topic: '#️⃣',
            phrase: '📰',
            general: '📌'
        };

        const icon = typeIcons[trend.type] || '📌';
        const articleCount = trend.articles ? trend.articles.length : 0;

        return `
            <div class="ticker-item" onclick="window.app.showTrendArticles('${encodeURIComponent(JSON.stringify(trend))}')">
                <span class="ticker-icon">${icon}</span>
                <span class="ticker-text">${trend.phrase}</span>
                <span class="ticker-count">(${articleCount} articles)</span>
            </div>
        `;
    }

    initializeAnimation() {
        if (!this.tickerTrack) return;

        const totalWidth = this.tickerTrack.scrollWidth / 2;
        const duration = totalWidth / this.animationSpeed;

        this.tickerTrack.style.animation = `ticker ${duration}s linear infinite`;

        this.tickerTrack.addEventListener('animationend', () => {
            requestAnimationFrame(() => {
                this.tickerTrack.style.animation = 'none';
                this.tickerTrack.offsetHeight;
                this.tickerTrack.style.animation = `ticker ${duration}s linear infinite`;
            });
        });
    }

    adjustSpeed(factor = 1) {
        if (!this.tickerTrack || !this.isInitialized) return;
        this.animationSpeed = 50 * factor;
        this.initializeAnimation();
    }

    pause() {
        if (this.tickerTrack) {
            this.tickerTrack.style.animationPlayState = 'paused';
        }
    }

    resume() {
        if (this.tickerTrack) {
            this.tickerTrack.style.animationPlayState = 'running';
        }
    }
}

const trendingTicker = new TrendingTicker();

function updateTrending(articles) {
    if (!window.trendAnalyzer) {
        console.error('Trend analyzer not initialized');
        return;
    }

    const trends = window.trendAnalyzer.analyzeTrends(articles);
    trendingTicker.updateTrends(trends);

    const trendingContainer = document.getElementById('trendingTopics');
    if (trendingContainer) {
        trendingContainer.innerHTML = trends.map(trend => `
            <div class="trending-topic" onclick="window.app.showTrendArticles('${encodeURIComponent(JSON.stringify(trend))}')">
                <span class="trend-text">${trend.phrase}</span>
                <span class="trend-count">${trend.articles.length} mentions</span>
            </div>
        `).join('');
    }
}
