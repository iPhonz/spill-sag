import { RSS_FEEDS } from './config.js';

export async function initTicker() {
    const tickerContent = document.querySelector('.ticker-content');
    if (!tickerContent) return;

    try {
        const trends = await fetchTrendingTopics();
        renderTicker(trends, tickerContent);
    } catch (error) {
        console.error('Error initializing ticker:', error);
    }
}

async function fetchTrendingTopics() {
    const allTopics = [];
    
    for (const [category, url] of Object.entries(RSS_FEEDS)) {
        const response = await fetch(url);
        const data = await response.json();
        
        data.items.forEach(item => {
            if (item.title && item.engagement_rate) {
                allTopics.push({
                    title: item.title,
                    count: item.engagement_rate,
                    category
                });
            }
        });
    }

    return allTopics
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
}

function renderTicker(trends, container) {
    const content = trends.map(trend => `
        <div class="ticker-item">
            <span class="ticker-title">${trend.title}</span>
            <span class="ticker-count">${formatCount(trend.count)}</span>
        </div>
    `).join('');

    // Double the content for seamless loop
    container.innerHTML = content + content;
}

function formatCount(num) {
    return num > 999 ? `${(num/1000).toFixed(1)}K` : num;
}