class TrendAnalyzer {
    constructor() {
        this.topics = {
            movies: ['movie', 'film', 'actor', 'actress', 'director', 'cinema', 'trailer', 'cast'],
            popculture: ['celebrity', 'star', 'entertainment', 'viral', 'trend'],
            technology: ['tech', 'ai', 'software', 'app', 'digital']
        };
    }

    analyze(articles) {
        const mentions = new Map();
        const topicMap = new Map();
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - 24);

        // Group by entity and count mentions
        articles.forEach(article => {
            if (new Date(article.date_published) < cutoff) return;
            
            const entities = this.extractEntities(article);
            const topic = this.detectTopic(article);

            entities.forEach(entity => {
                if (!mentions.has(entity)) {
                    mentions.set(entity, {
                        count: 0,
                        articles: new Set(),
                        topics: new Set()
                    });
                }
                const data = mentions.get(entity);
                data.count++;
                data.articles.add(article);
                data.topics.add(topic);
            });
        });

        // Convert to array and format
        return Array.from(mentions.entries())
            .map(([entity, data]) => ({
                name: entity,
                count: data.count,
                topic: Array.from(data.topics)[0],
                display: `${data.count} mentions in ${data.topics.size} topic`,
                articles: Array.from(data.articles)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }

    extractEntities(article) {
        const entities = new Set();
        const text = `${article.title} ${article.description || ''}`;
        
        // Match proper nouns
        const properNouns = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
        properNouns.forEach(noun => {
            if (noun.length > 1 && !this.isCommonWord(noun)) {
                entities.add(noun);
            }
        });

        // Match quoted phrases
        const quotes = text.match(/"([^"]+)"/g) || [];
        quotes.forEach(quote => entities.add(quote.slice(1, -1)));

        return entities;
    }

    detectTopic(article) {
        const text = `${article.title} ${article.description || ''}`.toLowerCase();
        
        for (const [topic, keywords] of Object.entries(this.topics)) {
            if (keywords.some(word => text.includes(word))) {
                return topic;
            }
        }
        return 'general';
    }

    isCommonWord(word) {
        const common = ['The', 'This', 'That', 'These', 'Those', 'Here', 'There'];
        return common.includes(word);
    }
}