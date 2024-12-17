class TrendingTicker {
    constructor() {
        this.tickerTrack = document.getElementById('tickerTrack');
        this.trends = [];
        this.isInitialized = false;
    }

    updateTrends(trends) {
        if (!this.tickerTrack) return;
        this.trends = trends;

        // Create ticker items
        const tickerContent = trends.map(trend => this.createTickerItem(trend)).join('');

        // Double the content for seamless loop
        this.tickerTrack.innerHTML = tickerContent + tickerContent;

        // Initialize animation timing
        if (!this.isInitialized) {
            this.initializeAnimation();
            this.isInitialized = true;
        }
    }

    createTickerItem(trend) {
        const typeIcons = {
            name: '👤',
            organization: '🏢',
            brand: '™️',
            team: '🏆',
            entertainment: '🎭',
            tech: '💻',
            phrase: '📰'
        };

        const icon = typeIcons[trend.type] || '📌';
        const topics = trend.topics.map(topic => 
            `<span class="topic-badge">${topic}</span>`
        ).join('');

        return `
            <a href="#" class="ticker-item" onclick="setSearch('${trend.entity}'); return false;">
                <span>${icon}</span>
                <span>${trend.entity}</span>
                <span>(${trend.mentions})</span>
                ${topics}
            </a>
        `;
    }

    initializeAnimation() {
        if (!this.tickerTrack) return;

        // Calculate animation duration based on content
        const totalWidth = this.tickerTrack.scrollWidth / 2;
        const duration = totalWidth / 50; // 50px per second

        // Update animation duration
        this.tickerTrack.style.animation = `ticker ${duration}s linear infinite`;

        // Add event listener for automatic restart on animation end
        this.tickerTrack.addEventListener('animationend', () => {
            this.tickerTrack.style.animation = 'none';
            void this.tickerTrack.offsetWidth; // Trigger reflow
            this.tickerTrack.style.animation = `ticker ${duration}s linear infinite`;
        });
    }

    adjustSpeed(factor = 1) {
        if (!this.tickerTrack || !this.isInitialized) return;

        const currentDuration = parseFloat(this.tickerTrack.style.animation.match(/\d+(\.\d+)?/)[0]);
        const newDuration = currentDuration * factor;

        this.tickerTrack.style.animation = `ticker ${newDuration}s linear infinite`;
    }
}

// Create global instance
const trendingTicker = new TrendingTicker();

// Update the ticker when trends change
function updateTrending() {
    const trends = trendAnalyzer.analyzeTrends(allArticles);
    
    // Update sidebar
    const trendingContainer = document.getElementById('trendingContainer');
    if (trendingContainer) {
        // Previous trending sidebar update code...
    }

    // Update ticker
    trendingTicker.updateTrends(trends);
}
