// State management
const state = {
    articles: [],
    currentFeed: 'all',
    searchQuery: '',
    loading: false,
    error: null
};

// RSS Feed URLs
const feeds = {
    movies: 'https://rss.app/feeds/v1.1/_6QzByBP0Y0E9bL0O.json',
    music: 'https://rss.app/feeds/v1.1/_p1hbSzosU9dbDQWx.json',
    money: 'https://rss.app/feeds/v1.1/_fcZVOvvC7xA6iz8u.json',
    popculture: 'https://rss.app/feeds/v1.1/_8Tib7bkE02swlmp7.json',
    sports: 'https://rss.app/feeds/v1.1/_5pZybCiMDbl5fBo8.json',
    tech: 'https://rss.app/feeds/v1.1/_GNEAg9D5CvYRIxAQ.json'
};

// Initialize immediately
document.addEventListener('DOMContentLoaded', () => {
    log('App initializing...');
    setupEventListeners();
    loadFeeds();
    setInterval(loadFeeds, 5 * 60 * 1000); // Refresh every 5 minutes
});

// Debug logging
function log(message, data = '') {
    console.log(`[SPILL] ${message}`, data);
}

// Event listeners setup
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            updateDisplay();
        });
    }

    // Navigation buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            const feed = button.dataset.feed;
            if (feed) {
                switchFeed(feed);
            }
        });
    });
}

// Feed management
async function fetchFeed(topic, url) {
    log(`Fetching ${topic} feed...`);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        log(`${topic} feed fetched: ${data.items?.length || 0} items`);
        return data.items || [];
    } catch (error) {
        log(`Error fetching ${topic} feed:`, error);
        throw error;
    }
}

async function loadFeeds() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    state.loading = true;
    state.error = null;
    articleGrid.innerHTML = '<div class="loading">Loading articles...</div>';

    try {
        log('Loading feeds...');
        const feedPromises = Object.entries(feeds).map(async ([topic, url]) => {
            const items = await fetchFeed(topic, url);
            return items.map(item => ({ ...item, topic }));
        });

        state.articles = (await Promise.all(feedPromises)).flat();
        log(`Loaded ${state.articles.length} total articles`);

        if (state.articles.length === 0) {
            throw new Error('No articles found');
        }

        updateDisplay();
        updateTrending();
    } catch (error) {
        log('Error loading feeds:', error);
        state.error = error.message;
        articleGrid.innerHTML = `
            <div class="error">
                Failed to load articles: ${error.message}
                <button onclick="loadFeeds()" class="retry-button">Retry</button>
            </div>
        `;
    } finally {
        state.loading = false;
    }
}

// Display updates
function updateDisplay() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid || state.loading) return;

    let articles = [...state.articles];

    if (state.currentFeed !== 'all') {
        articles = articles.filter(article => article.topic === state.currentFeed);
    }

    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        articles = articles.filter(article => 
            article.title.toLowerCase().includes(query) ||
            (article.description || '').toLowerCase().includes(query)
        );
    }

    articles.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

    if (articles.length === 0) {
        articleGrid.innerHTML = '<div class="no-results">No articles found</div>';
        return;
    }

    articleGrid.innerHTML = articles.map(article => `
        <article class="article-card" onclick="window.open('${article.url}', '_blank')">
            ${article.image ? `
                <img src="${article.image}" 
                     alt="${article.title}" 
                     class="article-image"
                     onerror="this.style.display='none'">
            ` : ''}
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

// Trending functionality
function updateTrending() {
    const trends = analyzeTrends();
    log('Analyzed trends:', trends);

    updateTrendingSidebar(trends);
    updateTrendingTicker(trends);
}

function analyzeTrends() {
    if (!state.articles.length) return [];

    const trends = new Map();
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    state.articles.forEach(article => {
        if (new Date(article.date_published) >= cutoff) {
            const entities = extractEntities(article);
            entities.forEach(entity => {
                if (!entity.text) return;
                
                const key = entity.text.toLowerCase();
                const trend = trends.get(key) || {
                    text: entity.text,
                    count: 0,
                    topics: new Set(),
                    articles: new Set()
                };
                trend.count++;
                trend.topics.add(article.topic);
                trend.articles.add(article.url);
                trends.set(key, trend);
            });
        }
    });

    return Array.from(trends.values())
        .filter(trend => trend.count > 1)
        .map(trend => ({
            ...trend,
            topics: Array.from(trend.topics),
            articles: Array.from(trend.articles)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
}

function updateTrendingSidebar(trends) {
    const container = document.getElementById('trendingContainer');
    if (!container) return;

    if (!trends.length) {
        container.innerHTML = '<div class="error">No trends found</div>';
        return;
    }

    container.innerHTML = trends.map(trend => `
        <div class="trending-item" onclick="searchKeyword('${trend.text}')">
            <div class="trending-keyword">${trend.text}</div>
            <div class="trending-meta">
                ${trend.count} mentions in ${trend.topics.length} ${trend.topics.length === 1 ? 'topic' : 'topics'}
                <div class="topic-badges">
                    ${trend.topics.map(topic => 
                        `<span class="topic-badge">${topic}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function updateTrendingTicker(trends) {
    const ticker = document.getElementById('tickerContent');
    if (!ticker) return;

    // Double the content for seamless loop
    const content = trends.map(trend => `
        <span class="ticker-item" onclick="searchKeyword('${trend.text}')">            
            <span class="ticker-text">${trend.text}</span>
            <span class="ticker-count">(${trend.count})</span>
        </span>
    `).join(' • ');

    ticker.innerHTML = content + ' • ' + content;
}

function extractEntities(article) {
    const entities = new Set();
    const text = `${article.title} ${article.description || ''}`;

    // Named entities (people, companies, etc.)
    const namedEntityPattern = /[A-Z][a-z]+ (?:[A-Z][a-z]+ )*[A-Z][a-z]+/g;
    const matches = text.match(namedEntityPattern) || [];
    matches.forEach(match => {
        if (match.length > 3) { // Filter out very short matches
            entities.add({ text: match });
        }
    });

    return Array.from(entities);
}

// Navigation
function switchFeed(feed) {
    state.currentFeed = feed;
    
    // Update buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.toggle('active', button.dataset.feed === feed);
    });

    updateDisplay();
}

function searchKeyword(keyword) {
    if (!keyword) return;
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = keyword;
        state.searchQuery = keyword;
        updateDisplay();
    }
}
