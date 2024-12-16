// Update visualization with analyzed data
function updateVisualization(analysisResults) {
    const { keywordMap, keywordArticles, topicKeywords } = analysisResults;
    
    // Update chart
    updateKeywordChart(keywordMap);
    
    // Update topic grids
    updateTopicGrids(topicKeywords, keywordArticles);
    
    // Store history
    updateKeywordHistory(keywordMap);
}

function updateKeywordChart(keywordMap) {
    const chartContainer = document.getElementById('keywordChart');
    const topKeywords = Object.entries(keywordMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const maxCount = Math.max(...topKeywords.map(k => k[1]));
    
    chartContainer.innerHTML = topKeywords.map(([keyword, count]) => {
        const height = (count / maxCount) * 100;
        return `
            <div class="chart-bar" 
                 style="height: ${height}%"
                 onclick="showKeywordDetails('${keyword}')">
                <div class="chart-label">${keyword}</div>
            </div>
        `;
    }).join('');
}

function updateTopicGrids(topicKeywords, keywordArticles) {
    const trendGrid = document.getElementById('trendGrid');
    const topicNames = {
        movies: 'Movies & TV',
        music: 'Music',
        money: 'Finance',
        popculture: 'Pop Culture',
        sports: 'Sports',
        tech: 'Technology & AI'
    };

    trendGrid.innerHTML = Object.entries(topicNames).map(([topic, title]) => {
        const topicTrends = Object.entries(topicKeywords[topic] || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return `
            <div class="trend-card">
                <h2>${title}</h2>
                <ul class="keyword-list">
                    ${topicTrends.map(([keyword, count]) => `
                        <li class="keyword-item" onclick="showKeywordDetails('${keyword}')">
                            <div class="keyword-info">
                                <span class="keyword-text">${keyword}</span>
                                <span class="keyword-meta">${count} mentions</span>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }).join('');
}

function showKeywordDetails(keyword) {
    const articles = keywordArticles[keyword] || [];
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Articles mentioning "${keyword}"</h3>
            <div class="article-list">
                ${articles.map(article => `
                    <a href="${article.url}" target="_blank" class="article-link">
                        <h4>${article.title}</h4>
                        <span class="article-meta">${new Date(article.date_published).toLocaleDateString()}</span>
                    </a>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.onclick = e => {
        if (e.target === modal) modal.remove();
    };
}

// Initialize
async function initialize() {
    try {
        const feedPromises = Object.entries(feeds).map(async ([topic, url]) => {
            const articles = await fetchFeed(url);
            return articles.map(article => ({ ...article, topic }));
        });

        allArticles = (await Promise.all(feedPromises)).flat();
        const analysis = analyzeKeywords(allArticles, currentTimeframe);
        updateVisualization(analysis);

        // Refresh every 5 minutes
        setInterval(async () => {
            await initialize();
        }, 5 * 60 * 1000);
    } catch (error) {
        console.error('Initialization error:', error);
        document.getElementById('trendGrid').innerHTML = 
            `<div class="error">Failed to load feeds: ${error.message}</div>`;
    }
}

// Start the application
initialize();
