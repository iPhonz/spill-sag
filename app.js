document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const searchInput = document.getElementById('searchInput');
    const articlesList = document.getElementById('articlesList');
    const trendsList = document.getElementById('trendsList');
    const weatherDisplay = document.getElementById('weatherDisplay');

    // Initialize data
    let articles = [];
    let trends = [];

    // Load initial data
    loadArticles();
    loadTrends();
    loadWeather();

    // Event listeners
    searchInput.addEventListener('input', handleSearch);

    // Basic data loading functions
    async function loadArticles() {
        try {
            const response = await fetch('/api/articles');
            articles = await response.json();
            renderArticles(articles);
        } catch (error) {
            console.error('Error loading articles:', error);
            articlesList.innerHTML = 'Unable to load articles';
        }
    }

    async function loadTrends() {
        try {
            const response = await fetch('/api/trends');
            trends = await response.json();
            renderTrends(trends);
        } catch (error) {
            console.error('Error loading trends:', error);
            trendsList.innerHTML = 'Unable to load trends';
        }
    }

    async function loadWeather() {
        try {
            const response = await fetch('/api/weather');
            const weather = await response.json();
            weatherDisplay.textContent = `${weather.temperature}°F`;
        } catch (error) {
            console.error('Error loading weather:', error);
        }
    }

    // Rendering functions
    function renderArticles(articles) {
        articlesList.innerHTML = articles.map(article => `
            <div class="article">
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
            </div>
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

    // Search handler
    function handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        const filteredArticles = articles.filter(article =>
            article.title.toLowerCase().includes(searchTerm) ||
            article.excerpt.toLowerCase().includes(searchTerm)
        );
        renderArticles(filteredArticles);
    }
});