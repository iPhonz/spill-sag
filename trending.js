// RSS Feed URLs and state management
const feeds = {
    movies: 'https://rss.app/feeds/v1.1/_6QzByBP0Y0E9bL0O.json',
    music: 'https://rss.app/feeds/v1.1/_p1hbSzosU9dbDQWx.json',
    money: 'https://rss.app/feeds/v1.1/_fcZVOvvC7xA6iz8u.json',
    popculture: 'https://rss.app/feeds/v1.1/_8Tib7bkE02swlmp7.json',
    sports: 'https://rss.app/feeds/v1.1/_5pZybCiMDbl5fBo8.json',
    tech: 'https://rss.app/feeds/v1.1/_GNEAg9D5CvYRIxAQ.json'
};

let allArticles = [];
let currentFeed = 'all';
let searchQuery = '';

// Common words to exclude from trending analysis
const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which'
]);

// Fetch and process feeds
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

async function fetchAllFeeds() {
    try {
        const feedPromises = Object.entries(feeds).map(async ([topic, url]) => {
            const articles = await fetchFeed(url);
            return articles.map(article => ({ ...article, topic }));
        });

        allArticles = (await Promise.all(feedPromises)).flat();
        updateDisplay();
        updateTrending();
    } catch (error) {
        console.error('Error fetching feeds:', error);
        document.getElementById('feedContainer').innerHTML = 
            `<div class="error">Failed to load feeds: ${error.message}</div>`;
    }
}

// Display functions
function updateDisplay() {
    const container = document.getElementById('feedContainer');
    let filteredArticles = allArticles;

    // Apply feed filter
    if (currentFeed !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.topic === currentFeed);
    }

    // Apply search filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredArticles = filteredArticles.filter(article => 
            article.title.toLowerCase().includes(query) ||
            (article.description || '').toLowerCase().includes(query)
        );
    }

    // Sort by date
    filteredArticles.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

    // Display articles
    container.innerHTML = filteredArticles.map(article => `
        <article class="news-item" onclick="window.open('${article.url}', '_blank')">
            <h2>${article.title}</h2>
            <p>${article.description || ''}</p>
            ${article.image ? `<img src="${article.image}" alt="${article.title}" class="news-image">` : ''}
            <div class="news-meta">
                <span>${new Date(article.date_published).toLocaleDateString()}</span>
                <span>${article.topic.charAt(0).toUpperCase() + article.topic.slice(1)}</span>
            </div>
        </article>
    `).join('') || '<div class="no-results">No articles found</div>';
}

// Trending analysis functions
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

function updateTrending() {
    const keywords = {};
    const keywordArticles = {};

    // Analyze last 24 hours of articles
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

    // Display top keywords
    const trendingContainer = document.getElementById('trendingContainer');
    const topKeywords = Object.entries(keywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    trendingContainer.innerHTML = topKeywords.map(([keyword, count]) => `
        <div class="trending-item" onclick="searchKeyword('${keyword}')">
            <div class="trending-keyword">${keyword}</div>
            <div class="trending-meta">${count} mentions</div>
        </div>
    `).join('');
}

function searchKeyword(keyword) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = keyword;
    searchQuery = keyword;
    updateDisplay();
}

function showFeed(feed) {
    currentFeed = feed;
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.textContent.toLowerCase().includes(feed));
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

// Refresh feeds every 5 minutes
setInterval(fetchAllFeeds, 5 * 60 * 1000);
