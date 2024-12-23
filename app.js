document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const searchInput = document.getElementById('searchInput');
    const articlesList = document.getElementById('articlesList');
    const trendsList = document.getElementById('trendsList');
    const weatherDisplay = document.getElementById('weatherDisplay');

    // Store articles data
    const articles = [
        {
            title: 'Sample Article 1',
            excerpt: 'This is a sample article excerpt...'
        },
        {
            title: 'Sample Article 2',
            excerpt: 'Another sample article excerpt...'
        }
    ];

    // Store trends data
    const trends = [
        { title: 'Trend 1', count: '10K' },
        { title: 'Trend 2', count: '5K' }
    ];

    // Initialize content
    renderArticles(articles);
    renderTrends(trends);

    // Handle search
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredArticles = articles.filter(article =>
            article.title.toLowerCase().includes(searchTerm) ||
            article.excerpt.toLowerCase().includes(searchTerm)
        );
        renderArticles(filteredArticles);
    });

    // Render functions
    function renderArticles(articles) {
        articlesList.innerHTML = articles.map(article => `
            <article class="article">
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
            </article>
        `).join('');
    }

    function renderTrends(trends) {
        trendsList.innerHTML = trends.map(trend => `
            <div class="trend">
                <span>${trend.title}</span>
                <span>${trend.count}</span>
            </div>
        `).join('');
    }
});