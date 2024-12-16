// State management
const state = {
    articles: [],
    currentFeed: 'all',
    searchQuery: '',
    loading: false,
    error: null
};

// Feed URLs
const feeds = {
    movies: 'https://rss.app/feeds/v1.1/_6QzByBP0Y0E9bL0O.json',
    music: 'https://rss.app/feeds/v1.1/_p1hbSzosU9dbDQWx.json',
    money: 'https://rss.app/feeds/v1.1/_fcZVOvvC7xA6iz8u.json',
    popculture: 'https://rss.app/feeds/v1.1/_8Tib7bkE02swlmp7.json',
    sports: 'https://rss.app/feeds/v1.1/_5pZybCiMDbl5fBo8.json',
    tech: 'https://rss.app/feeds/v1.1/_GNEAg9D5CvYRIxAQ.json'
};

// Fetch single feed
async function fetchFeed(topic, url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return (data.items || []).map(item => ({ ...item, topic }));
    } catch (error) {
        console.error(`Error fetching ${topic} feed:`, error);
        throw error;
    }
}

// Load all feeds
async function loadFeeds() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    state.loading = true;
    state.error = null;
    articleGrid.innerHTML = '<div class="loading">Loading articles...</div>';

    try {
        const feedPromises = Object.entries(feeds).map(([topic, url]) => fetchFeed(topic, url));
        const results = await Promise.all(feedPromises);
        state.articles = results.flat();
        updateDisplay();
        updateTrending();
    } catch (error) {
        state.error = error.message;
        articleGrid.innerHTML = `
            <div class="error">
                Failed to load articles: ${error.message}
                <button class="retry-button" onclick="loadFeeds()">Retry</button>
            </div>
        `;
    } finally {
        state.loading = false;
    }
}

// Update article display
function updateDisplay() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    let articles = [...state.articles];

    // Apply filters
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

    // Sort by date
    articles.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

    if (articles.length === 0) {
        articleGrid.innerHTML = '<div class="error">No articles found</div>';
        return;
    }

    articleGrid.innerHTML = articles.map(article => `
        <article class="article-card" onclick="window.open('${article.url}', '_blank')">
            ${article.image ? `
                <img 
                    src="${article.image}" 
                    alt="${article.title}" 
                    class="article-image"
                    onerror="this.style.display='none'"
                >
            ` : ''}
            <div class="article-content">
                <h2 class="article-title">${article.title}</h2>
                <div class="article-meta">
                    <span>${new Date(article.date_published).toLocaleDateString()}</span>
                    <span>${article.topic.charAt(0).toUpperCase() + article.topic.slice(1)}</span>
                </div>
            </div>
        </article>
    `).join('');
}

// Update trending section
function updateTrending() {
    const trendingContainer = document.getElementById('trendingContainer');
    if (!trendingContainer || !state.articles.length) return;

    try {
        const trends = trendAnalyzer.analyzeTrends(state.articles);

        if (!trends.length) {
            trendingContainer.innerHTML = '<div class="error">No trends found</div>';
            return;
        }

        trendingContainer.innerHTML = trends.map(trend => {
            const topicBadges = trend.topics.map(topic => 
                `<span class="topic-badge">${topic}</span>`
            ).join('');

            const typeIcon = getTypeIcon(trend.type);

            return `
                <div class="trending-item" onclick="setSearch('${trend.entity}')">
                    <div class="trending-header">
                        <span class="trend-type">${typeIcon}</span>
                        <div class="trending-keyword">${trend.entity}</div>
                    </div>
                    <div class="trending-meta">
                        <span>${trend.mentions} mentions</span>
                        <div class="topic-badges">${topicBadges}</div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error updating trends:', error);
        trendingContainer.innerHTML = '<div class="error">Error analyzing trends</div>';
    }
}

// Get icon for trend type
function getTypeIcon(type) {
    const icons = {
        name: '👤',
        organization: '🏢',
        brand: '™️',
        team: '🏆',
        entertainment: '🎭',
        tech: '💻',
        phrase: '📰'
    };
    return icons[type] || '📌';
}

// Set search query
function setSearch(query) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = query;
        state.searchQuery = query;
        updateDisplay();
    }
}

// Switch feed
function switchFeed(feed) {
    state.currentFeed = feed;
    
    // Update navigation buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.toggle('active', button.dataset.feed === feed);
    });

    updateDisplay();
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Set up search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            updateDisplay();
        });
    }

    // Set up navigation
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            const feed = button.dataset.feed;
            if (feed) switchFeed(feed);
        });
    });

    // Initial load
    loadFeeds();

    // Refresh every 5 minutes
    setInterval(loadFeeds, 5 * 60 * 1000);
});
