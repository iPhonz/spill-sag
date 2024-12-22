// App Core
class SpillApp {
    constructor(config) {
        // Ensure config exists
        this.config = config || {
            feeds: {}, 
            refreshInterval: 5 * 60 * 1000
        };

        this.state = {
            articles: [],
            currentFeed: 'all',
            searchQuery: '',
            loading: false,
            error: null,
            initialized: false
        };

        // Bind methods
        this.init = this.init.bind(this);
        this.handleError = this.handleError.bind(this);
        this.updateDisplay = this.updateDisplay.bind(this);
        this.loadFeeds = this.loadFeeds.bind(this);
    }

    async init() {
        if (this.state.initialized) return;

        try {
            // Setup initial loading state
            this.state.loading = true;
            this.updateDisplay();

            // Initialize components
            this.setupEventListeners();
            this.initClock();
            this.initWeather();
            this.renderNavigation();

            // Load content
            await this.loadFeeds();
            
            // Start refresh timer
            this.startRefreshTimer();
            
            this.state.initialized = true;
        } catch (error) {
            console.error('Initialization error:', error);
            this.handleError('Failed to initialize app', error);
        } finally {
            this.state.loading = false;
            this.updateDisplay();
        }
    }

    handleError(message, error) {
        console.error(message, error);
        this.state.error = error?.message || message;
        
        const errorText = document.getElementById('errorText');
        const errorContainer = document.getElementById('errorContainer');
        
        if (errorText && errorContainer) {
            errorText.textContent = `${message}: ${error?.message || 'Unknown error'}`;
            errorContainer.style.display = 'block';
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 5000);
        }
    }

    async loadFeeds() {
        try {
            const feedPromises = Object.entries(this.config.feeds).map(async ([topic, url]) => {
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const data = await response.json();
                    return (data.items || []).map(item => ({ ...item, topic }));
                } catch (error) {
                    console.error(`Error fetching ${topic} feed:`, error);
                    return [];
                }
            });

            const results = await Promise.allSettled(feedPromises);
            const articles = results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value)
                .flat();

            // Only throw if we have no articles at all
            if (articles.length === 0) {
                throw new Error('No articles available');
            }

            this.state.articles = articles;
            this.updateDisplay();
            this.updateTrending();
        } catch (error) {
            this.handleError('Failed to load content', error);
            throw error; // Rethrow for init error handling
        }
    }

    updateDisplay() {
        const articleGrid = document.getElementById('articleGrid');
        if (!articleGrid) {
            console.error('Article grid element not found');
            return;
        }

        // Show loading state
        if (this.state.loading && this.state.articles.length === 0) {
            articleGrid.innerHTML = this.renderLoadingGrid();
            return;
        }

        // Filter and sort articles
        let articles = [...this.state.articles];

        if (this.state.currentFeed !== 'all') {
            articles = articles.filter(article => article.topic === this.state.currentFeed);
        }

        if (this.state.searchQuery) {
            const query = this.state.searchQuery.toLowerCase();
            articles = articles.filter(article => 
                article.title.toLowerCase().includes(query) ||
                (article.description || '').toLowerCase().includes(query)
            );
        }

        // Sort by date
        articles.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

        // Show no results message if needed
        if (articles.length === 0) {
            articleGrid.innerHTML = '<div class="no-results">No articles found</div>';
            return;
        }

        // Render articles grid
        articleGrid.innerHTML = articles.map(article => `
            <article class="article-card" onclick="window.app.openArticle('${article.url}')">
                ${article.image ? `
                    <img src="${article.image}" 
                         alt="${article.title}" 
                         class="article-image"
                         onerror="this.style.display='none'">
                ` : `
                    <div class="article-image placeholder-image"></div>
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

    openArticle(url) {
        if (url) window.open(url, '_blank');
    }

    renderLoadingGrid() {
        return `
            <div class="loading-grid">
                ${Array(6).fill().map(() => `
                    <div class="loading-card">
                        <div class="loading-image"></div>
                        <div class="loading-content">
                            <div class="loading-title"></div>
                            <div class="loading-meta"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // [Rest of the code remains the same...]
}

// Initialize app with config
const app = new SpillApp(window.APP_CONFIG);

// Export for global access
window.app = app;

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}