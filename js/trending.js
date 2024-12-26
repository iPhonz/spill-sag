import { RSS_FEEDS } from './config.js';

export function initTrending() {
    fetchAndDisplayArticles('all');
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
                date: new Date(item.date_published)
            }));
        })
    );

    return articles
        .flat()
        .sort((a, b) => b.date - a.date)
        .slice(0, 12);
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
                    <time>${article.date.toLocaleDateString()}</time>
                </div>
            </div>
        </article>
    `).join('');
}

function updateTrendingTopics(articles) {
    const topicsContainer = document.getElementById('topics-list');
    if (!topicsContainer) return;

    const topics = aggregateTopics(articles);
    
    topicsContainer.innerHTML = topics.map(topic => `
        <div class="topic-item">
            <span class="topic-name">${topic.name}</span>
            <div class="topic-meta">
                <span>${topic.count} mentions in ${topic.categories.length} topics</span>
                <span class="category-tag">${topic.categories[0]}</span>
            </div>
        </div>
    `).join('');
}

function aggregateTopics(articles) {
    const topics = {};
    
    articles.forEach(article => {
        const words = article.title.split(' ');
        words.forEach(word => {
            if (word.length > 3) {
                if (!topics[word]) {
                    topics[word] = {
                        name: word,
                        count: 0,
                        categories: new Set()
                    };
                }
                topics[word].count++;
                if (article.category) {
                    topics[word].categories.add(article.category);
                }
            }
        });
    });

    return Object.values(topics)
        .map(topic => ({
            ...topic,
            categories: Array.from(topic.categories)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
}