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

// Fetch individual feed
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
    const articleGrid = document.getElementById('articleGrid');
    articleGrid.innerHTML = '<div class="loading">Loading articles...</div>';

    try {
        const feedPromises = Object.entries(feeds).map(async ([topic, url]) => {
            const articles = await fetchFeed(url);
            return articles.map(article => ({ ...article, topic }));
        });

        allArticles = (await Promise.all(feedPromises)).flat();
        updateDisplay();
        updateTrending();
    } catch (error) {
        articleGrid.innerHTML = `<div class="error">Failed to load feeds: ${error.message}</div>`;
    }
}

// Update article display
function updateDisplay() {
    const articleGrid = document.getElementById('articleGrid');
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

    articleGrid.innerHTML = filteredArticles.map(article => `
        <article class="article-card" onclick="window.open('${article.url}', '_blank')">
            ${article.image ? `
                <div class="article-image-container">
                    <img src="${article.image}" alt="${article.title}" class="article-image">
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
    `).join('') || '<div class="no-results">No articles found</div>';
}

// Extract keywords for trending
function extractKeywords(text) {
    const commonWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
        'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but',
        'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
        'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about',
        'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
        'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some',
        'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
        'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our',
        'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
        'give', 'day', 'most', 'us', 'says', 'said', 'going', 'way', 'ways', 'made',
        'make', 'makes', 'look', 'looks', 'looking', 'saw', 'see', 'sees', 'start',
        'starts', 'started', 'year', 'years', 'month', 'months', 'day', 'days']);

    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => 
            word.length > 2 && 
            !commonWords.has(word) && 
            !/^\d+$/.test(word)
        );

    // Extract multi-word phrases
    const phrases = [];
    for (let i = 0; i < words.length - 1; i++) {
        const twoWords = `${words[i]} ${words[i + 1]}`;
        if (isSignificantPhrase(twoWords)) {
            phrases.push(twoWords);
        }
        if (i < words.length - 2) {
            const threeWords = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
            if (isSignificantPhrase(threeWords)) {
                phrases.push(threeWords);
            }
        }
    }

    return [...words, ...phrases];
}

// Check if a phrase is significant
function isSignificantPhrase(phrase) {
    const significantPhrases = new Set([
        'taylor swift', 'artificial intelligence', 'machine learning', 'box office',
        'stock market', 'real estate', 'social media', 'virtual reality', 'cloud computing',
        'climate change', 'electric vehicle', 'streaming service', 'live stream',
        'music industry', 'film industry', 'tech industry', 'breaking news',
        'latest update', 'official statement', 'new release', 'world premiere'
    ]);

    return significantPhrases.has(phrase.toLowerCase());
}

// Update trending topics
function updateTrending() {
    const keywords = {};
    const keywordArticles = {};
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

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
        .filter(([_, count]) => count > 1) // Only show keywords mentioned more than once
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    trendingContainer.innerHTML = topKeywords.map(([keyword, count]) => `
        <div class="trending-item" onclick="searchKeyword('${keyword}')">
            <div class="trending-keyword">${keyword}</div>
            <div class="trending-meta">${count} mentions in 24h</div>
        </div>
    `).join('');
}

// Search functionality
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
