// State
let state = {
    articles: [],
    feed: 'all',
    search: ''
};

// RSS Feeds
const feeds = {
    movies: 'https://rss.app/feeds/v1.1/_6QzByBP0Y0E9bL0O.json',
    music: 'https://rss.app/feeds/v1.1/_p1hbSzosU9dbDQWx.json',
    money: 'https://rss.app/feeds/v1.1/_fcZVOvvC7xA6iz8u.json',
    popculture: 'https://rss.app/feeds/v1.1/_8Tib7bkE02swlmp7.json',
    sports: 'https://rss.app/feeds/v1.1/_5pZybCiMDbl5fBo8.json',
    tech: 'https://rss.app/feeds/v1.1/_GNEAg9D5CvYRIxAQ.json'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEvents();
    loadContent();
    updateTime();
    updateWeather();
    
    // Refresh
    setInterval(loadContent, 5 * 60 * 1000);
    setInterval(updateTime, 60 * 1000);
    setInterval(updateWeather, 15 * 60 * 1000);
});

// Event Handlers
function setupEvents() {
    // Search
    const search = document.getElementById('searchInput');
    if (search) {
        search.addEventListener('input', e => {
            state.search = e.target.value;
            updateArticles();
            updateTrends();
        });
    }

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const feed = e.target.dataset.feed;
            if (feed) {
                state.feed = feed;
                document.querySelectorAll('.nav-btn').forEach(b => 
                    b.classList.toggle('active', b === e.target)
                );
                updateArticles();
                updateTrends();
            }
        });
    });
}

// Load Content
async function loadContent() {
    try {
        console.log('Loading content...');
        const articlePromises = Object.entries(feeds).map(async ([topic, url]) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            return (data.items || []).map(item => ({ ...item, topic }));
        });

        state.articles = (await Promise.all(articlePromises)).flat();
        console.log(`Loaded ${state.articles.length} articles`);

        updateArticles();
        updateTrends();
    } catch (error) {
        console.error('Error loading content:', error);
        showError('Failed to load content');
    }
}

// Update Articles
function updateArticles() {
    const container = document.getElementById('articles');
    if (!container) return;

    let articles = [...state.articles];

    // Apply filters
    if (state.feed !== 'all') {
        articles = articles.filter(a => a.topic === state.feed);
    }
    if (state.search) {
        const query = state.search.toLowerCase();
        articles = articles.filter(a => 
            a.title.toLowerCase().includes(query) ||
            (a.description || '').toLowerCase().includes(query)
        );
    }

    // Sort by date
    articles.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

    // Render
    if (articles.length === 0) {
        container.innerHTML = '<div class="loading">No articles found</div>';
        return;
    }

    container.innerHTML = articles.map(article => `
        <div class="article" onclick="window.open('${article.url}', '_blank')">
            ${article.image ? `
                <img class="article-img" 
                     src="${article.image}" 
                     alt="${article.title}"
                     onerror="this.style.display='none'">
            ` : ''}
            <div class="article-content">
                <h3 class="article-title">${article.title}</h3>
                <div class="article-meta">
                    <span>${new Date(article.date_published).toLocaleDateString()}</span>
                    <span>${article.topic}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Update Trends
function updateTrends() {
    const container = document.getElementById('trends');
    if (!container) return;

    // Get last 24h articles
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);
    const recentArticles = state.articles.filter(a => 
        new Date(a.date_published) >= cutoff
    );

    // Extract entities
    const entities = new Map();
    recentArticles.forEach(article => {
        const words = extractKeywords(article.title + ' ' + (article.description || ''));
        words.forEach(word => {
            if (!entities.has(word)) {
                entities.set(word, {
                    count: 0,
                    topics: new Set()
                });
            }
            const entity = entities.get(word);
            entity.count++;
            entity.topics.add(article.topic);
        });
    });

    // Get top trends
    const trends = Array.from(entities.entries())
        .map(([text, data]) => ({
            text,
            count: data.count,
            topics: Array.from(data.topics)
        }))
        .filter(trend => trend.count > 1)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Render
    if (trends.length === 0) {
        container.innerHTML = '<div class="loading">No trends found</div>';
        return;
    }

    container.innerHTML = trends.map(trend => `
        <div class="trend" onclick="searchKeyword('${trend.text}')">
            <div class="trend-title">${trend.text}</div>
            <div class="trend-meta">
                ${trend.count} mentions in ${trend.topics.join(', ')}
            </div>
        </div>
    `).join('');
}

// Extract Keywords
function extractKeywords(text) {
    const commonWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
        'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at']);

    return text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => 
            word.length > 3 && 
            !commonWords.has(word) &&
            !/^\d+$/.test(word)
        );
}

// Update Weather
async function updateWeather() {
    const weatherElem = document.getElementById('weatherTemp');
    if (!weatherElem) return;

    try {
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?` +
            `latitude=${pos.coords.latitude}&` +
            `longitude=${pos.coords.longitude}&` +
            `current_weather=true&temperature_unit=fahrenheit`
        );

        if (!res.ok) throw new Error('Weather API error');
        const data = await res.json();
        const temp = Math.round(data.current_weather.temperature);
        weatherElem.textContent = `${temp}°F`;
    } catch (error) {
        console.error('Weather error:', error);
        weatherElem.textContent = '--°F';
    }
}

// Update Time
function updateTime() {
    const timeElem = document.getElementById('localTime');
    if (!timeElem) return;

    const now = new Date();
    timeElem.textContent = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Helper Functions
function showError(message) {
    document.getElementById('articles').innerHTML = 
        `<div class="loading error">${message}</div>`;
}

function searchKeyword(keyword) {
    if (!keyword) return;
    const search = document.getElementById('searchInput');
    if (search) {
        search.value = keyword;
        state.search = keyword;
        updateArticles();
    }
}