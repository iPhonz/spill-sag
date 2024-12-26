import { extractTrends } from './trends.js';

export async function initTicker() {
  const ticker = document.querySelector('.ticker-content');
  if (!ticker) return;

  try {
    const articles = await fetchAllArticles();
    const trends = extractTrends(articles);
    renderTicker(trends, ticker);
    startTickerAnimation(ticker);
  } catch (error) {
    console.error('Ticker error:', error);
  }
}

async function fetchAllArticles() {
  const feedPromises = Object.values(RSS_FEEDS).map(url =>
    fetch(url)
      .then(r => r.json())
      .then(data => data.items || [])
      .catch(() => [])
  );

  const results = await Promise.all(feedPromises);
  return results.flat().map(item => ({
    title: item.title,
    description: item.description,
    date: new Date(item.date_published)
  }));
}

function renderTicker(trends, container) {
  const content = trends.map(trend =>
    `<div class="ticker-item">
        <span class="trend-name">${trend.phrase}</span>
        <span class="trend-count">(${trend.count})</span>
     </div>`
  ).join('');

  container.innerHTML = content + content; // Double for seamless loop
}

function startTickerAnimation(ticker) {
  ticker.style.animation = 'ticker 30s linear infinite';
}