// Initialize trend analyzer
const trendAnalyzer = new TrendAnalyzer();

// RSS Feed URLs
const feeds = {
    movies: 'https://rss.app/feeds/v1.1/_6QzByBP0Y0E9bL0O.json',
    music: 'https://rss.app/feeds/v1.1/_p1hbSzosU9dbDQWx.json',
    money: 'https://rss.app/feeds/v1.1/_fcZVOvvC7xA6iz8u.json',
    popculture: 'https://rss.app/feeds/v1.1/_8Tib7bkE02swlmp7.json',
    sports: 'https://rss.app/feeds/v1.1/_5pZybCiMDbl5fBo8.json',
    tech: 'https://rss.app/feeds/v1.1/_GNEAg9D5CvYRIxAQ.json'
};

// State management
let allArticles = [];
let currentFeed = 'all';
let searchQuery = '';

// Debug logging
const debug = true;
function log(message, data) {
    if (debug) {
        console.log(`[DEBUG] ${message}:`, data);
    }
}

// Fetch feed data with error handling
async function fetchFeed(url) {
    try {
        log('Fetching feed', url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        log('Feed data received', { url, itemCount: data.items?.length });
        return data.items || [];
    } catch (error) {
        console.error(`Error fetching feed: ${url}`, error);
        throw error;
    }
}

// Load all feeds
async function loadFeeds() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) {
        console.error('Article grid element not found');
        return;
    }

    articleGrid.innerHTML = '<div class="loading">Loading articles...</div>';
    log('Starting feed load');

    try {
        const feedPromises = Object.entries(feeds).map(async ([topic, url]) => {
            const articles = await fetchFeed(url);
            return articles.map(article => ({ ...article, topic }));
        });

        const results = await Promise.all(feedPromises);
        allArticles = results.flat();

        log('All feeds loaded', { articleCount: allArticles.length });

        if (allArticles.length === 0) {
            throw new Error('No articles found');
        }

        updateDisplay();
        updateTrending();
    } catch (error) {
        console.error('Error loading feeds:', error);
        articleGrid.innerHTML = `
            <div class="error">
                Failed to load articles: ${error.message}
                <button onclick="loadFeeds()" class="retry-button">Retry</button>
            </div>
        `;
    }
}

// Update article display
function updateDisplay() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) {
        console.error('Article grid element not found');
        return;
    }

    let articles = [...allArticles];
    log('Updating display', { totalArticles: articles.length, currentFeed, searchQuery });

    if (currentFeed !== 'all') {
        articles = articles.filter(article => article.topic === currentFeed);
        log('Filtered by feed', { filteredCount: articles.length });
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        articles = articles.filter(article => 
            article.title.toLowerCase().includes(query) ||
            (article.description || '').toLowerCase().includes(query)
        );
        log('Filtered by search', { filteredCount: articles.length });
    }

    articles.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

    if (articles.length === 0) {
        articleGrid.innerHTML = '<div class="no-results">No articles found</div>';
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

    log('Display updated', { renderedArticles: articles.length });
}

// Switch feed category
function switchFeed(feed) {
    log('Switching feed', { from: currentFeed, to: feed });
    currentFeed = feed;
    
    // Update navigation buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        const feedId = button.dataset.feed;
        button.classList.toggle('active', feedId === feed);
    });

    updateDisplay();
}

// Update trending section
function updateTrending() {
    const trendingContainer = document.getElementById('trendingContainer');
    if (!trendingContainer) {
        console.error('Trending container not found');
        return;
    }

    log('Analyzing trends');
    const trends = trendAnalyzer.analyzeTrends(allArticles);
    log('Trends analyzed', { trendCount: trends.length });

    if (trends.length === 0) {
        trendingContainer.innerHTML = '<div class="error">No trends found</div>';
        return;
    }

    trendingContainer.innerHTML = trends.map(trend => {
        const topicBadges = trend.topics.map(topic => 
            `<span class="topic-badge">${topic}</span>`
        ).join('');

        const typeIcon = getTypeIcon(trend.type);

        return `
            <div class="trending-item" onclick="searchKeyword('${trend.entity}')">
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
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    log('Initializing app');
    
    // Set up search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            updateDisplay();
        });
    }

    // Set up navigation
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            const feed = button.dataset.feed;
            if (feed) {
                switchFeed(feed);
            }
        });
    });

    // Initial load
    loadFeeds();

    // Refresh every 5 minutes
    setInterval(loadFeeds, 5 * 60 * 1000);
});

// Additional styles
const styles = `
    .retry-button {
        margin-left: 1rem;
        padding: 0.5rem 1rem;
        background: var(--primary);
        border: none;
        border-radius: 4px;
        color: white;
        cursor: pointer;
    }

    .no-results {
        text-align: center;
        padding: 2rem;
        color: var(--text-secondary);
    }

    .loading {
        text-align: center;
        padding: 2rem;
        color: var(--text-secondary);
    }

    .error {
        text-align: center;
        padding: 1rem;
        color: #ff4444;
        background: rgba(255, 0, 0, 0.1);
        border-radius: 4px;
        margin: 1rem 0;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);