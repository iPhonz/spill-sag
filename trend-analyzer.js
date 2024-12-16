class AdvancedTrendAnalyzer {
    constructor() {
        this.knownEntities = new Set();
        this.entityContext = new Map();
        this.loadPatterns();
    }

    loadPatterns() {
        // Named entity patterns
        this.namePattern = /[A-Z][a-z]+ (?:[A-Z][a-z]+ )*[A-Z][a-z]+/g;
        this.organizationPattern = /(?:[A-Z][a-z]+ )*(?:Inc\.|Corp\.|LLC|Ltd\.|Company|Association|Organization)/g;
        this.brandPattern = /(?:Apple|Google|Microsoft|Amazon|Netflix|Disney|Sony|Samsung|Tesla|Twitter|Meta|Instagram|TikTok|Snapchat|LinkedIn)/g;
        this.sportsPattern = /(?:NFL|NBA|MLB|NHL|UEFA|FIFA|Lakers|Warriors|49ers|Chiefs|Yankees|Red Sox|Manchester United|Liverpool|Real Madrid|Barcelona)/g;
        this.entertainmentPattern = /(?:Marvel|Disney|Netflix|HBO|Spotify|Grammy|Oscar|Emmy|Golden Globe|Billboard|Box Office)/g;
        this.techPattern = /(?:AI|Artificial Intelligence|Machine Learning|Blockchain|Crypto|NFT|Bitcoin|Ethereum|iOS|Android|ChatGPT|OpenAI|Cloud Computing)/g;

        // Common multi-word phrases that indicate significance
        this.significantPhrases = new Set([
            'breaking news', 'exclusive report', 'just announced', 'new release',
            'world premiere', 'official statement', 'latest update', 'first look',
            'box office', 'chart topping', 'award winning', 'record breaking'
        ]);
    }

    extractEntities(text, topic) {
        if (!text || typeof text !== 'string') return [];
        
        const entities = new Set();
        const addEntity = (match, type) => {
            if (match && match.length > 1) {
                const entity = match.trim();
                entities.add(entity);
                this.updateEntityContext(entity, topic, type);
            }
        };

        // Extract names and organizations
        const names = text.match(this.namePattern) || [];
        const orgs = text.match(this.organizationPattern) || [];
        const brands = text.match(this.brandPattern) || [];
        const sports = text.match(this.sportsPattern) || [];
        const entertainment = text.match(this.entertainmentPattern) || [];
        const tech = text.match(this.techPattern) || [];

        names.forEach(name => addEntity(name, 'name'));
        orgs.forEach(org => addEntity(org, 'org'));
        brands.forEach(brand => addEntity(brand, 'brand'));
        sports.forEach(sport => addEntity(sport, 'sports'));
        entertainment.forEach(ent => addEntity(ent, 'entertainment'));
        tech.forEach(tech => addEntity(tech, 'tech'));

        // Look for significant phrases
        this.significantPhrases.forEach(phrase => {
            if (text.toLowerCase().includes(phrase)) {
                addEntity(phrase, 'phrase');
            }
        });

        return Array.from(entities);
    }

    updateEntityContext(entity, topic, type) {
        if (!this.entityContext.has(entity)) {
            this.entityContext.set(entity, {
                topics: new Set(),
                mentions: 0,
                type: type,
                firstSeen: new Date()
            });
        }

        const context = this.entityContext.get(entity);
        context.topics.add(topic);
        context.mentions++;
        this.knownEntities.add(entity);
    }

    calculateTrendScore(entity, articles) {
        const context = this.entityContext.get(entity);
        if (!context) return 0;

        const now = new Date();
        const hoursSinceFirst = (now - context.firstSeen) / (1000 * 60 * 60);

        // Base metrics
        const mentionScore = Math.log2(context.mentions + 1) * 2;
        const topicDiversityScore = context.topics.size * 1.5;
        const recencyScore = articles
            .filter(article => article.title.includes(entity))
            .reduce((score, article) => {
                const ageInHours = (now - new Date(article.date_published)) / (1000 * 60 * 60);
                return score + Math.exp(-ageInHours / 24);
            }, 0);

        // Type-based bonuses
        const typeBonus = {
            'name': 1.2,    // Priority to named individuals
            'org': 1.1,     // Organizations
            'brand': 1.15,  // Brand names
            'sports': 1.1,  // Sports-related
            'entertainment': 1.1,  // Entertainment
            'tech': 1.15,   // Technology terms
            'phrase': 1.05  // Significant phrases
        }[context.type] || 1;

        // Combine scores with weights
        const finalScore = (mentionScore * 0.4 + 
                          topicDiversityScore * 0.3 + 
                          recencyScore * 0.3) * 
                          typeBonus;

        return finalScore;
    }

    analyzeTrends(articles) {
        if (!Array.isArray(articles) || articles.length === 0) return [];

        // Reset entity context for fresh analysis
        this.entityContext.clear();
        this.knownEntities.clear();

        // Process recent articles
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - 24);

        const recentArticles = articles.filter(article => 
            new Date(article.date_published) >= cutoffTime
        );

        // Extract entities from articles
        recentArticles.forEach(article => {
            const text = `${article.title} ${article.description || ''}`;
            this.extractEntities(text, article.topic);
        });

        // Calculate trend scores and sort
        const trends = Array.from(this.entityContext.entries())
            .map(([entity, context]) => ({
                entity,
                context,
                mentions: context.mentions,
                topics: Array.from(context.topics),
                score: this.calculateTrendScore(entity, recentArticles)
            }))
            .filter(trend => trend.mentions > 1 && trend.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        return trends;
    }
}
