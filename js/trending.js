import { RSS_FEEDS } from './config.js';

export async function initTrending() {
    try {
        const articles = await fetchTrendingArticles();
        const topics = aggregateTopics(articles);
        renderTrendingArticles(articles);
        renderTrendingTopics(topics);
    } catch (error) {
        console.error('Error initializing trending content:', error);
    }
}

async function fetchTrendingArticles() {
    const feeds = Object.values(RSS_FEEDS);
    const articles = await Promise.all(
        feeds.map(async (feed) => {
            const response = await fetch(feed);
            const data = await response.json();
            return data.items.map(item => ({
                title: item.title,
                excerpt: item.description,
                link: item.url,
                category: item.categories?.[0] || '',
                date: new Date(item.date_published)
            }));
        })
    );
    return articles.flat().sort((a, b) => b.date - a.date).slice(0, 10);
}

function aggregateTopics(articles) {
    const topicCount = articles.reduce((acc, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(topicCount)
        .map(([name, count]) => ({ 
            name, 
            count: formatCount(count * 1000) // Simulated engagement metrics
        }))
        .sort((a, b) => parseInt(b.count) - parseInt(a.count));
}

function formatCount(num) {
    return num > 999 ? `${(num/1000).toFixed(1)}K` : num;
}

function renderTrendingArticles(articles) {
    const container = document.getElementById('trending-articles');
    if (!container) return;
    
    container.innerHTML = articles.map(article => `
        <article>
            <h3><a href="${article.link}" target="_blank">${article.title}</a></h3>
            <p>${article.excerpt}</p>
            <div class="article-meta">
                <span class="category">${article.category}</span>
                <span class="date">${article.date.toLocaleDateString()}</span>
            </div>
        </article>
    `).join('');
}

function renderTrendingTopics(topics) {
    const container = document.getElementById('trending-topics-list');
    if (!container) return;

    container.innerHTML = topics.map(topic => `
        <div class="trending-topics-item">
            <span class="topic-name">${topic.name}</span>
            <span class="topic-count">${topic.count}</span>
        </div>
    `).join('');
}
