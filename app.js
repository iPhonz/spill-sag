document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const articlesContainer = document.getElementById('articles');
    const trendsContainer = document.getElementById('trends');
    const searchInput = document.getElementById('search');

    // Sample data
    const data = {
        articles: [
            { title: 'Sample Article 1', excerpt: 'This is a sample article excerpt...' },
            { title: 'Sample Article 2', excerpt: 'Another sample article excerpt...' }
        ],
        trends: [
            { title: 'Trend 1', count: '10K' },
            { title: 'Trend 2', count: '5K' }
        ]
    };

    // Render initial content
    renderArticles(data.articles);
    renderTrends(data.trends);

    // Add search handler
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredArticles = data.articles.filter(article =>
            article.title.toLowerCase().includes(searchTerm) ||
            article.excerpt.toLowerCase().includes(searchTerm)
        );
        renderArticles(filteredArticles);
    });

    // Render functions
    function renderArticles(articles) {
        articlesContainer.innerHTML = articles.map(article => `
            <div class="article">
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
            </div>
        `).join('');
    }

    function renderTrends(trends) {
        trendsContainer.innerHTML = trends.map(trend => `
            <div class="trend">
                <span>${trend.title}</span>
                <span>${trend.count}</span>
            </div>
        `).join('');
    }
});