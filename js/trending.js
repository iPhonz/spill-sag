export function initTrending() {
    initTrendingArticles();
    initTrendingTopics();
}

function initTrendingArticles() {
    const articles = [
        {
            title: 'Sample Article 1',
            excerpt: 'This is a sample article excerpt...'
        },
        {
            title: 'Sample Article 2',
            excerpt: 'Another sample article excerpt...'
        }
    ];

    const container = document.getElementById('trending-articles');
    if (container) {
        articles.forEach(article => {
            const articleElement = createArticleElement(article);
            container.appendChild(articleElement);
        });
    }
}

function createArticleElement(article) {
    const articleElement = document.createElement('article');
    articleElement.innerHTML = `
        <h3>${article.title}</h3>
        <p>${article.excerpt}</p>
    `;
    return articleElement;
}

function initTrendingTopics() {
    const topics = [
        { name: 'Trend 1', count: '10K' },
        { name: 'Trend 2', count: '5K' }
    ];

    const container = document.getElementById('trending-topics-list');
    if (container) {
        topics.forEach(topic => {
            const topicElement = createTopicElement(topic);
            container.appendChild(topicElement);
        });
    }
}

function createTopicElement(topic) {
    const topicElement = document.createElement('div');
    topicElement.className = 'trending-topics-item';
    topicElement.innerHTML = `
        <span class="topic-name">${topic.name}</span>
        <span class="topic-count">${topic.count}</span>
    `;
    return topicElement;
}