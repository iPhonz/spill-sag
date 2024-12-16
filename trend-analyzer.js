class AdvancedTrendAnalyzer {
    constructor() {
        // Named entity patterns
        this.namePattern = /[A-Z][a-z]+ (?:[A-Z][a-z]+ )?[A-Z][a-z]+/g;
        this.organizationPattern = /(?:[A-Z][a-z]+ )*(?:Inc\.|Corp\.|LLC|Ltd\.|Company|Association|Organization)/g;
        this.brandPattern = /(?:Apple|Google|Microsoft|Amazon|Netflix|Disney|Sony|Samsung|Tesla|Twitter|Meta|Instagram|TikTok|Snapchat|LinkedIn)/g;
        
        // Sports teams and leagues
        this.sportsPattern = /(?:NFL|NBA|MLB|NHL|UEFA|FIFA|Lakers|Warriors|49ers|Chiefs|Yankees|Red Sox|Manchester United|Liverpool|Real Madrid|Barcelona)/g;
        
        // Entertainment entities
        this.entertainmentPattern = /(?:Marvel|Disney|Netflix|HBO|Spotify|Grammy|Oscar|Emmy|Golden Globe|Billboard|Box Office)/g;
        
        // Technology terms
        this.techPattern = /(?:AI|Artificial Intelligence|Machine Learning|Blockchain|Crypto|NFT|Bitcoin|Ethereum|iOS|Android|ChatGPT|OpenAI|Cloud Computing)/g;

        // Key phrase patterns
        this.phrasePatterns = [
            // News events
            /breaking news|just announced|exclusive|officially|confirms|announces|releases|launches/i,
            // Time-sensitive
            /latest|upcoming|new|recent|today|tonight|this week|this month/i,
            // Industry terms
            /collaboration|partnership|acquisition|merger|investment|funding|revenue|earnings/i,
            // Entertainment
            /premiere|debut|release date|box office|streaming|performance|concert|tour|album|movie|series/i,
            // Sports
            /championship|playoff|season|match|game|tournament|victory|defeat|score|record|contract/i,
            // Technology
            /update|version|feature|platform|service|device|product|software|hardware|app|application/i
        ];

        // Initialize named entity recognition sets
        this.knownEntities = new Set();
        this.entityContext = new Map();
    }

    // Extract named entities and meaningful phrases
    extractEntities(text, topic) {
        const entities = new Set();
        
        // Extract names and organizations
        const names = text.match(this.namePattern) || [];
        const orgs = text.match(this.organizationPattern) || [];
        const brands = text.match(this.brandPattern) || [];
        const sports = text.match(this.sportsPattern) || [];
        const entertainment = text.match(this.entertainmentPattern) || [];
        const tech = text.match(this.techPattern) || [];

        // Add all found entities
        [...names, ...orgs, ...brands, ...sports, ...entertainment, ...tech].forEach(entity => {
            entities.add(entity.trim());
            this.knownEntities.add(entity.trim());

            // Update entity context
            if (!this.entityContext.has(entity.trim())) {
                this.entityContext.set(entity.trim(), { topics: new Set(), mentions: 0 });
            }
            this.entityContext.get(entity.trim()).topics.add(topic);
            this.entityContext.get(entity.trim()).mentions++;
        });

        // Extract meaningful phrases
        this.phrasePatterns.forEach(pattern => {
            const matches = text.match(pattern) || [];
            matches.forEach(match => {
                if (this.isSignificantPhrase(match.trim())) {
                    entities.add(match.trim());
                }
            });
        });

        return Array.from(entities);
    }

    // Calculate trend score based on multiple factors
    calculateTrendScore(entity, articles) {
        const context = this.entityContext.get(entity) || { topics: new Set(), mentions: 0 };
        const now = new Date();

        // Calculate various factors
        const mentionScore = Math.log2(context.mentions + 1) * 2;
        const topicDiversityScore = context.topics.size * 1.5;
        const recencyScore = articles
            .filter(article => article.title.includes(entity))
            .reduce((score, article) => {
                const ageInHours = (now - new Date(article.date_published)) / (1000 * 60 * 60);
                return score + Math.exp(-ageInHours / 24);
            }, 0);

        // Combine scores with weights
        return (mentionScore * 0.4) + (topicDiversityScore * 0.3) + (recencyScore * 0.3);
    }

    // Check if a phrase is significant
    isSignificantPhrase(phrase) {
        // Length check
        if (phrase.length < 5 || phrase.length > 50) return false;

        // Must contain at least one substantial word
        const substantialWords = phrase.match(/\b\w{4,}\b/g);
        if (!substantialWords) return false;

        // Check for known entity overlaps
        if (Array.from(this.knownEntities).some(entity => 
            phrase.toLowerCase().includes(entity.toLowerCase())
        )) return true;

        // Check for contextual relevance
        return this.phrasePatterns.some(pattern => pattern.test(phrase));
    }

    // Analyze trends from articles
    analyzeTrends(articles) {
        const entityMentions = new Map();
        const entityArticles = new Map();
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - 24);

        // Process articles
        articles.forEach(article => {
            const pubDate = new Date(article.date_published);
            if (pubDate >= cutoffTime) {
                const text = `${article.title} ${article.description || ''}`;
                const entities = this.extractEntities(text, article.topic);

                entities.forEach(entity => {
                    entityMentions.set(entity, (entityMentions.get(entity) || 0) + 1);
                    if (!entityArticles.has(entity)) entityArticles.set(entity, []);
                    entityArticles.get(entity).push(article);
                });
            }
        });

        // Calculate trend scores
        const trends = Array.from(entityMentions.entries())
            .map(([entity, mentions]) => ({
                entity,
                mentions,
                articles: entityArticles.get(entity),
                score: this.calculateTrendScore(entity, entityArticles.get(entity))
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        return trends;
    }
}
