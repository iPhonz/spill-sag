class SpillApp {
    constructor(config) {
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

        this.init = this.init.bind(this);
        this.handleError = this.handleError.bind(this);
        this.updateDisplay = this.updateDisplay.bind(this);
        this.loadFeeds = this.loadFeeds.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }

    handleSearch(event) {
        const searchInput = event.target;
        this.state.searchQuery = searchInput.value.trim().toLowerCase();
        this.updateDisplay();
    }

    showTrendArticles(trendJson) {
        try {
            const trend = JSON.parse(decodeURIComponent(trendJson));
            this.state.searchQuery = trend.phrase;
            document.querySelector('#searchInput').value = trend.phrase;
            this.updateDisplay();

            const firstArticle = document.querySelector('.article-card');
            if (firstArticle) {
                firstArticle.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            this.handleError('Failed to show trend articles', error);
        }
    }

    updateDisplay() {
        const articleGrid = document.getElementById('articleGrid');
        if (!articleGrid) return;

        if (this.state.loading && this.state.articles.length === 0) {
            articleGrid.innerHTML = this.renderLoadingGrid();
            return;
        }

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

        articles.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

        if (articles.length === 0) {
            articleGrid.innerHTML = '<div class="no-results">No articles found</div>';
            return;
        }

        articleGrid.innerHTML = articles.map(article => this.renderArticleCard(article)).join('');

        // Update trending after display update
        if (window.updateTrending) {
            window.updateTrending(this.state.articles);
        }
    }

    renderArticleCard(article) {
        return `
            <article class="article-card" onclick="window.app.openArticle('${article.url}')">
                ${article.image ? `
                    <img src="${article.image}" 
                         alt="${article.title}" 
                         class="article-image"
                         loading="lazy"
                         onerror="this.style.display='none'">
                ` : `
                    <div class="article-image placeholder-image"></div>
                `}
                <div class="article-content">
                    <h2 class="article-title">${article.title}</h2>
                    <div class="article-meta">
                        <span>${new Date(article.date_published).toLocaleDateString()}</span>
                        <span class="topic-badge">${article.topic}</span>
                    </div>
                </div>
            </article>
        `;
    }

    // ... [rest of the existing methods remain unchanged]
}

const app = new SpillApp(window.APP_CONFIG);
window.app = app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}
