// State management with loading states per feed
const state = {
    articles: [],
    currentFeed: 'all',
    searchQuery: '',
    loading: false,
    feedStates: {},  // Track loading state per feed
    error: null,
    initialized: false
};

// RSS Feed URLs
const feeds = {
    movies: 'https://rss.app/feeds/v1.1/_6QzByBP0Y0E9bL0O.json',
    music: 'https://rss.app/feeds/v1.1/_p1hbSzosU9dbDQWx.json',
    money: 'https://rss.app/feeds/v1.1/_fcZVOvvC7xA6iz8u.json',
    popculture: 'https://rss.app/feeds/v1.1/_8Tib7bkE02swlmp7.json',
    sports: 'https://rss.app/feeds/v1.1/_5pZybCiMDbl5fBo8.json',
    tech: 'https://rss.app/feeds/v1.1/_GNEAg9D5CvYRIxAQ.json',
    fashion: 'https://rss.app/feeds/v1.1/_X9X9xi6xSA6xfdiQ.json',
    fitness: 'https://rss.app/feeds/v1.1/_ZyirDaQbugpe4PNr.json',
    food: 'https://rss.app/feeds/v1.1/_6RwC4gFPZtiWlR0F.json',
    gaming: 'https://rss.app/feeds/v1.1/_AYgIOThx2i44ju3d.json'
};

// Initialize feed states
Object.keys(feeds).forEach(feed => {
    state.feedStates[feed] = {
        loading: false,
        error: null,
        lastUpdated: null
    };
});

// Initialize immediately with improved loading management
document.addEventListener('DOMContentLoaded', () => {
    log('App initializing...');
    setupEventListeners();
    initializeContent();
});

// [Previous code unchanged...]

// Enhanced trending functionality with topic weighting
function analyzeTrends() {
    if (!state.articles.length) return [];

    const trends = new Map();
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    // Topic weights for trend calculation
    const topicWeights = {
        breaking: 2.0,    // Breaking news gets highest priority
        tech: 1.2,       // Tech news often has high impact
        money: 1.2,      // Financial news is important
        popculture: 1.1, // Pop culture trends spread quickly
        sports: 1.1,     // Sports events have high engagement
        gaming: 1.1,     // Gaming news spreads rapidly
        fashion: 1.0,    // Standard weight for fashion
        fitness: 1.0,    // Standard weight for fitness
        food: 1.0,       // Standard weight for food
        movies: 1.0,     // Standard weight for entertainment
        music: 1.0       // Standard weight for music
    };

    state.articles.forEach(article => {
        if (new Date(article.date_published) >= cutoff) {
            const entities = extractEntities(article);
            const weight = topicWeights[article.topic] || 1.0;

            entities.forEach(entity => {
                if (!entity.text) return;
                
                const key = entity.text.toLowerCase();
                const trend = trends.get(key) || {
                    text: entity.text,
                    count: 0,
                    weightedCount: 0,
                    topics: new Set(),
                    articles: new Set()
                };

                trend.count++;
                trend.weightedCount += weight;
                trend.topics.add(article.topic);
                trend.articles.add(article.url);
                trends.set(key, trend);
            });
        }
    });

    return Array.from(trends.values())
        .filter(trend => trend.count > 1)
        .map(trend => ({
            ...trend,
            topics: Array.from(trend.topics),
            articles: Array.from(trend.articles)
        }))
        .sort((a, b) => b.weightedCount - a.weightedCount)
        .slice(0, 10);
}

// Enhanced entity extraction
function extractEntities(article) {
    const entities = new Set();
    const text = `${article.title} ${article.description || ''}`;

    // Enhanced named entity patterns
    const patterns = [
        // Named entities (people, companies, etc.)
        /[A-Z][a-z]+ (?:[A-Z][a-z]+ )*[A-Z][a-z]+/g,
        // Hashtags and trending topics
        /#[A-Za-z]\w+/g,
        // Product names (e.g., iPhone 15, PS5)
        /(?:[A-Z][a-z]*|[A-Z]+) ?(?:\d+|[A-Z]+)[A-Za-z0-9]*/g,
        // Events and shows (e.g., E3 2024, WWDC 2024)
        /[A-Z0-9]+ ?20\d{2}/g
    ];

    patterns.forEach(pattern => {
        const matches = text.match(pattern) || [];
        matches.forEach(match => {
            if (match.length > 3) { // Filter out very short matches
                entities.add({ text: match });
            }
        });
    });

    return Array.from(entities);
}

// [Rest of the code unchanged...]