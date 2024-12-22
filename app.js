// State management with loading states per feed
const state = {
    articles: [],
    currentFeed: 'all',
    searchQuery: '',
    loading: false,
    feedStates: {},  // Track loading state per feed
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
    tech: 'https://rss.app/feeds/v1.1/_GNEAg9D5CvYRIxAQ.json'
};

// Initialize feed states
Object.keys(feeds).forEach(feed => {
    state.feedStates[feed] = {
        loading: false,
        error: null,
        lastUpdated: null
    };
});

// Initialize immediately with improved loading management
document.addEventListener('DOMContentLoaded', () => {
    log('App initializing...');
    setupEventListeners();
    initializeContent();
});

// New initialization function with better state management
async function initializeContent() {
    if (state.initialized) return;
    
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    state.loading = true;
    state.error = null;
    updateLoadingUI();

    try {
        await loadFeeds();
        state.initialized = true;
    } catch (error) {
        log('Initialization error:', error);
        state.error = error.message;
    } finally {
        state.loading = false;
        updateDisplay();
    }
}

// Update loading UI based on state
function updateLoadingUI() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    if (state.loading && state.articles.length === 0) {
        articleGrid.innerHTML = `
            <div class="loading-container">
                <div class="loading">Loading articles...</div>
                <div class="loading-status">
                    ${Object.entries(state.feedStates)
                        .map(([feed, status]) => 
                            `<div class="feed-status ${status.loading ? 'loading' : status.error ? 'error' : 'done'}">
                                ${feed}: ${status.loading ? 'Loading...' : status.error ? 'Error' : 'Done'}
                            </div>`
                        ).join('')}
                </div>
            </div>
        `;
    }
}

// Debug logging
function log(message, data = '') {
    console.log(`[SPILL] ${message}`, data);
}

// Event listeners setup
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            updateDisplay();
        });
    }

    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            const feed = button.dataset.feed;
            if (feed) {
                switchFeed(feed);
            }
        });
    });
}

// Improved feed management with individual feed state tracking
async function fetchFeed(topic, url) {
    state.feedStates[topic].loading = true;
    state.feedStates[topic].error = null;
    updateLoadingUI();

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        state.feedStates[topic].lastUpdated = new Date();
        return data.items || [];
    } catch (error) {
        state.feedStates[topic].error = error.message;
        return [];
    } finally {
        state.feedStates[topic].loading = false;
        updateLoadingUI();
    }
}

// Enhanced feed loading with better state management
async function loadFeeds() {
    state.loading = true;
    updateLoadingUI();

    try {
        const feedPromises = Object.entries(feeds).map(async ([topic, url]) => {
            const items = await fetchFeed(topic, url);
            return items.map(item => ({ ...item, topic }));
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
        log('Error loading feeds:', error);
    } finally {
        state.loading = false;
        updateLoadingUI();
    }
}

// Enhanced display updates with loading state handling
function updateDisplay() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    if (state.loading && state.articles.length === 0) {
        updateLoadingUI();
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
                ${state.error ? '<button onclick="initializeContent()" class="retry-button">Retry</button>' : ''}
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

// [Rest of the code remains unchanged...]
