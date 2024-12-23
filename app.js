document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const articles = document.getElementById('articles');
    const trends = document.getElementById('trends');
    const search = document.getElementById('search');

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

    // Render functions
    function renderArticles(items) {
        articles.innerHTML = items.map(article => `
            <div class="article">
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
            </div>
        `).join('');
    }

    function renderTrends(items) {
        trends.innerHTML = items.map(trend => `
            <div class="trend">
                <span>${trend.title}</span>
                <span>${trend.count}</span>
            </div>
        `).join('');
    }

    // Search handler
    search.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = data.articles.filter(article =>
            article.title.toLowerCase().includes(term) ||
            article.excerpt.toLowerCase().includes(term)
        );
        renderArticles(filtered);
    });

    // Initial render
    renderArticles(data.articles);
    renderTrends(data.trends);
});