document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const searchInput = document.getElementById('searchInput');
    const articlesList = document.getElementById('articlesList');
    const trendsList = document.getElementById('trendsList');
    const weatherDisplay = document.getElementById('weatherDisplay');

    // Initialize data stores
    let articles = [];
    let trends = [];

    // Load initial data
    loadArticles();
    loadTrends();
    loadWeather();

    // Event listeners
    searchInput.addEventListener('input', handleSearch);

    async function loadArticles() {
        try {
            // Simulated API call - replace with actual endpoint
            articles = [
                { title: 'Sample Article 1', excerpt: 'This is a sample article excerpt...' },
                { title: 'Sample Article 2', excerpt: 'Another sample article excerpt...' }
            ];
            renderArticles(articles);
        } catch (error) {
            console.error('Error loading articles:', error);
            articlesList.innerHTML = '<div class="error">Unable to load articles</div>';
        }
    }

    async function loadTrends() {
        try {
            // Simulated API call - replace with actual endpoint
            trends = [
                { title: 'Trend 1', count: '10K' },
                { title: 'Trend 2', count: '5K' }
            ];
            renderTrends(trends);
        } catch (error) {
            console.error('Error loading trends:', error);
            trendsList.innerHTML = '<div class="error">Unable to load trends</div>';
        }
    }

    async function loadWeather() {
        try {
            // Simulated weather data - replace with actual API call
            const weather = { temperature: 72, unit: 'F' };
            weatherDisplay.textContent = `${weather.temperature}°${weather.unit}`;
        } catch (error) {
            console.error('Error loading weather:', error);
            weatherDisplay.textContent = '--°F';
        }
    }

    function renderArticles(articles) {
        articlesList.innerHTML = articles.map(article => `
            <article class="article-item">
                <h3 class="article-title">${article.title}</h3>
                <p class="article-excerpt">${article.excerpt}</p>
            </article>
        `).join('');
    }

    function renderTrends(trends) {
        trendsList.innerHTML = trends.map(trend => `
            <div class="trend-item">
                <span class="trend-title">${trend.title}</span>
                <span class="trend-count">${trend.count}</span>
            </div>
        `).join('');
    }

    function handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        const filteredArticles = articles.filter(article =>
            article.title.toLowerCase().includes(searchTerm) ||
            article.excerpt.toLowerCase().includes(searchTerm)
        );
        renderArticles(filteredArticles);
    }
});