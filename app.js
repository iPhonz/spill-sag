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
function renderArticles() {
    document.getElementById('articles').innerHTML = data.articles
        .map(article => `
            <div class="article">
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
            </div>
        `).join('');
}

function renderTrends() {
    document.getElementById('trends').innerHTML = data.trends
        .map(trend => `
            <div class="trend">
                <span>${trend.title}</span>
                <span>${trend.count}</span>
            </div>
        `).join('');
}

// Search handler
document.getElementById('search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    data.articles = [
        { title: 'Sample Article 1', excerpt: 'This is a sample article excerpt...' },
        { title: 'Sample Article 2', excerpt: 'Another sample article excerpt...' }
    ].filter(article => 
        article.title.toLowerCase().includes(term) ||
        article.excerpt.toLowerCase().includes(term)
    );
    renderArticles();
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    renderArticles();
    renderTrends();
});