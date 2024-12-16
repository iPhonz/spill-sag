// Initialize trend analyzer
const trendAnalyzer = new TrendAnalyzer();

// Update trending section
function updateTrending() {
    const trendingContainer = document.getElementById('trendingContainer');
    if (!trendingContainer) return;

    const trends = trendAnalyzer.analyzeTrends(allArticles);

    if (trends.length === 0) {
        trendingContainer.innerHTML = '<div class="error">No trends found</div>';
        return;
    }

    trendingContainer.innerHTML = trends.map(trend => {
        const topicBadges = trend.topics.map(topic => 
            `<span class="topic-badge">${topic}</span>`
        ).join('');

        const typeIcon = getTypeIcon(trend.type);

        return `
            <div class="trending-item" onclick="searchKeyword('${trend.entity}')">
                <div class="trending-header">
                    <span class="trend-type">${typeIcon}</span>
                    <div class="trending-keyword">${trend.entity}</div>
                </div>
                <div class="trending-meta">
                    <span>${trend.mentions} mentions in 24h</span>
                    <div class="topic-badges">${topicBadges}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Get icon for trend type
function getTypeIcon(type) {
    const icons = {
        name: '👤',
        organization: '🏢',
        brand: '™️',
        team: '🏆',
        entertainment: '🎭',
        tech: '💻',
        phrase: '📰'
    };
    return icons[type] || '📌';
}

// Add styles for trending items
const style = document.createElement('style');
style.textContent = `
    .trending-item {
        padding: 12px;
        border-bottom: 1px solid var(--border);
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .trending-item:hover {
        background-color: var(--accent);
    }

    .trending-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
    }

    .trend-type {
        font-size: 1.2em;
    }

    .trending-keyword {
        font-weight: 600;
        flex: 1;
    }

    .topic-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 4px;
    }

    .topic-badge {
        font-size: 0.75rem;
        padding: 2px 6px;
        border-radius: 12px;
        background: var(--accent);
        color: var(--text-secondary);
    }

    .trending-item:hover .topic-badge {
        background: var(--primary);
        color: var(--text);
    }
`;
document.head.appendChild(style);

// Rest of app.js remains the same...
