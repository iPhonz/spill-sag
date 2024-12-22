// State management
const state = {
    articles: [],
    currentFeed: 'all',  // Set default feed to 'all'
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
document.addEventListener('DOMContentLoaded', async () => {
    log('App initializing...');
    setupEventListeners();
    await loadFeeds();  // Wait for initial load
    updateDisplay();    // Ensure display is updated after load
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
        return []; // Return empty array instead of throwing
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

        const results = await Promise.allSettled(feedPromises);
        state.articles = results
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value)
            .flat();

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
        // Force display update even if there was an error
        if (state.articles.length > 0) {
            updateDisplay();
        }
    }
}

// Display updates
function updateDisplay() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    // Don't return if loading - we might have articles to show
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

// [Rest of the code remains unchanged...]