// Initialize trending analyzer
const trendAnalyzer = new AdvancedTrendAnalyzer();

// Fix navigation highlighting
function showFeed(feed) {
    currentFeed = feed;
    // Remove active class from all buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
    });

    // Add active class to selected button
    const feedText = feed === 'tech' ? 'Technology & AI' : 
                    feed === 'movies' ? 'Movies & TV' : 
                    feed === 'popculture' ? 'Pop Culture' : 
                    feed.charAt(0).toUpperCase() + feed.slice(1);

    const activeButton = Array.from(document.querySelectorAll('.nav-button'))
        .find(button => button.textContent.trim() === feedText);
    
    if (activeButton) {
        activeButton.classList.add('active');
    }

    updateDisplay();
}

// Update trending section with new analyzer
function updateTrending() {
    const trends = trendAnalyzer.analyzeTrends(allArticles);
    const trendingContainer = document.getElementById('trendingContainer');

    trendingContainer.innerHTML = trends.map(trend => {
        const topicsList = Array.from(trendAnalyzer.entityContext.get(trend.entity)?.topics || [])
            .map(topic => `<span class="topic-tag">${topic}</span>`).join('');

        return `
            <div class="trending-item" onclick="searchKeyword('${trend.entity}')">
                <div class="trending-keyword">${trend.entity}</div>
                <div class="trending-meta">
                    <span>${trend.mentions} mentions</span>
                    <div class="topic-tags">${topicsList}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Add styles for topic tags
const style = document.createElement('style');
style.textContent = `
    .topic-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 4px;
    }

    .topic-tag {
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 12px;
        background: var(--accent);
        color: var(--text-secondary);
    }

    .trending-item:hover .topic-tag {
        background: var(--primary);
        color: var(--text);
    }
`;
document.head.appendChild(style);

// Rest of the app.js code remains the same...
