class TrendAnalyzer {
    constructor() {
        // Initialize patterns for entity detection
        this.patterns = {
            names: /(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.) ?[A-Z][a-z]+ [A-Z][a-z]+|[A-Z][a-z]+ (?:[A-Z][a-z]+ )?[A-Z][a-z]+/g,
            organizations: /(?:[A-Z][a-z&]+ )*(?:Inc\.|Corp\.|LLC|Ltd\.|Company|Association|Organization|University|Institute)/g,
            brands: [
                'Apple', 'Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'iPhone',
                'Android', 'ChatGPT', 'OpenAI', 'PlayStation', 'Xbox', 'Nintendo',
                'Disney', 'Marvel', 'Warner Bros', 'Sony', 'HBO', 'Spotify', 'Universal'
            ],
            teams: [
                'Lakers', 'Warriors', 'Celtics', 'Bulls', '76ers', 'Heat',
                'Cowboys', 'Patriots', '49ers', 'Chiefs', 'Eagles', 'Packers'
            ]
        };

        this.commonWords = new Set([
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
            'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
            'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
            'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which'
        ]);
    }

    extractEntities(text) {
        if (!text) return [];
        
        const entities = new Set();
        
        try {
            // Extract names
            const names = text.match(this.patterns.names) || [];
            names.forEach(name => {
                entities.add({ text: name.trim(), type: 'name' });
            });

            // Extract organizations
            const orgs = text.match(this.patterns.organizations) || [];
            orgs.forEach(org => {
                entities.add({ text: org.trim(), type: 'organization' });
            });

            // Check for known entities
            this.patterns.brands.forEach(brand => {
                if (text.toLowerCase().includes(brand.toLowerCase())) {
                    entities.add({ text: brand, type: 'brand' });
                }
            });

            this.patterns.teams.forEach(team => {
                if (text.toLowerCase().includes(team.toLowerCase())) {
                    entities.add({ text: team, type: 'team' });
                }
            });

        } catch (error) {
            console.error('Error extracting entities:', error);
        }

        return Array.from(entities);
    }

    analyzeTrends(articles) {
        if (!Array.isArray(articles) || articles.length === 0) {
            return [];
        }

        const trends = new Map();
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - 24);

        try {
            articles.forEach(article => {
                if (new Date(article.date_published) >= cutoff) {
                    const text = `${article.title} ${article.description || ''}`;
                    const entities = this.extractEntities(text);
                    
                    entities.forEach(entity => {
                        const key = `${entity.type}:${entity.text}`;
                        const trend = trends.get(key) || {
                            entity: entity.text,
                            type: entity.type,
                            mentions: 0,
                            topics: new Set()
                        };
                        
                        trend.mentions++;
                        trend.topics.add(article.topic);
                        trends.set(key, trend);
                    });
                }
            });

            return Array.from(trends.values())
                .map(trend => ({
                    ...trend,
                    topics: Array.from(trend.topics)
                }))
                .filter(trend => trend.mentions > 1)
                .sort((a, b) => b.mentions - a.mentions)
                .slice(0, 10);

        } catch (error) {
            console.error('Error analyzing trends:', error);
            return [];
        }
    }
}

// Create global instance
const trendAnalyzer = new TrendAnalyzer();
