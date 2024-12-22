// Feed URLs
const FEEDS = {
    movies: 'https://rss.app/feeds/v1.1/_6QzByBP0Y0E9bL0O.json',
    music: 'https://rss.app/feeds/v1.1/_p1hbSzosU9dbDQWx.json',
    money: 'https://rss.app/feeds/v1.1/_fcZVOvvC7xA6iz8u.json',
    popculture: 'https://rss.app/feeds/v1.1/_8Tib7bkE02swlmp7.json',
    sports: 'https://rss.app/feeds/v1.1/_5pZybCiMDbl5fBo8.json',
    tech: 'https://rss.app/feeds/v1.1/_GNEAg9D5CvYRIxAQ.json'
};

// Global state
let articles = [];
let currentFeed = 'all';
let searchQuery = '';

// Initialize immediately
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    setupNavigation();
    setupSearch();
    
    // Start content loading
    loadContent();
    
    // Initialize utilities
    updateClock();
    updateWeather();
    
    // Set up refresh intervals
    setInterval(loadContent, 5 * 60 * 1000);  // Refresh content every 5 minutes
    setInterval(updateClock, 1000);           // Update clock every second
    setInterval(updateWeather, 60 * 1000);    // Update weather every minute
});

// Load all content
async function loadContent() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    // Show loading state
    articleGrid.innerHTML = getLoadingSkeleton();

    try {
        // Load all feeds in parallel
        const feedPromises = Object.entries(FEEDS).map(async ([topic, url]) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                return (data.items || []).map(item => ({ ...item, topic }));
            } catch (error) {
                console.error(`Error loading ${topic} feed:`, error);
                return [];
            }
        });

        // Wait for all feeds
        const results = await Promise.all(feedPromises);
        articles = results.flat();

        if (articles.length === 0) {
            showError('No articles available');
            return;
        }

        // Update display
        updateDisplay();
        updateTrending();

    } catch (error) {
        showError('Failed to load content');
        console.error('Content loading error:', error);
    }
}

// Update article display
function updateDisplay() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    // Filter articles
    let filtered = [...articles];

    if (currentFeed !== 'all') {
        filtered = filtered.filter(article => article.topic === currentFeed);
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(article => 
            article.title.toLowerCase().includes(query) ||
            (article.description || '').toLowerCase().includes(query)
        );
    }

    // Sort by date
    filtered.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

    // Show no results if needed
    if (filtered.length === 0) {
        articleGrid.innerHTML = '<div class="no-results">No articles found</div>';
        return;
    }

    // Render articles
    articleGrid.innerHTML = filtered.map(article => `
        <article class="article-card" onclick="openArticle('${article.url}')">
            ${article.image ? `
                <img src="${article.image}" 
                     alt="${article.title}" 
                     class="article-image"
                     onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'">
            ` : `
                <div class="article-image placeholder"></div>
            `}
            <div class="article-content">
                <h2 class="article-title">${article.title}</h2>
                <div class="article-meta">
                    <span>${new Date(article.date_published).toLocaleDateString()}</span>
                    <span class="topic-badge">${article.topic.charAt(0).toUpperCase() + article.topic.slice(1)}</span>
                </div>
            </div>
        </article>
    `).join('');
}

// Update trending section
function updateTrending() {
    const trends = analyzeTrends();
    updateTicker(trends);
    updateTrendingSidebar(trends);
}

// Update ticker display
function updateTicker(trends) {
    const ticker = document.getElementById('tickerContent');
    if (!ticker) return;

    const content = trends.map(trend => 
        `<span class="ticker-item" onclick="searchFor('${trend.text}')">
            ${trend.text} (${trend.count})
        </span>`
    ).join(' • ');

    ticker.innerHTML = `${content} • ${content} • ${content}`;
    resetTickerAnimation(ticker);
}

// Update trending sidebar
function updateTrendingSidebar(trends) {
    const container = document.getElementById('trendingContainer');
    if (!container) return;

    container.innerHTML = trends.map(trend => `
        <div class="trending-item" onclick="searchFor('${trend.text}')">
            <div class="trending-keyword">${trend.text}</div>
            <div class="trending-meta">
                ${trend.count} mentions in ${trend.topics.length} ${trend.topics.length === 1 ? 'topic' : 'topics'}
                <div class="topic-badges">
                    ${trend.topics.map(topic => 
                        `<span class="topic-badge">${topic.charAt(0).toUpperCase() + topic.slice(1)}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Analyze trends
function analyzeTrends() {
    const trends = new Map();
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    articles.forEach(article => {
        if (new Date(article.date_published) >= cutoff) {
            const words = article.title.split(/\s+/);
            words.forEach(word => {
                if (word.length < 4) return;
                const key = word.toLowerCase();
                const trend = trends.get(key) || {
                    text: word,
                    count: 0,
                    topics: new Set()
                };
                trend.count++;
                trend.topics.add(article.topic);
                trends.set(key, trend);
            });
        }
    });

    return Array.from(trends.values())
        .filter(t => t.count > 1)
        .map(t => ({ ...t, topics: Array.from(t.topics) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
}

// Setup navigation
function setupNavigation() {
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            currentFeed = button.dataset.feed;
            document.querySelectorAll('.nav-button').forEach(btn => 
                btn.classList.toggle('active', btn === button)
            );
            updateDisplay();
        });
    });
}

// Setup search
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            updateDisplay();
        });
    }
}

// Utility functions
function openArticle(url) {
    if (url) window.open(url, '_blank');
}

function searchFor(text) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = text;
        searchQuery = text;
        updateDisplay();
    }
}

function showError(message) {
    const articleGrid = document.getElementById('articleGrid');
    if (articleGrid) {
        articleGrid.innerHTML = `
            <div class="error-message">
                ${message}
                <button onclick="loadContent()">Retry</button>
            </div>
        `;
    }
}

function getLoadingSkeleton() {
    return Array(6).fill(`
        <div class="loading-card">
            <div class="loading-image"></div>
            <div class="loading-content">
                <div class="loading-title"></div>
                <div class="loading-meta"></div>
            </div>
        </div>
    `).join('');
}

function resetTickerAnimation(ticker) {
    ticker.style.animation = 'none';
    ticker.offsetHeight; // Force reflow
    ticker.style.animation = 'ticker 45s linear infinite';
}

function updateClock() {
    const timeElement = document.getElementById('localTime');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
}

function updateWeather() {
    const weatherElement = document.getElementById('weatherTemp');
    if (weatherElement) {
        const temp = Math.round(50 + (Math.random() * 10 - 5));
        weatherElement.textContent = `${temp}°F`;
    }
}