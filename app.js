// Previous state management and feed code remains...

// Trending functionality
function updateTrending() {
    const trends = analyzeTrends();
    updateTrendingSidebar(trends);
    updateTicker(trends);
}

function analyzeTrends() {
    if (!state.articles.length) return [];

    const trends = new Map();
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    state.articles.forEach(article => {
        if (new Date(article.date_published) >= cutoff) {
            const entities = extractEntities(article);
            
            entities.forEach(entity => {
                if (!entity.text || entity.text.length < 3) return;
                
                const key = entity.text.toLowerCase();
                const trend = trends.get(key) || {
                    text: entity.text,
                    count: 0,
                    topics: new Set(),
                    articles: new Set()
                };

                trend.count++;
                trend.topics.add(article.topic);
                trend.articles.add(article.url);
                trends.set(key, trend);
            });
        }
    });

    return Array.from(trends.values())
        .filter(trend => trend.count > 1)
        .map(trend => ({
            ...trend,
            topics: Array.from(trend.topics),
            articles: Array.from(trend.articles)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8); // Limit to top 8 trends
}

function extractEntities(article) {
    const entities = new Set();
    const text = `${article.title} ${article.description || ''}`;

    // Pattern matching for various entity types
    const patterns = [
        // Named entities (people, companies, etc.)
        /[A-Z][a-z]+ (?:[A-Z][a-z]+ )*[A-Z][a-z]+/g,
        // Product names
        /(?:[A-Z][a-zA-Z0-9]*[0-9]+|[A-Z]{2,}(?:\s+[0-9]+)?)/g,
        // Hashtag-style terms
        /#[A-Za-z][A-Za-z0-9]+/g
    ];

    patterns.forEach(pattern => {
        const matches = text.match(pattern) || [];
        matches.forEach(match => {
            if (match.length > 3 && !match.includes('The') && !match.includes('And')) {
                entities.add({ text: match.trim() });
            }
        });
    });

    return Array.from(entities);
}

function updateTrendingSidebar(trends) {
    const container = document.getElementById('trendingContainer');
    if (!container) return;

    if (!trends.length) {
        container.innerHTML = '<div class="loading">Analyzing trends...</div>';
        return;
    }

    container.innerHTML = trends.map(trend => `
        <div class="trending-item" onclick="searchKeyword('${trend.text}')">
            <div class="trending-keyword">${trend.text}</div>
            <div class="trending-meta">
                <div>${trend.count} mentions in ${trend.topics.length} ${trend.topics.length === 1 ? 'topic' : 'topics'}</div>
                <div class="topic-badges">
                    ${trend.topics.map(topic => 
                        `<span class="topic-badge">${topic.charAt(0).toUpperCase() + topic.slice(1)}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function updateTicker(trends) {
    const ticker = document.getElementById('tickerContent');
    if (!ticker || !trends.length) return;

    // Create ticker content with proper spacing and formatting
    const content = trends.map(trend => 
        `<span class="ticker-item" onclick="searchKeyword('${trend.text}')">` +
        `${trend.text} (${trend.count})` +
        '</span>'
    ).join(' • ');

    // Duplicate content for seamless loop
    ticker.innerHTML = `${content} • ${content} • ${content}`;
    
    // Reset animation
    ticker.style.animation = 'none';
    ticker.offsetHeight; // Force reflow
    ticker.style.animation = 'tickerScroll 30s linear infinite';
}

// Rest of the code remains unchanged...