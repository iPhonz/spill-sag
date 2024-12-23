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
    container.classList.add('loading');
    container.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div></div>';
}

function hideLoading(container) {
    container.classList.remove('loading');
}

// Error states
function showError(container, message, retryFn) {
    hideLoading(container);
    container.innerHTML = `
        <div class="error-message">
            ${message}
            ${retryFn ? `<button onclick="${retryFn.name}()">Retry</button>` : ''}
        </div>
    `;
}

// Empty states
function showEmpty(container, message) {
    hideLoading(container);
    container.innerHTML = `<div class="empty-state">${message}</div>`;
}

// Render functions
function renderArticles(articles) {
    hideLoading(articlesContainer);
    
    if (!articles.length) {
        showEmpty(articlesContainer, 'No articles found');
        return;
    }

    articlesContainer.innerHTML = articles
        .map((article, index) => `
            <div class="article" style="--index: ${index}">
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
            </div>
        `).join('');
}

function renderTrends(trends) {
    hideLoading(trendsContainer);

    if (!trends.length) {
        showEmpty(trendsContainer, 'No trending topics');
        return;
    }

    trendsContainer.innerHTML = trends
        .map((trend, index) => `
            <div class="trend" style="--index: ${index}">
                <span>${trend.title}</span>
                <span>${trend.count}</span>
            </div>
        `).join('');
}

function renderWeather(weather) {
    weatherDisplay.classList.remove('loading');
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
        weatherDisplay.classList.add('loading');
        const weather = await weatherService.getWeather();
        renderWeather(weather);
    } catch (error) {
        weatherDisplay.classList.remove('loading');
        weatherDisplay.textContent = '--°F';
    }
}

// Event handlers
let searchTimeout;
async function handleSearch(e) {
    const searchTerm = e.target.value;
    
    // Clear previous timeout
    clearTimeout(searchTimeout);
    
    // Set new timeout for debouncing
    searchTimeout = setTimeout(async () => {
        try {
            showLoading(articlesContainer);
            const articles = await articleService.searchArticles(searchTerm);
            renderArticles(articles);
        } catch (error) {
            showError(articlesContainer, 'Search failed');
        }
    }, 300);
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