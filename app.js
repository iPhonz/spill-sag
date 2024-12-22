// State management
const state = {
    articles: [],
    currentFeed: 'all',
    searchQuery: '',
    loading: false,
    error: null,
    initialized: false
};

// RSS Feed URLs
const feeds = {
    movies: 'https://rss.app/feeds/v1.1/_6QzByBP0Y0E9bL0O.json',
    music: 'https://rss.app/feeds/v1.1/_p1hbSzosU9dbDQWx.json',
    money: 'https://rss.app/feeds/v1.1/_fcZVOvvC7xA6iz8u.json',
    popculture: 'https://rss.app/feeds/v1.1/_8Tib7bkE02swlmp7.json',
    sports: 'https://rss.app/feeds/v1.1/_5pZybCiMDbl5fBo8.json',
    tech: 'https://rss.app/feeds/v1.1/_GNEAg9D5CvYRIxAQ.json',
    fashion: 'https://rss.app/feeds/v1.1/_X9X9xi6xSA6xfdiQ.json',
    fitness: 'https://rss.app/feeds/v1.1/_ZyirDaQbugpe4PNr.json',
    food: 'https://rss.app/feeds/v1.1/_6RwC4gFPZtiWlR0F.json',
    gaming: 'https://rss.app/feeds/v1.1/_AYgIOThx2i44ju3d.json'
};

// Initialize immediately
document.addEventListener('DOMContentLoaded', () => {
    setupNavigationHandlers();
    setupSearchHandler();
    loadInitialContent();
    startTicker();
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(loadFeeds, 5 * 60 * 1000); // Refresh every 5 minutes
});

// Setup navigation event handlers
function setupNavigationHandlers() {
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const feed = button.dataset.feed;
            if (feed) {
                switchFeed(feed);
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            }
        });
    });
}

// Setup search handler
function setupSearchHandler() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            updateDisplay();
        });
    }
}

// Initial content loading
async function loadInitialContent() {
    if (state.initialized) return;
    
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    state.loading = true;
    state.error = null;
    articleGrid.innerHTML = '<div class="loading">Loading articles...</div>';

    try {
        await loadFeeds();
        state.initialized = true;
    } catch (error) {
        console.error('Initialization error:', error);
        state.error = error.message;
    } finally {
        state.loading = false;
        updateDisplay();
    }
}

// Feed fetching
async function loadFeeds() {
    state.loading = true;

    try {
        const feedPromises = Object.entries(feeds).map(async ([topic, url]) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                return (data.items || []).map(item => ({ ...item, topic }));
            } catch (error) {
                console.error(`Error fetching ${topic} feed:`, error);
                return [];
            }
        });

        const results = await Promise.allSettled(feedPromises);
        const newArticles = results
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value)
            .flat();

        if (newArticles.length === 0 && !state.articles.length) {
            throw new Error('No articles available');
        }

        state.articles = newArticles;
        updateDisplay();
        updateTrending();
    } catch (error) {
        state.error = error.message;
        console.error('Error loading feeds:', error);
    } finally {
        state.loading = false;
    }
}

// Display updates
function updateDisplay() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    if (state.loading && state.articles.length === 0) {
        articleGrid.innerHTML = '<div class="loading">Loading articles...</div>';
        return;
    }

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
        articleGrid.innerHTML = `
            <div class="no-results">
                ${state.error ? `Error: ${state.error}` : 'No articles found'}
                ${state.error ? '<button onclick="loadInitialContent()" class="retry-button">Retry</button>' : ''}
            </div>
        `;
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

// Navigation
function switchFeed(feed) {
    state.currentFeed = feed;
    updateDisplay();
}

// Trending analysis
function updateTrending() {
    const trends = analyzeTrends();
    updateTrendingSidebar(trends);
    updateTicker(trends);
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

function extractEntities(article) {
    const entities = new Set();
    const text = `${article.title} ${article.description || ''}`;

    // Named entities (people, companies, etc.)
    const namedEntityPattern = /[A-Z][a-z]+ (?:[A-Z][a-z]+ )*[A-Z][a-z]+/g;
    const matches = text.match(namedEntityPattern) || [];
    matches.forEach(match => {
        if (match.length > 3) {
            entities.add({ text: match });
        }
    });

    return Array.from(entities);
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

function updateTicker(trends) {
    const ticker = document.getElementById('tickerContent');
    if (!ticker || !trends.length) return;

    const content = trends.map(trend => `
        <span class="ticker-item" onclick="searchKeyword('${trend.text}')">
            ${trend.text} (${trend.count})
        </span>
    `).join(' • ');

    ticker.innerHTML = content + ' • ' + content;
}

function startTicker() {
    const ticker = document.getElementById('tickerContent');
    if (!ticker) return;

    ticker.style.animation = 'none';
    ticker.offsetHeight; // Trigger reflow
    ticker.style.animation = null;
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

// Clock update
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
