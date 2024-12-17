// State management
const state = {
    articles: [],
    currentFeed: 'all',
    searchQuery: '',
    loading: false,
    error: null
};

// RSS Feed URLs
const feeds = {
    movies: 'https://rss.app/feeds/v1.1/_6QzByBP0Y0E9bL0O.json',
    music: 'https://rss.app/feeds/v1.1/_p1hbSzosU9dbDQWx.json',
    money: 'https://rss.app/feeds/v1.1/_fcZVOvvC7xA6iz8u.json',
    popculture: 'https://rss.app/feeds/v1.1/_8Tib7bkE02swlmp7.json',
    sports: 'https://rss.app/feeds/v1.1/_5pZybCiMDbl5fBo8.json',
    tech: 'https://rss.app/feeds/v1.1/_GNEAg9D5CvYRIxAQ.json'
};

// Fetch feed data
async function fetchFeed(topic, url) {
    console.log(`Fetching ${topic} feed...`);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log(`${topic} feed fetched successfully`);
        return data.items || [];
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
        console.log('Starting feed load...');
        const feedPromises = Object.entries(feeds).map(([topic, url]) => 
            fetchFeed(topic, url).then(items => items.map(item => ({ ...item, topic })))
        );

        state.articles = (await Promise.all(feedPromises)).flat();
        console.log(`Loaded ${state.articles.length} articles`);

        if (state.articles.length === 0) {
            throw new Error('No articles found');
        }

        updateDisplay();
        updateTrending();
    } catch (error) {
        console.error('Error loading feeds:', error);
        state.error = error.message;
        articleGrid.innerHTML = `
            <div class="error">
                Failed to load articles: ${error.message}
                <button onclick="loadFeeds()" class="retry-button">Retry</button>
            </div>
        `;
    } finally {
        state.loading = false;
    }
}

// Update article display
function updateDisplay() {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid || state.loading) return;

    let articles = [...state.articles];

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

    articles.sort((a, b) => new Date(b.date_published) - new Date(a.date_published));

    if (articles.length === 0) {
        articleGrid.innerHTML = '<div class="no-results">No articles found</div>';
        return;
    }

    articleGrid.innerHTML = articles.map(article => `
        <article class="article-card" onclick="window.open('${article.url}', '_blank')">
            ${article.image ? `
                <div class="article-image-container">
                    <img 
                        src="${article.image}" 
                        alt="${article.title}" 
                        class="article-image"
                        onerror="this.style.display='none'"
                    >
                </div>
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

// Update trending topics
function updateTrending() {
    const trendingContainer = document.getElementById('trendingContainer');
    if (!trendingContainer || !state.articles.length) return;

    try {
        console.log('Analyzing trends...');
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - 24);

        // Count entity mentions
        const mentions = {};
        state.articles.forEach(article => {
            if (new Date(article.date_published) >= cutoff) {
                const text = `${article.title} ${article.description || ''}`;
                extractEntities(text, article.topic).forEach(entity => {
                    const key = `${entity.type}:${entity.text}`;
                    if (!mentions[key]) {
                        mentions[key] = {
                            entity: entity.text,
                            type: entity.type,
                            count: 0,
                            topics: new Set()
                        };
                    }
                    mentions[key].count++;
                    mentions[key].topics.add(article.topic);
                });
            }
        });

        // Convert to array and sort
        const trends = Object.values(mentions)
            .filter(m => m.count > 1)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map(m => ({
                ...m,
                topics: Array.from(m.topics)
            }));

        console.log('Trends analyzed:', trends);

        // Update display
        trendingContainer.innerHTML = trends.map(trend => `
            <div class="trending-item" onclick="searchKeyword('${trend.entity}')">
                <div class="trending-header">
                    ${getTrendIcon(trend.type)}
                    <div class="trending-keyword">${trend.entity}</div>
                </div>
                <div class="trending-meta">
                    ${trend.count} mentions in ${trend.topics.length} ${trend.topics.length === 1 ? 'topic' : 'topics'}
                    <div class="topic-badges">
                        ${trend.topics.map(topic => 
                            `<span class="topic-badge">${topic}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error updating trends:', error);
        trendingContainer.innerHTML = '<div class="error">Error analyzing trends</div>';
    }
}

// Helper functions
function getTrendIcon(type) {
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

function extractEntities(text, topic) {
    const entities = [];

    // Named entities (people, organizations)
    const namePattern = /[A-Z][a-z]+ (?:[A-Z][a-z]+ )?[A-Z][a-z]+/g;
    const names = text.match(namePattern) || [];
    names.forEach(name => entities.push({ text: name, type: 'name', topic }));

    // Return unique entities
    return Array.from(new Set(entities.map(e => JSON.stringify(e)))).map(e => JSON.parse(e));
}

function searchKeyword(keyword) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = keyword;
        state.searchQuery = keyword;
        updateDisplay();
    }
}

function switchFeed(feed) {
    state.currentFeed = feed;
    
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.toggle('active', button.dataset.feed === feed);
    });

    updateDisplay();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing app...');
    
    // Set up search
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
