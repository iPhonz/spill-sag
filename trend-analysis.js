class TrendAnalyzer {
    constructor() {
        this.topics = {
            movies: ['movie', 'film', 'actor', 'actress', 'director', 'cinema', 'trailer', 'cast', 'starring'],
            popculture: ['celebrity', 'star', 'entertainment', 'featured', 'viral', 'trend', 'popular'],
            technology: ['tech', 'ai', 'software', 'app', 'digital', 'innovation']
        };

        this.titlePatterns = [
            /"([^"]+)"/g,                          // Quoted titles
            /'([^']+)'/g,                          // Single-quoted titles
            /(?:starring in|directed|film|movie)\s+([A-Z][^\s.:;,!?]+(?:\s+[A-Z][^\s.:;,!?]+)*)/g,  // Movie titles
            /(?:new|upcoming|latest)\s+([A-Z][^\s.:;,!?]+(?:\s+[A-Z][^\s.:;,!?]+)*)/g,  // New releases
        ];

        this.namePatterns = [
            /(?:actor|actress|director|star)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,  // Industry roles
            /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:stars|features|plays|directs)/g,    // Action associations
            /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|was|will be|has been)/g,         // Status descriptions
        ];
    }

    analyze(articles) {
        const mentions = new Map();
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - 24);

        articles.forEach(article => {
            if (new Date(article.date_published) < cutoff) return;
            
            const text = `${article.title} ${article.description || ''}`;
            const topic = this.detectTopic(text);
            
            // Extract meaningful entities
            const entities = [
                ...this.extractNames(text),
                ...this.extractTitles(text)
            ];

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

        return this.formatTrends(mentions);
    }

    extractNames(text) {
        const names = new Set();
        this.namePatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                const name = match[1].trim();
                if (this.isValidName(name)) {
                    names.add(name);
                }
            }
        });
        return names;
    }

    extractTitles(text) {
        const titles = new Set();
        this.titlePatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                const title = match[1].trim();
                if (this.isValidTitle(title)) {
                    titles.add(title);
                }
            }
        });
        return titles;
    }

    isValidName(name) {
        return (
            name.length > 3 &&
            /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(name) &&
            !this.isCommonWord(name)
        );
    }

    isValidTitle(title) {
        return (
            title.length > 3 &&
            !/^(the|a|an|this|that|these|those|from|with|by)$/i.test(title) &&
            title.split(/\s+/).length <= 8
        );
    }

    detectTopic(text) {
        const lowercaseText = text.toLowerCase();
        for (const [topic, keywords] of Object.entries(this.topics)) {
            if (keywords.some(word => lowercaseText.includes(word))) {
                return topic;
            }
        }
        return 'general';
    }

    isCommonWord(word) {
        const commonWords = new Set([
            'The', 'This', 'That', 'From', 'With', 'About', 'After',
            'Before', 'Between', 'During', 'Through', 'Today', 'Tomorrow',
            'Yesterday', 'Now', 'Then', 'When', 'Where', 'Here', 'There'
        ]);
        return commonWords.has(word);
    }

    formatTrends(mentions) {
        return Array.from(mentions.entries())
            .map(([entity, data]) => ({
                name: entity,
                count: data.count,
                topic: Array.from(data.topics)[0],
                topics: Array.from(data.topics),
                display: `${data.count} mentions in ${data.topics.size} topic`,
                articles: Array.from(data.articles)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
}