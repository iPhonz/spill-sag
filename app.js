// Previous state management and feed URLs...

// Update article display with image-first design
function updateDisplay() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid || state.loading) return;

    let articles = [...state.articles];

    // Apply filters
    if (state.currentFeed !== 'all') {
        articles = articles.filter(article => article.topic === state.currentFeed);
    }

    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        articles = articles.filter(article => 
            article.title.toLowerCase().includes(query) ||
            (article.description || '').toLowerCase().includes(query)
        );
    }

    articles.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

    if (articles.length === 0) {
        articleGrid.innerHTML = '<div class="no-results">No articles found</div>';
        return;
    }

    articleGrid.innerHTML = articles.map(article => `
        <article class="article-card" onclick="window.open('${article.url}', '_blank')">
            ${article.image ? `
                <img src="${article.image}" 
                     alt="${article.title}" 
                     class="article-image"
                     onerror="this.src='fallback.jpg'">
            ` : '<div class="article-image" style="background: var(--accent)"></div>'}
            <div class="article-content">
                <h2 class="article-title">${article.title}</h2>
                <div class="article-meta">
                    <span>${new Date(article.date_published).toLocaleDateString()}</span>
                    <span class="topic-badge">${article.topic.charAt(0).toUpperCase() + article.topic.slice(1)}</span>
                </div>
            </div>
        </article>
    `).join('');
}

// Improved trend analysis
function analyzeTrends() {
    if (!state.articles.length) return [];

    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    // Analyze entities and topics
    const trends = new Map();
    state.articles.forEach(article => {
        if (new Date(article.date_published) >= cutoff) {
            const text = `${article.title} ${article.description || ''}`;
            const entities = extractEntities(text, article.topic);
            
            entities.forEach(entity => {
                const key = `${entity.type}:${entity.text}`;
                if (!trends.has(key)) {
                    trends.set(key, {
                        text: entity.text,
                        type: entity.type,
                        count: 0,
                        topics: new Set(),
                        articles: new Set()
                    });
                }
                const trend = trends.get(key);
                trend.count++;
                trend.topics.add(article.topic);
                trend.articles.add(article.url);
            });
        }
    });

    // Convert to array and sort
    return Array.from(trends.values())
        .map(trend => ({
            ...trend,
            topics: Array.from(trend.topics),
            articles: Array.from(trend.articles),
            score: calculateTrendScore(trend)
        }))
        .filter(trend => trend.count > 1)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
}

// Calculate trend score based on multiple factors
function calculateTrendScore(trend) {
    const baseScore = trend.count * 2;
    const topicBonus = trend.topics.length * 1.5;
    const recentBonus = trend.articles.length;
    return baseScore + topicBonus + recentBonus;
}

// Update trending sections
function updateTrending() {
    const trends = analyzeTrends();
    updateTrendingSidebar(trends);
    updateTrendingTicker(trends);
}

// Update trending sidebar
function updateTrendingSidebar(trends) {
    const container = document.getElementById('trendingContainer');
    if (!container) return;

    if (!trends.length) {
        container.innerHTML = '<div class="error">No trends found</div>';
        return;
    }

    container.innerHTML = trends.map(trend => `
        <div class="trending-item" onclick="searchKeyword('${trend.text}')">
            <div class="trending-header">
                ${getTrendIcon(trend.type)}
                <div class="trending-keyword">${trend.text}</div>
            </div>
            <div class="trending-meta">
                ${trend.count} mentions in ${trend.topics.length} topics
                <div class="topic-badges">
                    ${trend.topics.map(topic => 
                        `<span class="topic-badge">${topic}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Update trending ticker
function updateTrendingTicker(trends) {
    const ticker = document.getElementById('tickerContent');
    if (!ticker) return;

    // Double the trends for seamless loop
    const tickerContent = [...trends, ...trends]
        .map(trend => `
            <div class="ticker-item" onclick="searchKeyword('${trend.text}')">
                <span class="ticker-type-icon">${getTrendIcon(trend.type)}</span>
                <span class="ticker-text">${trend.text}</span>
                <span class="ticker-count">${trend.count}x</span>
            </div>
        `).join('');

    ticker.innerHTML = tickerContent;
}

// Rest of the code (event listeners, initialization, etc.)...
