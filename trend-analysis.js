// Advanced trending analysis system
class TrendAnalyzer {
    constructor() {
        // Common words to filter out
        this.stopWords = new Set([
            // Common articles, prepositions, etc.
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            // Common verbs and auxiliary words
            'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had',
            'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may',
            'might', 'must', 'can', 'could',
            // Common adjectives and adverbs
            'very', 'really', 'good', 'new', 'first', 'last', 'long', 'great',
            'little', 'own', 'other', 'old', 'right', 'big', 'high', 'different',
            // Common action words
            'says', 'said', 'went', 'got', 'made', 'came', 'take', 'make',
            'see', 'look', 'come', 'think', 'know',
            // Time-related words
            'now', 'today', 'tomorrow', 'yesterday', 'week', 'month', 'year',
            'time', 'day', 'date', 'moment', 'after', 'before', 'early', 'late',
            // Common conjunctions
            'and', 'but', 'or', 'nor', 'for', 'yet', 'so',
            // Other common words
            'just', 'more', 'much', 'how', 'what', 'when', 'where', 'who',
            'which', 'why', 'way', 'than', 'well', 'also', 'any', 'all'
        ]);

        this.minimumWordLength = 3;
        this.minimumPhraseOccurrence = 2;
        this.maxPhraseLengthWords = 4;
    }

    // Extract meaningful phrases from text
    extractPhrases(text) {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => 
                word.length >= this.minimumWordLength &&
                !this.stopWords.has(word) &&
                !/^\d+$/.test(word)
            );

        const phrases = [];
        
        // Single words (if significant)
        words.forEach(word => {
            if (this.isSignificantWord(word)) {
                phrases.push(word);
            }
        });

        // Multi-word phrases
        for (let i = 0; i < words.length; i++) {
            for (let len = 2; len <= this.maxPhraseLengthWords && i + len <= words.length; len++) {
                const phrase = words.slice(i, i + len).join(' ');
                if (this.isSignificantPhrase(phrase)) {
                    phrases.push(phrase);
                }
            }
        }

        return phrases;
    }

    // Determine if a single word is significant
    isSignificantWord(word) {
        // Check if it's a proper noun (capitalized in original text)
        const isProperNoun = word.charAt(0) === word.charAt(0).toUpperCase();
        
        // Check if it's a technical term or known entity
        const isTechnicalTerm = this.technicalTerms.has(word);
        
        return isProperNoun || isTechnicalTerm;
    }

    // Determine if a phrase is significant
    isSignificantPhrase(phrase) {
        // Skip if all words are stop words
        if (phrase.split(' ').every(word => this.stopWords.has(word))) {
            return false;
        }

        // Check if it's a known entity or title
        return this.knownEntities.some(entity => 
            phrase.includes(entity.toLowerCase())
        );
    }

    // Analyze trends from articles
    analyzeTrends(articles) {
        const trendingPhrases = {};
        const phraseArticles = {};
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - 24);

        // First pass: collect all phrases
        articles.forEach(article => {
            const pubDate = new Date(article.date_published);
            if (pubDate >= cutoffTime) {
                const text = `${article.title} ${article.description || ''}`;
                const phrases = this.extractPhrases(text);

                phrases.forEach(phrase => {
                    trendingPhrases[phrase] = (trendingPhrases[phrase] || 0) + 1;
                    if (!phraseArticles[phrase]) phraseArticles[phrase] = new Set();
                    phraseArticles[phrase].add(article);
                });
            }
        });

        // Second pass: calculate trend scores
        const trends = Object.entries(trendingPhrases)
            .map(([phrase, count]) => ({
                phrase,
                count,
                articles: Array.from(phraseArticles[phrase]),
                score: this.calculateTrendScore(count, phraseArticles[phrase].size)
            }))
            .filter(trend => trend.count >= this.minimumPhraseOccurrence)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        return trends;
    }

    // Calculate trend score based on multiple factors
    calculateTrendScore(occurrences, uniqueArticles) {
        const baseScore = occurrences * Math.log2(uniqueArticles + 1);
        const recencyBonus = this.calculateRecencyBonus(uniqueArticles);
        return baseScore * recencyBonus;
    }

    // Calculate bonus for recent articles
    calculateRecencyBonus(articles) {
        const now = new Date();
        const recencyScores = articles.map(article => {
            const ageInHours = (now - new Date(article.date_published)) / (1000 * 60 * 60);
            return Math.exp(-ageInHours / 24); // Exponential decay
        });
        return recencyScores.reduce((a, b) => a + b, 0) / recencyScores.length;
    }
}
