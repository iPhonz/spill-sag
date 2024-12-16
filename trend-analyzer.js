class TrendAnalyzer {
    constructor() {
        // Initialize named entity patterns
        this.patterns = {
            // People names (including titles)
            names: /(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.) ?[A-Z][a-z]+ [A-Z][a-z]+|[A-Z][a-z]+ (?:[A-Z][a-z]+ )?[A-Z][a-z]+/g,
            
            // Organizations and companies
            organizations: /(?:[A-Z][a-z&]+ )*(?:Inc\.|Corp\.|LLC|Ltd\.|Company|Association|Organization|University|Institute)/g,
            
            // Popular brands and products
            brands: [
                // Tech companies and products
                'Apple', 'Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'iPhone',
                'Android', 'ChatGPT', 'OpenAI', 'PlayStation', 'Xbox', 'Nintendo',
                
                // Entertainment brands
                'Disney', 'Marvel', 'Warner Bros', 'Sony', 'HBO', 'Spotify', 'Universal',
                
                // Sports brands
                'Nike', 'Adidas', 'NBA', 'NFL', 'MLB', 'NHL', 'FIFA',
                
                // Social media
                'Twitter', 'Instagram', 'TikTok', 'Snapchat', 'LinkedIn', 'YouTube'
            ],

            // Sports teams
            teams: [
                'Lakers', 'Warriors', 'Celtics', 'Bulls', '76ers', 'Heat',
                'Cowboys', 'Patriots', '49ers', 'Chiefs', 'Eagles', 'Packers',
                'Yankees', 'Red Sox', 'Dodgers', 'Cubs', 'Mets',
                'Manchester United', 'Liverpool', 'Real Madrid', 'Barcelona'
            ],

            // Entertainment properties
            entertainment: [
                'Oscar', 'Emmy', 'Grammy', 'Golden Globe', 'Billboard',
                'Box Office', 'Hollywood', 'Broadway', 'Netflix Original',
                'Premier League', 'World Cup', 'Super Bowl', 'Olympics'
            ],

            // Tech terms
            tech: [
                'Artificial Intelligence', 'AI', 'Machine Learning', 'ML',
                'Blockchain', 'Crypto', 'NFT', 'Bitcoin', 'Ethereum',
                'Cloud Computing', 'Virtual Reality', 'VR', 'Augmented Reality', 'AR',
                '5G', 'Quantum Computing', 'Cybersecurity'
            ]
        };

        // Important phrase patterns
        this.phrasePatterns = [
            // Breaking news patterns
            /breaking news|just announced|exclusive|officially|confirms|announces|releases|launches/i,
            
            // Time sensitivity
            /latest|upcoming|new release|premiere|debut|first look/i,
            
            // Business terms
            /partnership|acquisition|merger|investment|funding|revenue|earnings/i,
            
            // Entertainment
            /box office|streaming|performance|concert|tour|album|movie|series/i,
            
            // Sports
            /championship|playoff|season|match|game|tournament|victory|defeat|score|record/i,
            
            // Tech
            /update|version|feature|platform|service|device|product|software|hardware/i
        ];

        // Topic relationships
        this.topicRelations = {
            movies: ['entertainment', 'streaming', 'box office'],
            music: ['entertainment', 'streaming', 'concert'],
            sports: ['game', 'match', 'player', 'team'],
            tech: ['ai', 'software', 'device', 'platform'],
            money: ['market', 'investment', 'revenue'],
            popculture: ['celebrity', 'social', 'trending']
        };

        // Initialize trend tracking
        this.trendHistory = new Map();
        this.entityContext = new Map();
    }

    extractEntities(text, topic) {
        const entities = new Set();
        const addEntity = (entity, type) => {
            if (entity && entity.length > 1) {
                const entityObj = {
                    text: entity.trim(),
                    type: type,
                    topic: topic
                };
                entities.add(JSON.stringify(entityObj));
            }
        };

        // Extract names and organizations
        const names = text.match(this.patterns.names) || [];
        names.forEach(name => addEntity(name, 'name'));

        const orgs = text.match(this.patterns.organizations) || [];
        orgs.forEach(org => addEntity(org, 'organization'));

        // Check for known entities
        Object.entries(this.patterns).forEach(([type, patterns]) => {
            if (Array.isArray(patterns)) {
                patterns.forEach(pattern => {
                    if (text.toLowerCase().includes(pattern.toLowerCase())) {
                        addEntity(pattern, type);
                    }
                });
            }
        });

        // Extract multi-word phrases
        this.phrasePatterns.forEach(pattern => {
            const matches = text.match(pattern) || [];
            matches.forEach(match => addEntity(match, 'phrase'));
        });

        return Array.from(entities).map(e => JSON.parse(e));
    }

    updateEntityContext(entity, article) {
        const key = `${entity.type}:${entity.text}`;
        if (!this.entityContext.has(key)) {
            this.entityContext.set(key, {
                mentions: 0,
                topics: new Set(),
                articles: new Set(),
                firstSeen: new Date(),
                type: entity.type
            });
        }

        const context = this.entityContext.get(key);
        context.mentions++;
        context.topics.add(article.topic);
        context.articles.add(article.url);
    }

    calculateTrendScore(entity, now) {
        const context = this.entityContext.get(`${entity.type}:${entity.text}`);
        if (!context) return 0;

        // Base metrics
        const mentionScore = Math.log2(context.mentions + 1) * 2;
        const topicDiversityScore = context.topics.size * 1.5;
        const articleUniquenessScore = context.articles.size;

        // Type-based importance
        const typeMultipliers = {
            name: 1.3,        // People are highly relevant
            organization: 1.2, // Organizations are important
            brand: 1.15,      // Brands are notable
            team: 1.1,        // Sports teams
            entertainment: 1.1,// Entertainment properties
            tech: 1.15,       // Tech terms are significant
            phrase: 1.05      // Phrases get slight boost
        };

        // Cross-topic bonus
        const crossTopicBonus = this.calculateCrossTopicBonus(context.topics);

        // Recency factor
        const ageInHours = (now - context.firstSeen) / (1000 * 60 * 60);
        const recencyScore = Math.exp(-ageInHours / 24); // Exponential decay

        // Combine scores
        return (
            mentionScore * 0.3 +
            topicDiversityScore * 0.2 +
            articleUniquenessScore * 0.2 +
            crossTopicBonus * 0.2 +
            recencyScore * 0.1
        ) * (typeMultipliers[context.type] || 1);
    }

    calculateCrossTopicBonus(topics) {
        const topicsArray = Array.from(topics);
        let bonus = 1;

        topicsArray.forEach(topic => {
            const relatedTopics = this.topicRelations[topic] || [];
            topicsArray.forEach(otherTopic => {
                if (topic !== otherTopic && relatedTopics.some(rel => 
                    otherTopic.toLowerCase().includes(rel)
                )) {
                    bonus += 0.5; // Bonus for each related topic pair
                }
            });
        });

        return bonus;
    }

    analyzeTrends(articles) {
        const now = new Date();
        const cutoffTime = new Date(now - 24 * 60 * 60 * 1000);

        // Reset context for fresh analysis
        this.entityContext.clear();

        // Process recent articles
        const recentArticles = articles.filter(article => 
            new Date(article.date_published) >= cutoffTime
        );

        // Extract and process entities
        recentArticles.forEach(article => {
            const text = `${article.title} ${article.description || ''}`;
            const entities = this.extractEntities(text, article.topic);

            entities.forEach(entity => {
                this.updateEntityContext(entity, article);
            });
        });

        // Calculate trends
        const trends = Array.from(this.entityContext.entries())
            .map(([key, context]) => {
                const [type, text] = key.split(':');
                return {
                    entity: text,
                    type: type,
                    score: this.calculateTrendScore({ type, text }, now),
                    mentions: context.mentions,
                    topics: Array.from(context.topics)
                };
            })
            .filter(trend => trend.mentions > 1) // Filter out single mentions
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        return trends;
    }
}
