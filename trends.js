class TrendAnalyzer {
  constructor() {
    this.wordCounts = new Map();
    this.trends = [];
    this.categories = ['movies', 'popculture', 'technology'];
  }

  analyze(articles) {
    this.wordCounts.clear();
    this.trends = [];
    
    // Count word frequencies and track article references
    articles.forEach(article => {
      const words = this.extractWords(article);
      words.forEach(({word, category}) => {
        if (!this.wordCounts.has(word)) {
          this.wordCounts.set(word, {
            count: 0,
            articles: new Set(),
            categories: new Set()
          });
        }
        const data = this.wordCounts.get(word);
        data.count++;
        data.articles.add(article);
        if (category) data.categories.add(category);
      });
    });

    // Convert to trends array
    this.trends = Array.from(this.wordCounts.entries())
      .map(([word, data]) => ({
        text: word,
        count: data.count,
        articles: Array.from(data.articles),
        category: Array.from(data.categories)[0] || 'general',
        display: `${data.count} mentions in 1 topic`
      }))
      .filter(trend => trend.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return this.trends;
  }

  extractWords(article) {
    const text = `${article.title} ${article.description || ''}`;
    const words = [];

    // Extract quoted phrases
    const quotes = text.match(/"([^"]+)"|'([^']+)'/g) || [];
    quotes.forEach(quote => {
      const word = quote.slice(1, -1);
      if (this.isValidPhrase(word)) {
        words.push({word, category: this.detectCategory(text)});
      }
    });

    // Extract title case words (likely names/titles)
    const titleWords = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    titleWords.forEach(word => {
      if (this.isValidPhrase(word)) {
        words.push({word, category: this.detectCategory(text)});
      }
    });

    return words;
  }

  isValidPhrase(phrase) {
    if (phrase.length < 2) return false;
    if (/^(The|A|An|This|That|These|Those|From|To|In|On|At|By|For)\b/i.test(phrase)) return false;
    if (/^[0-9]+$/.test(phrase)) return false;
    return true;
  }

  detectCategory(text) {
    const lowerText = text.toLowerCase();
    
    if (/movie|film|actor|actress|director|cast|premiere/.test(lowerText)) return 'movies';
    if (/star|celebrity|viral|trending|famous/.test(lowerText)) return 'popculture';
    if (/tech|ai|software|app|digital|startup/.test(lowerText)) return 'technology';
    
    return null;
  }
}

class TrendDisplay {
  constructor() {
    this.ticker = document.getElementById('trendingTicker');
    this.sidebar = document.getElementById('trendingTopics');
  }

  update(trends) {
    if (this.ticker) {
      this.ticker.innerHTML = trends.map(trend =>
        `<div class="trend-item" onclick="showTrendArticles('${encodeURIComponent(trend.text)}')">
          ${trend.text} (${trend.count})
        </div>`
      ).join('');
    }

    if (this.sidebar) {
      this.sidebar.innerHTML = trends.map(trend =>
        `<div class="trending-topic" onclick="showTrendArticles('${encodeURIComponent(trend.text)}')">
          <div class="topic-name">${trend.text}</div>
          <div class="topic-meta">
            <span>${trend.display}</span>
            <span class="topic-category">${trend.category}</span>
          </div>
        </div>`
      ).join('');
    }
  }
}

const trendAnalyzer = new TrendAnalyzer();
const trendDisplay = new TrendDisplay();

function updateTrends(articles) {
  const trends = trendAnalyzer.analyze(articles);
  trendDisplay.update(trends);
}

function showTrendArticles(trendText) {
  const trend = trendAnalyzer.trends.find(t => t.text === decodeURIComponent(trendText));
  if (trend && window.app) {
    window.app.filterArticles(trend.articles);
  }
}