// App Core
class SpillApp {
    constructor(config) {
        this.config = config;
        this.state = {
            articles: [],
            currentFeed: 'all',
            searchQuery: '',
            loading: false,
            error: null
        };
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadFeeds();
            this.initClock();
            this.initWeather();
            this.renderNavigation();
            this.updateDisplay();
            this.startRefreshTimer();
        } catch (error) {
            this.handleError('Failed to initialize app', error);
        }
    }

    handleError(message, error) {
        console.error(message, error);
        this.state.error = error.message;
        
        const errorText = document.getElementById('errorText');
        const errorContainer = document.getElementById('errorContainer');
        
        if (errorText && errorContainer) {
            errorText.textContent = `${message}: ${error.message}`;
            errorContainer.style.display = 'block';
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 5000);
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.state.searchQuery = e.target.value;
                this.updateDisplay();
            });
        }

        const navContent = document.getElementById('navContent');
        if (navContent) {
            navContent.addEventListener('click', (e) => {
                const button = e.target.closest('.nav-button');
                if (button) {
                    const feed = button.dataset.feed;
                    if (feed) {
                        this.switchFeed(feed);
                        this.updateNavigation(button);
                    }
                }
            });
        }

        window.addEventListener('error', (e) => {
            this.handleError('Runtime error', e.error);
        });
    }

    updateNavigation(activeButton) {
        document.querySelectorAll('.nav-button').forEach(btn => 
            btn.classList.toggle('active', btn === activeButton));
    }

    renderNavigation() {
        const navContent = document.getElementById('navContent');
        if (!navContent) return;

        const feeds = ['all', ...Object.keys(this.config.feeds)];
        const buttons = feeds.map(feed => {
            const isAll = feed === 'all';
            const label = isAll ? 'All News' : 
                feed.charAt(0).toUpperCase() + feed.slice(1).replace(/([A-Z])/g, ' $1');
            
            return `
                <button class="nav-button${isAll ? ' active' : ''}" data-feed="${feed}">
                    ${label}
                </button>
            `;
        });

        navContent.innerHTML = buttons.join('');
    }

    async loadFeeds() {
        this.state.loading = true;
        this.updateDisplay();

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

            if (articles.length === 0) {
                throw new Error('No articles available');
            }

            this.state.articles = articles;
            this.updateTrending();
        } catch (error) {
            this.handleError('Failed to load feeds', error);
        } finally {
            this.state.loading = false;
            this.updateDisplay();
        }
    }

    updateDisplay() {
        const articleGrid = document.getElementById('articleGrid');
        if (!articleGrid) return;

        if (this.state.loading && this.state.articles.length === 0) {
            articleGrid.innerHTML = '<div class="loading">Loading articles...</div>';
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

    updateTrending() {
        const trends = this.analyzeTrends();
        this.updateTrendingSidebar(trends);
        this.updateTicker(trends);
    }

    analyzeTrends() {
        if (!this.state.articles.length) return [];

        const trends = new Map();
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - 24);

        this.state.articles.forEach(article => {
            if (new Date(article.date_published) >= cutoff) {
                const entities = this.extractEntities(article);
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
            .slice(0, 8);
    }

    extractEntities(article) {
        const entities = new Set();
        const text = `${article.title} ${article.description || ''}`;

        const patterns = [
            /[A-Z][a-z]+ (?:[A-Z][a-z]+ )*[A-Z][a-z]+/g,
            /(?:[A-Z][a-z]*|[A-Z]+) ?(?:\d+|[A-Z]+)[A-Za-z0-9]*/g,
            /#[A-Za-z][A-Za-z0-9]+/g
        ];

        patterns.forEach(pattern => {
            const matches = text.match(pattern) || [];
            matches.forEach(match => {
                if (match.length > 3 && !match.includes('The') && !match.includes('And')) {
                    entities.add({ text: match.trim() });
                }
            });
        });

        return Array.from(entities);
    }

    updateTrendingSidebar(trends) {
        const container = document.getElementById('trendingContainer');
        if (!container) return;

        if (!trends.length) {
            container.innerHTML = '<div class="loading">Analyzing trends...</div>';
            return;
        }

        container.innerHTML = trends.map(trend => `
            <div class="trending-item" onclick="app.searchKeyword('${trend.text}')">
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

    updateTicker(trends) {
        const ticker = document.getElementById('tickerContent');
        if (!ticker || !trends.length) return;

        const content = trends.map(trend => 
            `<span class="ticker-item" onclick="app.searchKeyword('${trend.text}')">` +
            `${trend.text} (${trend.count})` +
            '</span>'
        ).join(' • ');

        ticker.innerHTML = `${content} • ${content} • ${content}`;
        this.resetTickerAnimation(ticker);
    }

    resetTickerAnimation(ticker) {
        ticker.style.animation = 'none';
        ticker.offsetHeight; // Force reflow
        ticker.style.animation = 'ticker 30s linear infinite';
    }

    searchKeyword(keyword) {
        if (!keyword) return;
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = keyword;
            this.state.searchQuery = keyword;
            this.updateDisplay();
        }
    }

    switchFeed(feed) {
        this.state.currentFeed = feed;
        this.updateDisplay();
    }

    initClock() {
        const updateTime = () => {
            const timeElement = document.getElementById('localTime');
            if (timeElement) {
                const now = new Date();
                timeElement.textContent = now.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            }
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    initWeather() {
        const updateWeather = () => {
            const weatherElement = document.getElementById('weatherTemp');
            if (weatherElement) {
                const temp = Math.round(50 + (Math.random() * 10 - 5));
                weatherElement.textContent = `${temp}°F`;
            }
        };

        updateWeather();
        setInterval(updateWeather, 5 * 60 * 1000);
    }

    startRefreshTimer() {
        setInterval(() => {
            this.loadFeeds().catch(error => 
                this.handleError('Failed to refresh feeds', error)
            );
        }, this.config.refreshInterval || 5 * 60 * 1000);
    }
}

// Initialize app
const app = new SpillApp(window.APP_CONFIG || {});

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Make app instance available globally for event handlers
window.app = app;