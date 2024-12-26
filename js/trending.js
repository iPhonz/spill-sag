import { RSS_FEEDS } from './config.js';

class TrendAnalyzer {
    constructor() {
        this.stopWords = new Set([
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had',
            'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may',
            'might', 'must', 'can', 'could',
            'very', 'really', 'good', 'new', 'first', 'last', 'long', 'great',
            'little', 'own', 'other', 'old', 'right', 'big', 'high', 'different'
        ]);

        this.minimumWordLength = 3;
        this.minimumOccurrence = 2;
        this.maxPhraseLengthWords = 4;
    }

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
        words.forEach(word => phrases.push(word));

        for (let i = 0; i < words.length; i++) {
            for (let len = 2; len <= this.maxPhraseLengthWords && i + len <= words.length; len++) {
                const phrase = words.slice(i, i + len).join(' ');
                phrases.push(phrase);
            }
        }

        return phrases;
    }

    calculateTrendScore(occurrences, uniqueArticles, articles) {
        const baseScore = occurrences * Math.log2(uniqueArticles + 1);
        const recencyBonus = this.calculateRecencyBonus(articles);
        return baseScore * recencyBonus;
    }

    calculateRecencyBonus(articles) {
        const now = new Date();
        const recencyScores = articles.map(article => {
            const ageInHours = (now - new Date(article.date_published)) / (1000 * 60 * 60);
            return Math.exp(-ageInHours / 24);
        });
        return recencyScores.reduce((a, b) => a + b, 0) / recencyScores.length;
    }
}

const analyzer = new TrendAnalyzer();

export async function initTrending() {
    await fetchAndDisplayArticles('all');
}

export async function fetchAndDisplayArticles(category) {
    const grid = document.getElementById('article-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading">Loading articles...</div>';

    try {
        const articles = await fetchArticles(category);
        renderArticles(articles, grid);
        updateTrendingTopics(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        grid.innerHTML = '<div class="error">Error loading articles</div>';
    }
}

async function fetchArticles(category) {
    const feeds = category === 'all' ? 
        Object.values(RSS_FEEDS) : 
        [RSS_FEEDS[category]];

    const articles = await Promise.all(
        feeds.map(async (feed) => {
            const response = await fetch(feed);
            const data = await response.json();
            return data.items.map(item => ({
                title: item.title,
                description: item.description,
                image: item.image || item.thumbnail,
                link: item.url,
                category: item.category,
                date_published: item.date_published
            }));
        })
    );

    return articles.flat().sort((a, b) => 
        new Date(b.date_published) - new Date(a.date_published)
    ).slice(0, 12);
}

function renderArticles(articles, container) {
    container.innerHTML = articles.map(article => `
        <article class="article-card">
            ${article.image ? `<img src="${article.image}" class="article-image" alt="">` : ''}
            <div class="article-content">
                <h3><a href="${article.link}" target="_blank">${article.title}</a></h3>
                <p>${article.description || ''}</p>
                <div class="article-meta">
                    <span class="category-tag">${article.category || ''}</span>
                    <time>${new Date(article.date_published).toLocaleDateString()}</time>
                </div>
            </div>
        </article>
    `).join('');
}

function updateTrendingTopics(articles) {
    const trendingPhrases = {};
    const phraseArticles = {};
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 24);

    articles.forEach(article => {
        const pubDate = new Date(article.date_published);
        if (pubDate >= cutoffTime) {
            const text = `${article.title} ${article.description || ''}`;
            const phrases = analyzer.extractPhrases(text);

            phrases.forEach(phrase => {
                trendingPhrases[phrase] = (trendingPhrases[phrase] || 0) + 1;
                if (!phraseArticles[phrase]) phraseArticles[phrase] = new Set();
                phraseArticles[phrase].add(article);
            });
        }
    });

    const trends = Object.entries(trendingPhrases)
        .map(([phrase, count]) => ({
            phrase,
            count,
            articles: Array.from(phraseArticles[phrase]),
            score: analyzer.calculateTrendScore(
                count,
                phraseArticles[phrase].size,
                Array.from(phraseArticles[phrase])
            )
        }))
        .filter(trend => trend.count >= analyzer.minimumOccurrence)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    renderTrendingTopics(trends);
}

function renderTrendingTopics(trends) {
    const container = document.getElementById('topics-list');
    if (!container) return;

    container.innerHTML = trends.map(trend => `
        <div class="topic-item">
            <span class="topic-name">${trend.phrase}</span>
            <div class="topic-meta">
                <span>${trend.count} mentions in ${trend.articles.length} articles</span>
            </div>
        </div>
    `).join('');
}
