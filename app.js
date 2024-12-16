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

// Fetch feed data
async function fetchFeed(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Error fetching feed:', error);
        throw error;
    }
}

// Initialize app
async function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    // Load initial content
    await loadFeeds();
    // Start refresh cycle
    setInterval(loadFeeds, 5 * 60 * 1000);
}

// Set up event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            updateDisplay();
        });
    }

    // Navigation buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const feed = e.target.dataset.feed;
            if (feed) {
                switchFeed(feed);
            }
        });
    });
}

// Switch feed category
function switchFeed(feed) {
    currentFeed = feed;
    
    // Update navigation buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.toggle('active', button.dataset.feed === feed);
    });

    updateDisplay();
}

// Search functionality
function searchKeyword(keyword) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = keyword;
        searchQuery = keyword;
        updateDisplay();
    }
}

// Load all feeds
async function loadFeeds() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    articleGrid.innerHTML = '<div class="loading">Loading articles...</div>';

    try {
        const feedPromises = Object.entries(feeds).map(async ([topic, url]) => {
            const articles = await fetchFeed(url);
            return articles.map(article => ({ ...article, topic }));
        });

        const results = await Promise.all(feedPromises);
        allArticles = results.flat();

        if (allArticles.length === 0) {
            throw new Error('No articles found');
        }

        updateDisplay();
        updateTrending();
    } catch (error) {
        articleGrid.innerHTML = `
            <div class="error">
                Failed to load articles: ${error.message}
                <button onclick="loadFeeds()" style="margin-left: 1rem;">Retry</button>
            </div>
        `;
    }
}

// Update article display
function updateDisplay() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    let articles = [...allArticles];

    if (currentFeed !== 'all') {
        articles = articles.filter(article => article.topic === currentFeed);
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        articles = articles.filter(article => 
            article.title.toLowerCase().includes(query) ||
            (article.description || '').toLowerCase().includes(query)
        );
    }

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

// Update trending topics
function updateTrending() {
    const trendingContainer = document.getElementById('trendingContainer');
    if (!trendingContainer) return;

    const keywords = {};
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    allArticles.forEach(article => {
        const pubDate = new Date(article.date_published);
        if (pubDate >= cutoff) {
            const text = `${article.title} ${article.description || ''}`;
            const words = text.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter(word => word.length > 3);

            words.forEach(word => {
                keywords[word] = (keywords[word] || 0) + 1;
            });
        }
    });

    const trends = Object.entries(keywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    if (trends.length === 0) {
        trendingContainer.innerHTML = '<div class="error">No trends found</div>';
        return;
    }

    trendingContainer.innerHTML = trends.map(([keyword, count]) => `
        <div class="trending-item" onclick="searchKeyword('${keyword}')">
            <div class="trending-keyword">${keyword}</div>
            <div class="trending-meta">${count} mentions in 24h</div>
        </div>
    `).join('');
}

// Initialize the app
document.addEventListener('DOMContentLoaded', initializeApp);
