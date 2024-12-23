import { articleService } from './services/articleService.js';
import { trendService } from './services/trendService.js';
import { weatherService } from './services/weatherService.js';

// Cache DOM elements
const articlesContainer = document.getElementById('articles');
const trendsContainer = document.getElementById('trends');
const weatherDisplay = document.getElementById('weather');
const searchInput = document.getElementById('search');

// Loading states
function showLoading(container) {
    container.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div></div>';
}

// Error states
function showError(container, message, retryFn) {
    container.innerHTML = `
        <div class="error-message">
            ${message}
            ${retryFn ? `<button onclick="${retryFn.name}()">Retry</button>` : ''}
        </div>
    `;
}

// Empty states
function showEmpty(container, message) {
    container.innerHTML = `<div class="empty-state">${message}</div>`;
}

// Render functions
function renderArticles(articles) {
    if (!articles.length) {
        showEmpty(articlesContainer, 'No articles found');
        return;
    }

    articlesContainer.innerHTML = articles
        .map(article => `
            <div class="article">
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
            </div>
        `).join('');
}

function renderTrends(trends) {
    if (!trends.length) {
        showEmpty(trendsContainer, 'No trending topics');
        return;
    }

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

// Data loading functions
async function loadArticles() {
    try {
        showLoading(articlesContainer);
        const articles = await articleService.getArticles();
        renderArticles(articles);
    } catch (error) {
        showError(articlesContainer, 'Failed to load articles', loadArticles);
    }
}

async function loadTrends() {
    try {
        showLoading(trendsContainer);
        const trends = await trendService.getTrends();
        renderTrends(trends);
    } catch (error) {
        showError(trendsContainer, 'Failed to load trends', loadTrends);
    }
}

async function loadWeather() {
    try {
        const weather = await weatherService.getWeather();
        renderWeather(weather);
    } catch (error) {
        weatherDisplay.textContent = '--°F';
    }
}

// Event handlers
async function handleSearch(e) {
    const searchTerm = e.target.value;
    try {
        showLoading(articlesContainer);
        const articles = await articleService.searchArticles(searchTerm);
        renderArticles(articles);
    } catch (error) {
        showError(articlesContainer, 'Search failed');
    }
}

// Initialize app
async function initializeApp() {
    try {
        // Set up event listeners
        searchInput.addEventListener('input', handleSearch);

        // Load all data
        await Promise.all([
            loadArticles(),
            loadTrends(),
            loadWeather()
        ]);
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);