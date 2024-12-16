// Initialize trend analyzer
const trendAnalyzer = new TrendAnalyzer();

// Update trending section with new analysis
function updateTrending() {
    const trends = trendAnalyzer.analyzeTrends(allArticles);
    const trendingContainer = document.getElementById('trendingContainer');

    trendingContainer.innerHTML = trends.map(trend => `
        <div class="trending-item" onclick="searchKeyword('${trend.phrase}')">
            <div class="trending-keyword">${trend.phrase}</div>
            <div class="trending-meta">
                ${trend.count} mentions in ${trend.articles.length} articles
            </div>
        </div>
    `).join('');
}

// Enhanced search functionality
function searchKeyword(keyword) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = keyword;
    searchQuery = keyword;
    
    // Update URL to reflect search
    const url = new URL(window.location);
    url.searchParams.set('q', keyword);
    window.history.pushState({}, '', url);
    
    updateDisplay();
}

// Initialize technical terms and known entities
trendAnalyzer.technicalTerms = new Set([
    'ai', 'blockchain', 'crypto', 'nft', 'metaverse',
    'streaming', 'smartphone', 'cybersecurity', 'spotify',
    'netflix', 'amazon', 'apple', 'google', 'microsoft',
    'tesla', 'bitcoin', 'ethereum'
]);

trendAnalyzer.knownEntities = [
    // People
    'Taylor Swift', 'Beyonce', 'Drake', 'Tom Cruise',
    'Leonardo DiCaprio', 'Elon Musk', 'Mark Zuckerberg',
    
    // Companies
    'Apple', 'Google', 'Microsoft', 'Amazon', 'Netflix',
    'Disney', 'Sony', 'Warner Bros', 'Universal',
    
    // Products
    'iPhone', 'PlayStation', 'Xbox', 'ChatGPT', 'Android',
    
    // Events
    'Super Bowl', 'Olympics', 'World Cup', 'Grammy',
    'Oscar', 'Emmy', 'Golden Globe',
    
    // Sports Teams
    'Lakers', 'Warriors', 'Yankees', 'Real Madrid',
    'Manchester United', 'Barcelona'
];

// Load initial state from URL
function loadInitialState() {
    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get('q');
    if (queryParam) {
        searchInput.value = queryParam;
        searchQuery = queryParam;
    }
    
    const topicParam = params.get('topic');
    if (topicParam && Object.keys(feeds).includes(topicParam)) {
        currentFeed = topicParam;
    }
}

// Initialize
loadInitialState();
fetchAllFeeds();

// Refresh every 5 minutes
setInterval(fetchAllFeeds, 5 * 60 * 1000);
