import { articleService } from './services/articleService.js';
import { trendService } from './services/trendService.js';
import { weatherService } from './services/weatherService.js';

// Cache DOM elements
const articlesContainer = document.getElementById('articles');
const trendsContainer = document.getElementById('trends');
const weatherDisplay = document.getElementById('weather');
const searchInput = document.getElementById('search');

// Render functions
function renderArticles(articles) {
    articlesContainer.innerHTML = articles
        .map(article => `
            <div class="article">
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
            </div>
        `).join('');
}

function renderTrends(trends) {
    trendsContainer.innerHTML = trends
        .map(trend => `
            <div class="trend">
                <span>${trend.title}</span>
                <span>${trend.count}</span>
            </div>
        `).join('');
}

function renderWeather(weather) {
    weatherDisplay.textContent = `${weather.temperature}°${weather.unit}`;
}

// Event handlers
async function handleSearch(e) {
    const searchTerm = e.target.value;
    const articles = await articleService.searchArticles(searchTerm);
    renderArticles(articles);
}

// Initialize data
async function initializeApp() {
    try {
        // Fetch initial data
        const [articles, trends, weather] = await Promise.all([
            articleService.getArticles(),
            trendService.getTrends(),
            weatherService.getWeather()
        ]);

        // Render all content
        renderArticles(articles);
        renderTrends(trends);
        renderWeather(weather);

        // Set up event listeners
        searchInput.addEventListener('input', handleSearch);
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);