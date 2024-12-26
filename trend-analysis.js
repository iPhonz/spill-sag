class TrendAnalyzer {
    constructor() {
        this.topicCategories = {
            movies: ['film', 'movie', 'cinema', 'actor', 'actress', 'director'],
            music: ['song', 'album', 'artist', 'band', 'singer', 'rapper'],
            sports: ['team', 'player', 'game', 'match', 'tournament'],
            technology: ['tech', 'ai', 'app', 'device', 'software'],
            popculture: ['celebrity', 'star', 'trend', 'viral', 'social media']
        };

        this.stopWords = new Set([
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'
        ]);
    }

    analyzeTrends(articles) {
        const mentions = new Map();
        const articlesByMention = new Map();
        const topicsByMention = new Map();

        articles.forEach(article => {
            const text = `${article.title} ${article.description || ''}`;
            const entities = this.extractEntities(text);
            const topic = this.categorizeArticle(text);

            entities.forEach(entity => {
                mentions.set(entity, (mentions.get(entity) || 0) + 1);
                
                if (!articlesByMention.has(entity)) {
                    articlesByMention.set(entity, new Set());
                    topicsByMention.set(entity, new Set());
                }
                
                articlesByMention.get(entity).add(article);
                topicsByMention.get(entity).add(topic);
            });
        });

        return Array.from(mentions.entries())
            .map(([entity, count]) => ({
                phrase: entity,
                count,
                articles: Array.from(articlesByMention.get(entity)),
                topics: Array.from(topicsByMention.get(entity)),
                displayCount: `${count} mentions in ${topicsByMention.get(entity).size} topic`
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }

    extractEntities(text) {
        const words = text.split(/\s+/);
        const entities = new Set();

        // Extract proper nouns (capitalized words)
        for (let i = 0; i < words.length; i++) {
            if (/^[A-Z][a-zA-Z]*$/.test(words[i]) && !this.stopWords.has(words[i].toLowerCase())) {
                let entity = words[i];
                
                // Check for multi-word proper nouns
                while (i + 1 < words.length && /^[A-Z][a-zA-Z]*$/.test(words[i + 1])) {
                    entity += ' ' + words[i + 1];
                    i++;
                }
                
                entities.add(entity);
            }
        }

        return entities;
    }

    categorizeArticle(text) {
        const lowercaseText = text.toLowerCase();
        
        for (const [category, keywords] of Object.entries(this.topicCategories)) {
            if (keywords.some(keyword => lowercaseText.includes(keyword))) {
                return category;
            }
        }
        
        return 'general';
    }
}