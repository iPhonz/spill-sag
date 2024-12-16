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

// Common words to exclude from trending
const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which'
]);

// Fetch feed data
async function fetchFeed(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Error fetching feed:', error);
        return [];
    }
}

// Fetch all feeds
async function fetchAllFeeds() {
    const articlesGrid = document.getElementById('articlesGrid');
    articlesGrid.innerHTML = '<div class="loading">Loading articles...</div>';

    try {
        const feedPromises = Object.entries(feeds).map(async ([topic, url]) => {
            const articles = await fetchFeed(url);
            return articles.map(article => ({ ...article, topic }));
        });

        allArticles = (await Promise.all(feedPromises)).flat();
        updateDisplay();
        updateTrending();
    } catch (error) {
        articlesGrid.innerHTML = `<div class="error">Failed to load feeds: ${error.message}</div>`;
    }
}

// Update articles display
function updateDisplay() {
    const articlesGrid = document.getElementById('articlesGrid');
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

    articlesGrid.innerHTML = filteredArticles.map(article => `
        <article class="article-card" onclick="window.open('${article.url}', '_blank')">
            ${article.image ? `<img src="${article.image}" alt="${article.title}" class="article-image">` : ''}
            <div class="article-content">
                <h3 class="article-title">${article.title}</h3>
                <div class="article-meta">
                    <span>${new Date(article.date_published).toLocaleDateString()}</span>
                    <span>${article.topic.charAt(0).toUpperCase() + article.topic.slice(1)}</span>
                </div>
            </div>
        </article>
    `).join('') || '<div class="no-results">No articles found</div>';
}

// Extract keywords from text
function extractKeywords(text) {
    return text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => 
            word.length > 2 && 
            !commonWords.has(word) && 
            !/^\d+$/.test(word)
        );
}

// Update trending topics
function updateTrending() {
    const keywords = {};
    const keywordArticles = {};
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 1);

    allArticles.forEach(article => {
        const pubDate = new Date(article.date_published);
        if (pubDate >= cutoff) {
            const text = `${article.title} ${article.description || ''}`;
            const articleKeywords = extractKeywords(text);
            
            articleKeywords.forEach(keyword => {
                keywords[keyword] = (keywords[keyword] || 0) + 1;
                if (!keywordArticles[keyword]) keywordArticles[keyword] = [];
                keywordArticles[keyword].push(article);
            });
        }
    });

    const trendingContainer = document.getElementById('trendingContainer');
    const topKeywords = Object.entries(keywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    trendingContainer.innerHTML = topKeywords.map(([keyword, count]) => `
        <div class="trending-item" onclick="searchKeyword('${keyword}')">
            <div class="trending-keyword">${keyword}</div>
            <div class="trending-meta">${count} mentions in 24h</div>
        </div>
    `).join('');
}

// Search by keyword
function searchKeyword(keyword) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = keyword;
    searchQuery = keyword;
    updateDisplay();
}

// Show specific feed
function showFeed(feed) {
    currentFeed = feed;
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.toggle('active', 
            button.textContent.toLowerCase().includes(feed) ||
            (feed === 'all' && button.textContent === 'All News')
        );
    });
    updateDisplay();
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    updateDisplay();
});

// Initialize
fetchAllFeeds();

// Refresh every 5 minutes
setInterval(fetchAllFeeds, 5 * 60 * 1000);
