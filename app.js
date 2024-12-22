// RSS Feed URLs
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

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Set up search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchQuery = e.target.value;
            displayArticles();
        });
    }

    // Set up navigation
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const feed = this.getAttribute('data-feed');
            if (feed) {
                currentFeed = feed;
                navButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                displayArticles();
            }
        });
    });

    // Start content loading
    loadFeeds();

    // Update clock
    updateClock();
    setInterval(updateClock, 1000);

    // Update weather
    updateWeather();
    setInterval(updateWeather, 60 * 1000);

    // Refresh content periodically
    setInterval(loadFeeds, 5 * 60 * 1000);
});

// Load all feeds
async function loadFeeds() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    try {
        articleGrid.innerHTML = `
            <div class="loading">Loading articles...</div>
        `;

        const results = await Promise.all(
            Object.entries(FEEDS).map(async ([topic, url]) => {
                try {
                    const response = await fetch(url);
                    if (!response.ok) return [];
                    const data = await response.json();
                    return (data.items || []).map(item => ({ ...item, topic }));
                } catch (err) {
                    console.error(`Error loading ${topic}:`, err);
                    return [];
                }
            })
        );

        articles = results.flat();
        if (articles.length === 0) {
            articleGrid.innerHTML = `
                <div class="error">
                    No articles available
                    <button onclick="loadFeeds()">Retry</button>
                </div>
            `;
            return;
        }

        displayArticles();
        updateTrending();

    } catch (err) {
        console.error('Failed to load feeds:', err);
        articleGrid.innerHTML = `
            <div class="error">
                Failed to load articles
                <button onclick="loadFeeds()">Retry</button>
            </div>
        `;
    }
}

// Display articles
function displayArticles() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

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

    filtered.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

    if (filtered.length === 0) {
        articleGrid.innerHTML = '<div class="no-results">No articles found</div>';
        return;
    }

    articleGrid.innerHTML = filtered.map(article => `
        <article class="article-card" onclick="window.open('${article.url}', '_blank')">
            ${article.image ? `
                <img src="${article.image}" 
                     alt="${article.title}" 
                     class="article-image"
                     onerror="this.style.display='none'">
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

// Update trending
function updateTrending() {
    const trends = analyzeTrends();
    
    // Update ticker
    const ticker = document.getElementById('tickerContent');
    if (ticker) {
        const tickerContent = trends.map(t => 
            `<span class="ticker-item" onclick="searchFor('${t.text}')">${t.text} (${t.count})</span>`
        ).join(' • ');
        ticker.innerHTML = `${tickerContent} • ${tickerContent} • ${tickerContent}`;
        restartTickerAnimation(ticker);
    }

    // Update sidebar
    const trendingContainer = document.getElementById('trendingContainer');
    if (trendingContainer) {
        trendingContainer.innerHTML = trends.map(trend => `
            <div class="trending-item" onclick="searchFor('${trend.text}')">
                <div class="trending-keyword">${trend.text}</div>
                <div class="trending-meta">
                    ${trend.count} mentions in ${trend.topics.length} topics
                    <div class="topic-badges">
                        ${trend.topics.map(topic => 
                            `<span class="topic-badge">${topic.charAt(0).toUpperCase() + topic.slice(1)}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }
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

// Utility functions
function searchFor(text) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = text;
        searchQuery = text;
        displayArticles();
    }
}

function restartTickerAnimation(ticker) {
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