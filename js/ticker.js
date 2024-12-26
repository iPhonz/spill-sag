import { RSS_FEEDS } from './config.js';

export async function initTicker() {
  const ticker = document.querySelector('.ticker-content');
  if (!ticker) return;

  try {
    const allItems = await Promise.all(
      Object.values(RSS_FEEDS).map(url => fetch(url)
        .then(r => r.json())
        .then(data => data.items || [])
        .catch(() => [])
      )
    );

    const trends = allItems
      .flat()
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
      .map(item => ({
        title: item.title,
        count: Math.floor(Math.random() * 100) + 1
      }));

    renderTicker(trends, ticker);
  } catch (error) {
    console.error('Ticker error:', error);
  }
}

function renderTicker(trends, container) {
  const content = trends.map(trend =>
    `<div class="ticker-item">${trend.title} (${trend.count})</div>`
  ).join('');

  container.innerHTML = content + content;
  container.style.animation = 'ticker 30s linear infinite';
}