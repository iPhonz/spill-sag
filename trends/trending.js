// RSS Feed URLs
const feeds = {
    movies: 'https://rss.app/feeds/v1.1/_6QzByBP0Y0E9bL0O.json',
    music: 'https://rss.app/feeds/v1.1/_p1hbSzosU9dbDQWx.json',
    money: 'https://rss.app/feeds/v1.1/_fcZVOvvC7xA6iz8u.json',
    popculture: 'https://rss.app/feeds/v1.1/_8Tib7bkE02swlmp7.json',
    sports: 'https://rss.app/feeds/v1.1/_5pZybCiMDbl5fBo8.json',
    tech: 'https://rss.app/feeds/v1.1/_GNEAg9D5CvYRIxAQ.json'
};

// Store for analyzed data
let allArticles = [];
let keywordHistory = {};
let currentTimeframe = '24h';

// Common words to exclude
const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
    'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
    'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
    'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
    'any', 'these', 'give', 'day', 'most', 'us'
]);

// Theme toggle functionality
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode'));
}

// Load saved theme
if (localStorage.getItem('dark-mode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Fetch feed data
async function fetchFeed(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error(`Error fetching feed: ${url}`, error);
        return [];
    }
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

// Update timeframe selection
function updateTimeframe(timeframe) {
    currentTimeframe = timeframe;
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase().includes(timeframe));
    });
    analyzeAndDisplayTrends();
}
