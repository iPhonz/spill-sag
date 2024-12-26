// Advanced trending analysis system
class TrendAnalyzer {
    constructor() {
        this.stopWords = new Set([
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had',
            'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may',
            'might', 'must', 'can', 'could'
        ]);

        // Known entity patterns
        this.entityPatterns = {
            properNoun: /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/,
            hashtag: /#[A-Za-z]\w+/,
            quotedPhrase: /"[^"]+"/,
            technicalTerm: /^(?:AI|ML|API|SDK|UI|UX|iOS|AWS|GPU|CPU|NFT|DAO|DeFi|Web3)\b/i
        };

        this.minimumWordLength = 3;
        this.minimumPhraseOccurrence = 2;
        this.maxPhraseLengthWords = 4;
        this.recentTimeWeight = 1.5;
    }

    extractPhrases(text) {
        // Split into sentences for better context
        const sentences = text.split(/[.!?]+/).filter(Boolean);
        const phrases = new Map();

        sentences.forEach(sentence => {
            // Extract potential entities and phrases
            this.extractEntitiesFromSentence(sentence, phrases);
        });

        return Array.from(phrases.keys());
    }

    extractEntitiesFromSentence(sentence, phrases) {
        // Clean the sentence
        const cleanSentence = sentence.trim();
        
        // Extract quoted phrases
        const quotedMatches = cleanSentence.match(/"([^"]+)"/g) || [];
        quotedMatches.forEach(match => {
            const phrase = match.slice(1, -1);
            if (this.isSignificantPhrase(phrase)) {
                phrases.set(phrase.toLowerCase(), true);
            }
        });

        // Extract proper nouns and technical terms
        const words = cleanSentence.split(/\s+/);
        let i = 0;
        while (i < words.length) {
            // Check for multi-word proper nouns
            let j = i + 1;
            let properNoun = words[i];
            while (j < words.length && 
                   words[j].charAt(0) === words[j].charAt(0).toUpperCase() && 
                   !this.stopWords.has(words[j].toLowerCase())) {
                properNoun += ' ' + words[j];
                j++;
            }
            
            if (this.isSignificantPhrase(properNoun)) {
                phrases.set(properNoun.toLowerCase(), true);
            }
            
            i = j || i + 1;
        }
    }

    isSignificantPhrase(phrase) {
        if (!phrase || phrase.length < this.minimumWordLength) return false;
        
        // Check against entity patterns
        return Object.values(this.entityPatterns).some(pattern => 
            pattern.test(phrase)
        );
    }

    analyzeTrends(articles) {
        const trendingPhrases = new Map();
        const phraseArticles = new Map();
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - 24);

        articles.forEach(article => {
            const pubDate = new Date(article.date_published);
            if (pubDate >= cutoffTime) {
                const text = `${article.title} ${article.description || ''}`;
                const phrases = this.extractPhrases(text);

                phrases.forEach(phrase => {
                    trendingPhrases.set(phrase, (trendingPhrases.get(phrase) || 0) + 1);
                    if (!phraseArticles.has(phrase)) phraseArticles.set(phrase, new Set());
                    phraseArticles.get(phrase).add(article);
                });
            }
        });

        // Calculate trend scores and sort
        const trends = Array.from(trendingPhrases.entries())
            .map(([phrase, count]) => ({
                phrase,
                count,
                articles: Array.from(phraseArticles.get(phrase)),
                score: this.calculateTrendScore(count, phraseArticles.get(phrase), cutoffTime),
                type: this.classifyTrendType(phrase)
            }))
            .filter(trend => trend.count >= this.minimumPhraseOccurrence)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        return trends;
    }

    classifyTrendType(phrase) {
        if (this.entityPatterns.properNoun.test(phrase)) return 'name';
        if (this.entityPatterns.technicalTerm.test(phrase)) return 'tech';
        if (this.entityPatterns.hashtag.test(phrase)) return 'topic';
        if (this.entityPatterns.quotedPhrase.test(phrase)) return 'phrase';
        return 'general';
    }

    calculateTrendScore(occurrences, articles, cutoffTime) {
        const baseScore = occurrences * Math.log2(articles.size + 1);
        const recencyBonus = this.calculateRecencyBonus(articles, cutoffTime);
        const diversityBonus = this.calculateDiversityBonus(articles);
        
        return baseScore * recencyBonus * diversityBonus;
    }

    calculateRecencyBonus(articles, cutoffTime) {
        const now = new Date();
        const recencyScores = Array.from(articles).map(article => {
            const ageInHours = (now - new Date(article.date_published)) / (1000 * 60 * 60);
            return Math.exp(-ageInHours / 24) * this.recentTimeWeight;
        });
        return recencyScores.reduce((a, b) => a + b, 0) / recencyScores.length;
    }

    calculateDiversityBonus(articles) {
        const uniqueSources = new Set(Array.from(articles).map(a => a.source)).size;
        return 1 + Math.log2(uniqueSources + 1) / 2;
    }
}
