// Initialize trending analyzer
const trendAnalyzer = new AdvancedTrendAnalyzer();

// State management
let allArticles = [];
let currentFeed = 'all';
let searchQuery = '';

// RSS Feed URLs
const feeds = {
    movies: 'https://rss.app/feeds/v1.1/_6QzByBP0Y0E9bL0O.json',
    music: 'https://rss.app/feeds/v1.1/_p1hbSzosU9dbDQWx.json',
    money: 'https://rss.app/feeds/v1.1/_fcZVOvvC7xA6iz8u.json',
    popculture: 'https://rss.app/feeds/v1.1/_8Tib7bkE02swlmp7.json',
    sports: 'https://rss.app/feeds/v1.1/_5pZybCiMDbl5fBo8.json',
    tech: 'https://rss.app/feeds/v1.1/_GNEAg9D5CvYRIxAQ.json'
};

// Fetch individual feed
async function fetchFeed(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Error fetching feed:', error);
        return [];
    }
}

// Fetch all feeds
async function fetchAllFeeds() {
    const articleGrid = document.getElementById('articleGrid');
    articleGrid.innerHTML = '<div class="loading">Loading articles...</div>';

    try {
        const feedPromises = Object.entries(feeds).map(async ([topic, url]) => {
            const articles = await fetchFeed(url);
            return articles.map(article => ({ ...article, topic }));
        });

        allArticles = (await Promise.all(feedPromises)).flat();
        if (allArticles.length === 0) throw new Error('No articles loaded');
        
        updateDisplay();
        updateTrending();
    } catch (error) {
        articleGrid.innerHTML = `<div class="error">Failed to load content: ${error.message}</div>`;
        console.error('Feed loading error:', error);
    }
}

// Update article display
function updateDisplay() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid) return;

    let filteredArticles = allArticles;

    if (currentFeed !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.topic === currentFeed);
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredArticles = filteredArticles.filter(article => 
            article.title.toLowerCase().includes(query) ||
            (article.description || '').toLowerCase().includes(query)
        );
    }

    filteredArticles.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

    if (filteredArticles.length === 0) {
        articleGrid.innerHTML = '<div class="no-results">No articles found</div>';
        return;
    }

    articleGrid.innerHTML = filteredArticles.map(article => `
        <article class="article-card" onclick="window.open('${article.url}', '_blank')">
            ${article.image ? `
                <div class="article-image-container">
                    <img src="${article.image}" alt="${article.title}" class="article-image"
                         onerror="this.style.display='none'">
                </div>
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

// Fix navigation highlighting
function showFeed(feed) {
    currentFeed = feed;
    
    // Remove active class from all buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
    });

    // Map feed names to button text
    const feedToButtonText = {
        'all': 'All News',
        'movies': 'Movies & TV',
        'tech': 'Technology & AI',
        'popculture': 'Pop Culture',
        'music': 'Music',
        'money': 'Money',
        'sports': 'Sports'
    };

    // Find and activate the correct button
    const buttonText = feedToButtonText[feed] || feed;
    const button = Array.from(document.querySelectorAll('.nav-button'))
        .find(btn => btn.textContent.trim() === buttonText);
    
    if (button) {
        button.classList.add('active');
    }

    updateDisplay();
}

// Update trending section
function updateTrending() {
    const trendingContainer = document.getElementById('trendingContainer');
    if (!trendingContainer) return;

    const trends = trendAnalyzer.analyzeTrends(allArticles);

    if (trends.length === 0) {
        trendingContainer.innerHTML = '<div class="no-trends">No trending topics found</div>';
        return;
    }

    trendingContainer.innerHTML = trends.map(trend => {
        const context = trendAnalyzer.entityContext.get(trend.entity);
        const topicsList = context ? Array.from(context.topics)
            .map(topic => `<span class="topic-tag">${topic}</span>`).join('') : '';

        return `
            <div class="trending-item" onclick="searchKeyword('${trend.entity}')">
                <div class="trending-keyword">${trend.entity}</div>
                <div class="trending-meta">
                    <span>${trend.mentions} mentions in 24h</span>
                    <div class="topic-tags">${topicsList}</div>
                </div>
            </div>
        `;
    }).join('');
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

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            updateDisplay();
        });
    }

    // Initial load
    fetchAllFeeds();

    // Refresh every 5 minutes
    setInterval(fetchAllFeeds, 5 * 60 * 1000);
});
