import { RSS_FEEDS, CATEGORIES } from './config.js';

async function fetchFeed(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error fetching feed: ${url}`, error);
    return [];
  }
}

export async function loadContent(category = 'all') {
  const grid = document.getElementById('article-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="loading">Loading articles...</div>';

  try {
    const url = RSS_FEEDS[category];
    const items = await fetchFeed(url);
    
    const articles = items.map(item => ({
      title: item.title,
      description: item.description,
      image: item.image || item.thumbnail,
      link: item.url,
      category: item.category,
      date: new Date(item.date_published)
    }));

    renderArticles(articles, grid);
    updateTrendingTopics(articles);
  } catch (error) {
    grid.innerHTML = '<div class="error">Error loading articles</div>';
    console.error('Error:', error);
  }
}

function renderArticles(articles, container) {
  container.innerHTML = articles.map(article => `
    <article class="article-card">
      ${article.image ? `
        <div class="article-image-container">
          <img src="${article.image}" class="article-image" alt="">
        </div>
      ` : ''}
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
  const topics = {};
  
  articles.forEach(article => {
    const words = article.title.split(' ');
    words.forEach(word => {
      if (word.length > 3) {
        topics[word] = (topics[word] || 0) + 1;
      }
    });
  });

  const sortedTopics = Object.entries(topics)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const container = document.getElementById('topics-list');
  if (!container) return;

  container.innerHTML = sortedTopics.map(([topic, count]) => `
    <div class="topic-item">
      <span class="topic-name">${topic}</span>
      <div class="topic-meta">
        <span>${count} mentions</span>
      </div>
    </div>
  `).join('');
}