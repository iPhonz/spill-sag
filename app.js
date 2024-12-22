// State management
const state = {
    articles: [],
    currentFeed: 'all',
    searchQuery: '',
    loading: true,
    error: null
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

// Initialize app
async function initializeApp() {
    if (window.SPILL.initialized) return;
    
    try {
        setupEventListeners();
        await loadInitialContent();
        window.SPILL.initialized = true;
        window.SPILL.loaded = true;
    } catch (error) {
        console.error('Initialization error:', error);
        window.SPILL.error = error.message;
        showError('Failed to initialize app: ' + error.message);
    }
}

// Event listeners setup
function setupEventListeners() {
    // Search handler
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            updateDisplay();
        });
    }

    // Navigation handlers
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            const feed = button.dataset.feed;
            if (feed) {
                switchFeed(feed);
                document.querySelectorAll('.nav-button').forEach(btn => 
                    btn.classList.toggle('active', btn === button));
            }
        });
    });
}

// Initial content loading
async function loadInitialContent() {
    state.loading = true;
    updateLoadingState();

    try {
        await loadFeeds();
        if (state.articles.length === 0) {
            throw new Error('No articles available');
        }
        updateDisplay();
        updateTrending();
    } catch (error) {
        console.error('Content loading error:', error);
        throw error;
    } finally {
        state.loading = false;
        updateLoadingState();
    }
}

// Update loading state
function updateLoadingState() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    if (state.loading && state.articles.length === 0) {
        articleGrid.innerHTML = '<div class="loading">Loading articles...</div>';
    }
}

// Show error message
function showError(message) {
    const articleGrid = document.getElementById('articleGrid');
    if (articleGrid) {
        articleGrid.innerHTML = `
            <div class="error">
                ${message}
                <button onclick="initializeApp()" class="retry-button">Retry</button>
            </div>
        `;
    }
}

// Feed management
async function loadFeeds() {
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

        state.articles = newArticles;
    } catch (error) {
        console.error('Error loading feeds:', error);
        throw error;
    }
}

// Display updates
function updateDisplay() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

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

// Navigation
function switchFeed(feed) {
    state.currentFeed = feed;
    updateDisplay();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Auto-refresh content
setInterval(() => {
    if (window.SPILL.initialized) {
        loadFeeds().then(() => {
            updateDisplay();
            updateTrending();
        }).catch(console.error);
    }
}, 5 * 60 * 1000); // Every 5 minutes